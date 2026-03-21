import { db } from "../db";

export async function resolveCommunityId(slugOrId: string): Promise<string> {
  const row = await db
    .selectFrom("communities")
    .select("id")
    .where((eb) => eb.or([eb("slug", "=", slugOrId), eb("id", "=", slugOrId)]))
    .executeTakeFirst();

  if (!row) {
    throw createError({ statusCode: 404, message: "Community not found" });
  }

  return row.id;
}
