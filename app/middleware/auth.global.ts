/**
 * middleware/auth.global.ts
 *
 * Client-side route guard for SPA navigations.
 *
 * On initial page load the server middleware (server/middleware/routeGuard.ts)
 * handles redirects before any HTML is sent — no flicker.
 * This middleware handles subsequent client-side navigations only.
 *
 * Rules:
 *  - /auth/* routes  → accessible only when NOT authenticated
 *  - All other routes → accessible only when authenticated
 */
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

  // When an authenticated user hits /, redirect to their last community or the communities page.
  if (to.path === "/" && isAuth) {
    const communityStore = useCommunityStore();

    if (communityStore.currentCommunityId) {
      return navigateTo(`/community/${communityStore.currentCommunityId}`, { replace: true });
    }

    return navigateTo("/my-communities", { replace: true });
  }
});
