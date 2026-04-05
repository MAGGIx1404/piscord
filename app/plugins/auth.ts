export default defineNuxtPlugin(async () => {
  const userStore = useUserStore();

  if (import.meta.server) {
    const event = useRequestEvent();
    if (event?.context.userId) {
      try {
        const data = await $fetch<{ user: any }>("/api/users/me", {
          headers: useRequestHeaders(["cookie"])
        });
        if (data.user) {
          userStore.setUser(data.user);
        }
      } catch {
        userStore.reset();
      }
    }
  }

  if (import.meta.client) {
    const route = useRoute();
    if (route.path.startsWith("/auth/")) {
      userStore.reset();
    } else {
      const { initAuth } = useAuth();
      await initAuth();
    }
  }
});
