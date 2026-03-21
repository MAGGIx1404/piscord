import { db, generateId } from "../db";
import type { PublicUser } from "../db/types";
import path from "node:path";
import fs from "node:fs/promises";

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await db
    .selectFrom("users")
    .select(["id", "username", "email", "avatar_url", "is_2fa_enabled", "created_at"])
    .where("id", "=", userId)
    .executeTakeFirst();

  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  return user as PublicUser;
}

export async function updateCurrentUser(
  userId: string,
  fields: { username?: string; avatar_url?: string }
): Promise<PublicUser> {
  if (!fields.username && !fields.avatar_url) {
    throw createError({ statusCode: 400, message: "Nothing to update" });
  }

  if (fields.username) {
    const conflict = await db
      .selectFrom("users")
      .select("id")
      .where("username", "=", fields.username)
      .where("id", "!=", userId)
      .executeTakeFirst();

    if (conflict) {
      throw createError({
        statusCode: 409,
        message: "Username already taken"
      });
    }
  }

  const updated = await db
    .updateTable("users")
    .set(fields)
    .where("id", "=", userId)
    .returning(["id", "username", "email", "avatar_url", "is_2fa_enabled", "created_at"])
    .executeTakeFirstOrThrow();

  return updated as PublicUser;
}

const AVATAR_DIR = path.resolve("public/images/avatar");
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

type ServerEvent = Parameters<typeof readMultipartFormData>[0];

export async function uploadAvatar(
  event: ServerEvent,
  userId: string
): Promise<{ avatar_url: string }> {
  const parts = await readMultipartFormData(event);
  const avatarPart = parts?.find((p) => p.name === "avatar");

  if (!avatarPart?.data?.length) {
    throw createError({ statusCode: 400, message: "No image uploaded (field: avatar)" });
  }

  const mime = avatarPart.type ?? "";
  if (!ALLOWED_MIMES.has(mime)) {
    throw createError({ statusCode: 415, message: "Unsupported type. Use JPEG, PNG, WebP or GIF" });
  }

  if (avatarPart.data.length > MAX_SIZE) {
    throw createError({ statusCode: 413, message: "Image must be under 5 MB" });
  }

  await fs.mkdir(AVATAR_DIR, { recursive: true });

  const ext = MIME_TO_EXT[mime] ?? ".png";
  const filename = `${userId}_${generateId()}${ext}`;
  const dest = path.join(AVATAR_DIR, filename);
  await fs.writeFile(dest, avatarPart.data);

  const avatar_url = `/images/avatar/${filename}`;

  await db.updateTable("users").set({ avatar_url }).where("id", "=", userId).execute();

  return { avatar_url };
}
