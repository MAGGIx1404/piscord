import { refreshSession } from "../../../services/authService";

/**
 * POST /api/auth/refresh
 * Reads refresh_token cookie, rotates it, returns a new access token.
 */
export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, "refresh_token");

  if (!refreshToken) {
    throw createError({ statusCode: 401, message: "No refresh token" });
  }

  const tokens = await refreshSession(refreshToken);

  setCookie(event, "refresh_token", tokens.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });

  return { access_token: tokens.access_token };
});
