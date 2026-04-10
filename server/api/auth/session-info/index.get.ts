import { verifyAccessToken } from "../../../utils/jwt";

/**
 * GET /api/auth/session-info
 * Returns the access token's expiry timestamp so the client can show a countdown.
 */
export default defineEventHandler((event) => {
  const token = getCookie(event, "access_token");
  if (!token) {
    throw createError({ statusCode: 401, message: "No access token" });
  }

  try {
    const payload = verifyAccessToken(token);
    // JWT `exp` is in seconds since epoch
    const exp = (payload as any).exp as number | undefined;
    if (!exp) {
      throw createError({ statusCode: 500, message: "Token has no expiry" });
    }
    return { expiresAt: exp * 1000 };
  } catch {
    throw createError({ statusCode: 401, message: "Invalid token" });
  }
});
