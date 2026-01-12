import { defineStore } from "pinia";
import type { UserCommunitiesResponse } from "~/types/api";

type Community = UserCommunitiesResponse["communities"][number];

export const useCommunityStore = defineStore("community", () => {
  const communities = ref<Community[]>([]);
  const currentCommunity = ref<Community | null>(null);
  const isLoading = ref(false);
  const hasFetched = ref(false);
  const hasCommunities = computed(() => communities.value?.length > 0);

  async function fetchCommunities(force = false) {
    if (hasFetched.value && !force) return;

    isLoading.value = true;
    try {
      const response = await $fetch("/api/user/communities");
      communities.value = response.communities;
      hasFetched.value = true;
    } catch (error) {
      console.error("Failed to fetch communities:", error);
    } finally {
      isLoading.value = false;
    }
  }

  function addCommunity(community: Community) {
    communities.value.unshift(community);
  }

  function setCurrentCommunity(communitySlug: string) {
    const community = communities.value.find((c) => c.slug === communitySlug);
    currentCommunity.value = community || null;
  }

  function clearCurrentCommunity() {
    currentCommunity.value = null;
  }

  function reset() {
    communities.value = [];
    currentCommunity.value = null;
    hasFetched.value = false;
  }

  function setCommunities(newCommunities: Community[]) {
    communities.value = newCommunities;
    if (newCommunities.length > 0 && newCommunities[0]) {
      currentCommunity.value = newCommunities[0];
    }
  }

  return {
    communities,
    currentCommunity,
    isLoading,
    hasFetched,
    hasCommunities,
    fetchCommunities,
    addCommunity,
    setCurrentCommunity,
    clearCurrentCommunity,
    reset,
    setCommunities
  };
});
