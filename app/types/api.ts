// ─── Auth / User ─────────────────────────────────────────────────────────────

export interface MeResponse {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  is_2fa_enabled: boolean;
  created_at: string;
}

export interface RegisterResponse {
  user: MeResponse;
}

export interface LoginResponse {
  user: MeResponse;
}

export interface Login2FARequiredResponse {
  requires_2fa: true;
  user_id: string;
}

export interface RefreshResponse {
  success: boolean;
}

export interface CheckUsernameResponse {
  available: boolean;
}

export interface TwoFactorSetupResponse {
  qr_code: string; // data-URI PNG
  secret: string; // base32 for manual entry
}
