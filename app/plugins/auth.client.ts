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

  // After auth is established, bootstrap the community store
  const userStore = useUserStore();
  if (userStore.isAuthenticated) {
    const communityStore = useCommunityStore();
    await communityStore.fetchCommunities();

    // Validate persisted currentCommunityId still exists in the list
    if (communityStore.currentCommunityId) {
      const exists = communityStore.communities.some(
        (c) => c.id === communityStore.currentCommunityId
      );
      if (!exists && communityStore.communities.length > 0) {
        communityStore.setCurrentCommunity(communityStore.communities[0].id);
      } else if (!exists) {
        communityStore.currentCommunityId = null;
      }
    } else if (communityStore.communities.length > 0) {
      // No persisted community — fall back to localStorage or first
      const lastId = localStorage.getItem("lastCommunityId");
      const target =
        lastId && communityStore.communities.some((c) => c.id === lastId)
          ? lastId
          : communityStore.communities[0].id;
      communityStore.setCurrentCommunity(target);
    }
  }
});
