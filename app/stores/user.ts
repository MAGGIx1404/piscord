import { defineStore } from "pinia";
import type { MeResponse } from "~/types/api";

export const useUserStore = defineStore("user", () => {
  const user = ref<MeResponse | null>(null);

  function setUser(userData: MeResponse) {
    user.value = userData;
  }

  return {
    user,
    setUser
  };
});
