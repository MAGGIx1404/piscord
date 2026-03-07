import { registerUser } from "../../../services/authService";

/**
 * POST /api/auth/register
 * Body: { username, email, password }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{
    username?: string;
    email?: string;
    password?: string;
  }>(event);

  const { username, email, password } = body ?? {};

  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      message: "username, email and password are required"
    });
  }

  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      message: "Password must be at least 8 characters"
    });
  }

  const user = await registerUser(username.trim(), email.trim().toLowerCase(), password);

  setResponseStatus(event, 201);
  return { user };
});
