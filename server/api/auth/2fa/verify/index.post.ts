import { verify2FA } from "../../../../services/authService";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../../../../utils/cookies";

/**
 * POST /api/auth/2fa/verify
 * Body: { user_id, code }
 * Used after login when 2FA is required, or to enable 2FA after setup.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ user_id?: string; code?: string }>(event);
  const { user_id, code } = body ?? {};

  if (!user_id || !code) {
    throw createError({
      statusCode: 400,
      message: "user_id and code are required"
    });
  }

  const result = await verify2FA(user_id, code.trim());

  setAccessTokenCookie(event, result.access_token);
  setRefreshTokenCookie(event, result.refresh_token);

  return { user: result.user };
});
