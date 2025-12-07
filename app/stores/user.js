import { defineStore } from "pinia";

export const useUserStore = defineStore(
  "user",
  {
    state: () => ({
      user: null
    }),
    actions: {
      setUser(user) {
        this.user = user;
      }
    },
    getters: {
      isAuthenticated: (state) => !!state.user,
      getUser: (state) => state.user
    }
  },
  {
    persist: true
  }
);
