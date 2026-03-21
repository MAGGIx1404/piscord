import { defineStore } from "pinia";
import type { MeResponse } from "~/types/api";

export const useUserStore = defineStore(
  "user",
  () => {
    const user = ref<MeResponse | null>(null);

    const isAuthenticated = computed(() => !!user.value);

    function setUser(userData: MeResponse) {
      user.value = userData;
    }

    function reset() {
      user.value = null;
    }

    return {
      user,
      isAuthenticated,
      setUser,
      reset
    };
  },
  {
    persist: {
      pick: ["user"]
    }
  }
);
