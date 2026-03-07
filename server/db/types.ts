// Safe user type – never exposes password_hash or totp_secret
export interface PublicUser {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  is_2fa_enabled: boolean;
  created_at: Date;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AccessTokenPayload {
  userId: string;
}

export interface TwoFactorSetupResult {
  qr_code: string; // data-URI PNG
  secret: string; // base32 for manual entry
}

// ─── Community ────────────────────────────────────────────────────────────────

export interface PublicCommunity {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  banner_url: string | null;
  rules: Array<{ id: number; text: string }>;
  is_public: boolean;
  member_count: number;
  category: string | null;
  tags: string[];
  require_approval: boolean;
  is_discoverable: boolean;
  enable_welcome: boolean;
  created_at: Date;
}
