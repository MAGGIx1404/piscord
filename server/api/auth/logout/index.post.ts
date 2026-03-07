import { logoutUser } from "../../../services/authService";

/**
 * POST /api/auth/logout
 * Reads refresh_token from cookie, revokes the session.
 */
export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, "refresh_token");

  if (refreshToken) {
    await logoutUser(refreshToken);
  }

  deleteCookie(event, "refresh_token", { path: "/" });

  return { success: true };
});
