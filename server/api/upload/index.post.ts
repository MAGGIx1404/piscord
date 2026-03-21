import path from "node:path";
import { promises as fs } from "node:fs";
import { createId } from "@paralleldrive/cuid2";

const UPLOAD_DIR = path.resolve("public/images/uploads");
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const parts = await readMultipartFormData(event);
  if (!parts?.length) {
    throw createError({ statusCode: 400, message: "No file provided" });
  }

  const filePart = parts.find((p) => p.name === "file");
  if (!filePart?.data || !filePart.type) {
    throw createError({ statusCode: 400, message: "File field is required" });
  }

  if (!ALLOWED_MIME.includes(filePart.type)) {
    throw createError({
      statusCode: 400,
      message: "Only JPEG, PNG, WebP, and GIF images are allowed"
    });
  }

  if (filePart.data.length > MAX_SIZE) {
    throw createError({ statusCode: 400, message: "File must be under 8MB" });
  }

  const ext = filePart.type.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
  const filename = `${createId()}.${ext}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), filePart.data);

  return { url: `/images/uploads/${filename}` };
});
