import type {
  RegisterResponse,
  LoginResponse,
  Login2FARequiredResponse,
  CheckUsernameResponse,
  MeResponse,
  RefreshResponse,
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
      userStore.setAuth(data.user, data.access_token);
    }

    return data;
  }

  // ─── Verify 2FA ────────────────────────────────────────────────────────────

  async function verify2FA(userId: string, code: string): Promise<LoginResponse> {
    const data = await $fetch<LoginResponse>("/api/auth/2fa/verify", {
      method: "POST",
      body: { user_id: userId, code }
    });
    userStore.setAuth(data.user, data.access_token);
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

  async function refreshToken(): Promise<string | null> {
    try {
      const data = await $fetch<RefreshResponse>("/api/auth/refresh", { method: "POST" });
      userStore.setAccessToken(data.access_token);
      return data.access_token;
    } catch {
      return null;
    }
  }

  // ─── Fetch /api/users/me ───────────────────────────────────────────────────

  async function fetchMe(token: string): Promise<MeResponse | null> {
    try {
      const data = await $fetch<{ user: MeResponse }>("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.user;
    } catch {
      return null;
    }
  }

  // ─── Init auth (called on app startup) ────────────────────────────────────
  // Validates the persisted token; falls back to refresh cookie if expired.

  async function initAuth(): Promise<void> {
    let token = userStore.accessToken;

    // Try persisted token first
    if (token) {
      const me = await fetchMe(token);
      if (me) {
        userStore.setUser(me);
        return;
      }
    }

    // Access token missing or expired — attempt silent refresh via cookie
    const newToken = await refreshToken();
    if (!newToken) {
      userStore.reset();
      return;
    }

    const me = await fetchMe(newToken);
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
    const api = useApi();
    return api<TwoFactorSetupResponse>("/api/auth/2fa/setup", { method: "POST" });
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
