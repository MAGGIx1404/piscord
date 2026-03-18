import { loginUser } from "../../../services/authService";

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

  setCookie(event, "refresh_token", result.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/"
  });

  return {
    access_token: result.access_token,
    user: result.user
  };
});
