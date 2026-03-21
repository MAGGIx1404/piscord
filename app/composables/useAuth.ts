export function useAuth() {
  const userStore = useUserStore();
  const router = useRouter();

  async function register(username: string, email: string, password: string) {
    const data = await $fetch("/api/auth/register", {
      method: "POST",
      body: { username, email, password }
    });
    return data;
  }

  async function login(email: string, password: string) {
    const data = await $fetch("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });

    if (!("requires_2fa" in data)) {
      userStore.setUser(data.user);
    }

    return data;
  }

  async function verify2FA(userId: string, code: string) {
    const data = await $fetch("/api/auth/2fa/verify", {
      method: "POST",
      body: { user_id: userId, code }
    });
    userStore.setUser(data.user);
    return data;
  }

  async function logout() {
    await $fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    userStore.reset();
    useCommunityStore().reset();
    router.push("/auth/login");
  }

  async function refreshToken(): Promise<boolean> {
    try {
      await $fetch("/api/auth/refresh", { method: "POST" });
      return true;
    } catch {
      return false;
    }
  }

  async function fetchMe() {
    try {
      const data = await $fetch("/api/users/me");
      return data.user;
    } catch {
      return null;
    }
  }

  async function initAuth(): Promise<void> {
    let me = await fetchMe();
    if (me) {
      userStore.setUser(me);
      return;
    }

    const refreshed = await refreshToken();
    if (!refreshed) {
      userStore.reset();
      return;
    }

    me = await fetchMe();
    if (me) {
      userStore.setUser(me);
    } else {
      userStore.reset();
    }
  }

  async function checkUsername(username: string): Promise<boolean> {
    if (!username || username.length < 3) return false;
    const data = await $fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
    return data.available;
  }

  async function setup2FA() {
    return $fetch("/api/auth/2fa/setup", { method: "POST" });
  }

  return {
    register,
    login,
    verify2FA,
    setup2FA,
    logout,
    refreshToken,
    fetchMe,
    initAuth,
    checkUsername
  };
}
