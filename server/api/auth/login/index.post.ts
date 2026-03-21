import { loginUser } from "../../../services/authService";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../../../utils/cookies";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event);
  const { email, password } = body ?? {};

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: "email and password are required"
    });
  }

  const result = await loginUser(email.trim().toLowerCase(), password);

  if ("requires2FA" in result) {
    return { requires_2fa: true, user_id: result.userId };
  }

  setAccessTokenCookie(event, result.access_token);
  setRefreshTokenCookie(event, result.refresh_token);

  return { user: result.user };
});
