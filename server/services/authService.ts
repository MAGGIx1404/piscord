import crypto from "node:crypto";
import { createError } from "h3";
import { db, generateId } from "../db";
import type { AuthTokens, PublicUser } from "../db/types";
import type { User } from "../db/tables";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { generateTotpSecret, buildTotpSetupResult, verifyTotpCode } from "../utils/totp";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<PublicUser> {
  const existing = await db
    .selectFrom("users")
    .select("id")
    .where((eb) => eb.or([eb("email", "=", email), eb("username", "=", username)]))
    .executeTakeFirst();

  if (existing) {
    throw createError({
      statusCode: 409,
      message: "Username or email already in use"
    });
  }

  const password_hash = await hashPassword(password);

  const user = await db
    .insertInto("users")
    .values({
      id: generateId(),
      username,
      email,
      password_hash,
      avatar_url: null,
      is_2fa_enabled: false,
      totp_secret: null
    })
    .returning(["id", "username", "email", "avatar_url", "is_2fa_enabled", "created_at"])
    .executeTakeFirstOrThrow();

  return user as PublicUser;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string
): Promise<{ requires2FA: true; userId: string } | (AuthTokens & { user: PublicUser })> {
  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();

  if (!user) {
    throw createError({ statusCode: 401, message: "Invalid credentials" });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw createError({ statusCode: 401, message: "Invalid credentials" });
  }

  if (user.is_2fa_enabled) {
    return { requires2FA: true, userId: user.id };
  }

  const tokens = await createSession(user.id);
  return {
    ...tokens,
    user: toPublicUser(user as User)
  };
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export async function refreshSession(rawRefreshToken: string): Promise<AuthTokens> {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(rawRefreshToken) as { userId: string };
  } catch {
    throw createError({ statusCode: 401, message: "Invalid refresh token" });
  }

  const tokenHash = hashToken(rawRefreshToken);

  const session = await db
    .selectFrom("refresh_sessions")
    .selectAll()
    .where("token_hash", "=", tokenHash)
    .where("user_id", "=", payload.userId)
    .executeTakeFirst();

  if (!session || session.expires_at < new Date()) {
    throw createError({
      statusCode: 401,
      message: "Refresh token expired or revoked"
    });
  }

  // Rotate: delete old, issue new
  await db.deleteFrom("refresh_sessions").where("id", "=", session.id).execute();

  return createSession(payload.userId);
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutUser(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashToken(rawRefreshToken);
  await db.deleteFrom("refresh_sessions").where("token_hash", "=", tokenHash).execute();
}

// ─── 2FA Setup ────────────────────────────────────────────────────────────────

export async function setup2FA(userId: string) {
  const user = await db
    .selectFrom("users")
    .select(["id", "email"])
    .where("id", "=", userId)
    .executeTakeFirst();

  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  const { base32 } = generateTotpSecret();

  await db.updateTable("users").set({ totp_secret: base32 }).where("id", "=", userId).execute();

  return buildTotpSetupResult(user.email, base32);
}

// ─── 2FA Verify ───────────────────────────────────────────────────────────────

export async function verify2FA(
  userId: string,
  code: string
): Promise<AuthTokens & { user: PublicUser }> {
  const user = await db.selectFrom("users").selectAll().where("id", "=", userId).executeTakeFirst();

  if (!user || !user.totp_secret) {
    throw createError({
      statusCode: 400,
      message: "2FA not set up for this user"
    });
  }

  const valid = verifyTotpCode(user.totp_secret, code);
  if (!valid) {
    throw createError({ statusCode: 401, message: "Invalid TOTP code" });
  }

  if (!user.is_2fa_enabled) {
    await db.updateTable("users").set({ is_2fa_enabled: true }).where("id", "=", userId).execute();
  }

  const tokens = await createSession(userId);
  return { ...tokens, user: toPublicUser(user as User) };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function createSession(userId: string): Promise<AuthTokens> {
  const access_token = signAccessToken({ userId });
  const refresh_token = signRefreshToken({ userId });

  await db
    .insertInto("refresh_sessions")
    .values({
      id: generateId(),
      user_id: userId,
      token_hash: hashToken(refresh_token),
      expires_at: refreshExpiresAt()
    })
    .execute();

  return { access_token, refresh_token };
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar_url: user.avatar_url,
    is_2fa_enabled: user.is_2fa_enabled,
    created_at: user.created_at
  };
}
