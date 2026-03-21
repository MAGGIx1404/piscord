/**
 * plugins/auth.ts
 *
 * Universal plugin (runs on both server and client).
 *
 * SSR:   Reads the userId from the request context (set by server middleware
 *        after verifying the access_token cookie), fetches user data, and
 *        populates the Pinia store so the first render already has the
 *        correct auth state — no login-page flicker.
 *
 * Client: On hydration validates the session against the server.
 */
export default defineNuxtPlugin(async () => {
  const userStore = useUserStore();

  if (import.meta.server) {
    // ── Server-side: populate store from cookie ──────────────────────────────
    const event = useRequestEvent();
    if (event?.context.userId) {
      // userId was set by server/middleware/routeGuard.ts after verifying token
      try {
        const data = await $fetch<{ user: any }>("/api/users/me", {
          headers: useRequestHeaders(["cookie"])
        });
        if (data.user) {
          userStore.setUser(data.user);
        }
      } catch {
        userStore.reset();
      }
    }
  }

  if (import.meta.client) {
    // ── Client-side: validate session against the server ───────────────────
    // On guest routes (/auth/*) the SSR routeGuard already confirmed the user
    // is unauthenticated — just clear any stale localStorage data.
    // On protected routes, always call initAuth() so we don't trust stale
    // localStorage blindly (e.g. DB wiped, token revoked, user deleted).
    const route = useRoute();
    if (route.path.startsWith("/auth/")) {
      userStore.reset();
    } else {
      const { initAuth } = useAuth();
      await initAuth();
    }
  }
});
