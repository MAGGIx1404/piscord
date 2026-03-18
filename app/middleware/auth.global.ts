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

  // When an authenticated user hits /, redirect to their current/last community.
  // New users (no communities) stay on the landing page.
  if (to.path === "/" && isAuth) {
    const communityStore = useCommunityStore();

    // If the store hasn't loaded yet (edge case), fetch now
    if (!communityStore.loaded) {
      await communityStore.fetchCommunities();
    }

    if (communityStore.currentCommunityId) {
      return navigateTo(`/community/${communityStore.currentCommunityId}`, { replace: true });
    } else if (communityStore.communities.length > 0) {
      communityStore.setCurrentCommunity(communityStore.communities[0].id);
      return navigateTo(`/community/${communityStore.communities[0].id}`, { replace: true });
    }
    // No communities — show the landing page
  }
});
