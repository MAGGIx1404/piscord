import { createError, getCookie, type H3Event } from "h3";
import { verifyAccessToken } from "./jwt";

export function requireAuth(event: H3Event): string {
  // Prefer middleware-set context (already verified)
  if (event.context.userId) {
    return event.context.userId;
  }

  // Fallback: read cookie directly (for routes not covered by middleware)
  const token = getCookie(event, "access_token");
  if (!token) {
    throw createError({ statusCode: 401, message: "Missing access token" });
  }

  try {
    const payload = verifyAccessToken(token);
    return payload.userId;
  } catch {
    throw createError({ statusCode: 401, message: "Invalid or expired token" });
  }
}
