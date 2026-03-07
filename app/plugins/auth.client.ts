/**
 * plugins/auth.client.ts
 *
 * Runs once on the client when the app starts.
 * Validates the persisted access token (or silently refreshes via cookie)
 * so the store reflects the real auth state before any middleware runs.
 */
export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuth();
  await initAuth();
});
