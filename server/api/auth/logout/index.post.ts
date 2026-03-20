import { logoutUser } from "../../../services/authService";
import { clearAuthCookies } from "../../../utils/cookies";

/**
 * POST /api/auth/logout
 * Reads refresh_token from cookie, revokes the session, clears auth cookies.
 */
export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, "refresh_token");

  if (refreshToken) {
    await logoutUser(refreshToken);
  }

  clearAuthCookies(event);

  return { success: true };
});
