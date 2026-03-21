import { refreshSession } from "../../../services/authService";
import {
  clearAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie
} from "../../../utils/cookies";

/**
 * POST /api/auth/refresh
 * Reads refresh_token cookie, rotates both tokens via httpOnly cookies.
 */
export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, "refresh_token");

  if (!refreshToken) {
    throw createError({ statusCode: 401, message: "No refresh token" });
  }

  try {
    const tokens = await refreshSession(refreshToken);
    setAccessTokenCookie(event, tokens.access_token);
    setRefreshTokenCookie(event, tokens.refresh_token);
    return { success: true };
  } catch (error) {
    // Clear stale cookies so the browser stops sending invalid tokens
    clearAuthCookies(event);
    throw error;
  }
});
