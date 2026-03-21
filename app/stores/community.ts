import { defineStore } from "pinia";

export interface UserCommunity {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  member_count: number;
  is_public: boolean;
  is_owner: boolean;
  joined_at: string;
}

export const useCommunityStore = defineStore(
  "community",
  () => {
    const communities = ref<UserCommunity[]>([]);
    const currentCommunityId = ref<string | null>(null);
    const loaded = ref(false);

    const currentCommunity = computed(
      () => communities.value.find((c) => c.id === currentCommunityId.value) ?? null
    );

    function setCurrentCommunity(id: string) {
      currentCommunityId.value = id;
      if (import.meta.client) {
        localStorage.setItem("lastCommunityId", id);
      }
    }

    async function fetchCommunities() {
      const api = useApi();
      try {
        const data = await api("/api/users/me/communities");
        communities.value = data.communities;
        loaded.value = true;
        return data.communities;
      } catch {
        communities.value = [];
        loaded.value = true;
        return [];
      }
    }

    function reset() {
      communities.value = [];
      currentCommunityId.value = null;
      loaded.value = false;
    }

    return {
      communities,
      currentCommunityId,
      currentCommunity,
      loaded,
      setCurrentCommunity,
      fetchCommunities,
      reset
    };
  },
  {
    persist: {
      pick: ["communities", "currentCommunityId"]
    }
  }
);
