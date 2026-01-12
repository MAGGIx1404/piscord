import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const UPLOAD_DIR = "public/uploads";
const supportedFormats = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
const mimeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg"
};

export interface UploadResult {
  filename: string;
  path: string;
  url: string;
}

async function ensureUploadDir(subdir: string): Promise<string> {
  const dir = join(process.cwd(), UPLOAD_DIR, subdir);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

function getExtension(filename: string, mimeType?: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext && supportedFormats.includes(ext)) {
    return ext;
  }

  if (mimeType) {
    return mimeExtensions[mimeType] || "png";
  }

  return "png";
}

export async function uploadFile(
  file: Buffer | string,
  subdir: string,
  originalFilename: string,
  mimeType?: string
): Promise<UploadResult> {
  const dir = await ensureUploadDir(subdir);
  const ext = getExtension(originalFilename, mimeType);
  const filename = `${randomUUID()}.${ext}`;
  const filepath = join(dir, filename);

  let buffer: Buffer;

  if (typeof file === "string") {
    const base64Data = file.replace(/^data:image\/\w+;base64,/, "");
    buffer = Buffer.from(base64Data, "base64");
  } else {
    buffer = file;
  }

  await writeFile(filepath, buffer);

  return {
    filename,
    path: filepath,
    url: `/uploads/${subdir}/${filename}`
  };
}

export function validateImage(
  file: { size: number; type?: string },
  maxSizeMB: number = 2
): { valid: boolean; error?: string } {
  const maxSize = maxSizeMB * 1024 * 1024;

  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  if (file.type && !file.type.startsWith("image/")) {
    return { valid: false, error: "File must be an image" };
  }

  return { valid: true };
}
