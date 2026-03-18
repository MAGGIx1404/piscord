import { getHeader, createError, type H3Event } from "h3";
import { verifyAccessToken } from "./jwt";

export function requireAuth(event: H3Event): string {
  const header = getHeader(event, "authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

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
