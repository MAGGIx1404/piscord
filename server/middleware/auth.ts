import { verifyAccessToken } from "../utils/jwt";

const PUBLIC_PREFIXES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/check-username",
  "/api/auth/2fa/verify"
];

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;

  // Only apply to /api/ routes
  if (!path.startsWith("/api/")) return;

  // Skip public auth routes
  if (PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))) return;

  // Read access token from httpOnly cookie
  const token = getCookie(event, "access_token");
  if (!token) {
    throw createError({ statusCode: 401, message: "Missing access token" });
  }

  try {
    const payload = verifyAccessToken(token);
    event.context.userId = payload.userId;
  } catch {
    throw createError({ statusCode: 401, message: "Invalid or expired token" });
  }
});
