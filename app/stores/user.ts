import { defineStore } from "pinia";
import type { MeResponse } from "~/types/api";

export const useUserStore = defineStore(
  "user",
  () => {
    const user = ref<MeResponse | null>(null);
    const accessToken = ref<string | null>(null);

    const isAuthenticated = computed(() => !!user.value && !!accessToken.value);

    function setUser(userData: MeResponse) {
      user.value = userData;
    }

    function setAccessToken(token: string) {
      accessToken.value = token;
    }

    function setAuth(userData: MeResponse, token: string) {
      user.value = userData;
      accessToken.value = token;
    }

    function reset() {
      user.value = null;
      accessToken.value = null;
    }

    return {
      user,
      accessToken,
      isAuthenticated,
      setUser,
      setAccessToken,
      setAuth,
      reset
    };
  },
  {
    persist: {
      pick: ["user", "accessToken"]
    }
  }
);
