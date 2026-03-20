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
 * Client: On hydration the store is already populated from SSR.
 *         Only bootstraps the community store and validates persisted IDs.
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
    // ── Client-side: if store wasn't hydrated from SSR, try to init ─────────
    if (!userStore.isAuthenticated) {
      const { initAuth } = useAuth();
      await initAuth();
    }

    // Bootstrap community store for authenticated users
    if (userStore.isAuthenticated) {
      const communityStore = useCommunityStore();
      await communityStore.fetchCommunities();

      // Validate persisted currentCommunityId still exists in the list
      if (communityStore.currentCommunityId) {
        const exists = communityStore.communities.some(
          (c) => c.id === communityStore.currentCommunityId
        );
        if (!exists && communityStore.communities.length > 0) {
          communityStore.setCurrentCommunity(communityStore.communities[0]!.id);
        } else if (!exists) {
          communityStore.currentCommunityId = null;
        }
      } else if (communityStore.communities.length > 0) {
        const lastId = localStorage.getItem("lastCommunityId");
        const target =
          lastId && communityStore.communities.some((c) => c.id === lastId)
            ? lastId
            : communityStore.communities[0]!.id;
        communityStore.setCurrentCommunity(target);
      }
    }
  }
});
