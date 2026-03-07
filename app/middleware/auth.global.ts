/**
 * middleware/auth.global.ts
 *
 * Runs on every route navigation (client-side).
 *
 * Rules:
 *  - /auth/* routes  → accessible only when NOT authenticated
 *                      (redirect to / if already logged in)
 *  - All other routes → accessible only when authenticated
 *                      (redirect to /auth/login if not logged in)
 *
 * The /auth/2fa route is considered a guest route so the user can
 * complete the 2FA step before they have a full session.
 */
export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore();
  const isAuth = userStore.isAuthenticated;
  const isGuestRoute = to.path.startsWith("/auth/");

  if (isGuestRoute && isAuth) {
    return navigateTo("/");
  }

  if (!isGuestRoute && !isAuth) {
    return navigateTo("/auth/login");
  }
});
