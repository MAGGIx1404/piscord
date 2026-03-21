export default defineNuxtRouteMiddleware(async (to) => {
  // During SSR the server middleware (routeGuard.ts) already handles redirects
  // before any HTML is sent. Skip here to avoid redirect loops (the user store
  // isn't hydrated yet at this point in the SSR lifecycle).
  if (import.meta.server) return;

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
  if (to.path === "/" && isAuth) {
    const communityStore = useCommunityStore();

    if (!communityStore.loaded) {
      await communityStore.fetchCommunities();
    }

    if (communityStore.currentCommunityId) {
      return navigateTo(`/community/${communityStore.currentCommunityId}`, { replace: true });
    } else if (communityStore.communities.length > 0) {
      communityStore.setCurrentCommunity(communityStore.communities[0]?.id || "");
      return navigateTo(`/community/${communityStore.communities[0]?.id || ""}`, {
        replace: true
      });
    }
  }
});
