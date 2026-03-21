import { db } from "../../../db";

/**
 * GET /api/auth/check-username?username=foo
 * Returns { available: boolean }
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const username = String(query.username ?? "").trim();

  if (!username || username.length < 3) {
    return { available: false };
  }

  const existing = await db
    .selectFrom("users")
    .select("id")
    .where("username", "=", username)
    .executeTakeFirst();

  return { available: !existing };
});
