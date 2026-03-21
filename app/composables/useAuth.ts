import type {
  RegisterResponse,
  LoginResponse,
  Login2FARequiredResponse,
  CheckUsernameResponse,
  MeResponse,
  TwoFactorSetupResponse
} from "~/types/api";

export function useAuth() {
  const userStore = useUserStore();
  const router = useRouter();

  // ─── Register ──────────────────────────────────────────────────────────────

  async function register(username: string, email: string, password: string) {
    const data = await $fetch<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: { username, email, password }
    });
    return data;
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  async function login(
    email: string,
    password: string
  ): Promise<LoginResponse | Login2FARequiredResponse> {
    const data = await $fetch<LoginResponse | Login2FARequiredResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });

    if (!("requires_2fa" in data)) {
      userStore.setUser(data.user);
    }

    return data;
  }

  // ─── Verify 2FA ────────────────────────────────────────────────────────────

  async function verify2FA(userId: string, code: string): Promise<LoginResponse> {
    const data = await $fetch<LoginResponse>("/api/auth/2fa/verify", {
      method: "POST",
      body: { user_id: userId, code }
    });
    userStore.setUser(data.user);
    return data;
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  async function logout() {
    await $fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    userStore.reset();
    useCommunityStore().reset();
    router.push("/auth/login");
  }

  // ─── Refresh access token ──────────────────────────────────────────────────

  async function refreshToken(): Promise<boolean> {
    try {
      await $fetch("/api/auth/refresh", { method: "POST" });
      return true;
    } catch {
      return false;
    }
  }

  // ─── Fetch /api/users/me ───────────────────────────────────────────────────

  async function fetchMe(): Promise<MeResponse | null> {
    try {
      const data = await $fetch<{ user: MeResponse }>("/api/users/me");
      return data.user;
    } catch {
      return null;
    }
  }

  // ─── Init auth (called on app startup) ────────────────────────────────────
  // Validates via httpOnly cookie; falls back to refresh if expired.

  async function initAuth(): Promise<void> {
    // Try current access token cookie
    let me = await fetchMe();
    if (me) {
      userStore.setUser(me);
      return;
    }

    // Access cookie may be expired — attempt silent refresh
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

  // ─── Check username availability ───────────────────────────────────────────

  async function checkUsername(username: string): Promise<boolean> {
    if (!username || username.length < 3) return false;
    const data = await $fetch<CheckUsernameResponse>(
      `/api/auth/check-username?username=${encodeURIComponent(username)}`
    );
    return data.available;
  }

  // ─── 2FA setup ─────────────────────────────────────────────────────────────

  async function setup2FA(): Promise<TwoFactorSetupResponse> {
    return $fetch<TwoFactorSetupResponse>("/api/auth/2fa/setup", { method: "POST" });
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
