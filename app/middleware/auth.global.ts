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
export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore();
  const isAuth = userStore.isAuthenticated;
  const isGuestRoute = to.path.startsWith("/auth/");

  if (isGuestRoute && isAuth) {
    return navigateTo("/");
  }

  if (!isGuestRoute && !isAuth) {
    return navigateTo("/auth/login");
  }

  // When an authenticated user hits /, redirect to their last/first community.
  // New users (no communities) stay on the landing page.
  if (to.path === "/" && isAuth) {
    try {
      const { communities } = await $fetch<{ communities: Array<{ id: string }> }>(
        "/api/users/me/communities",
        { headers: { Authorization: `Bearer ${userStore.accessToken}` } }
      );

      if (communities.length > 0) {
        const lastId = import.meta.client ? localStorage.getItem("lastCommunityId") : null;
        const target =
          lastId && communities.some((c) => c.id === lastId) ? lastId : communities[0].id;
        return navigateTo(`/community/${target}`, { replace: true });
      }
    } catch {
      // API error — show landing page
    }
  }
});
