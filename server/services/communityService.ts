import { createError } from "h3";
import path from "node:path";
import fs from "node:fs/promises";
import { db, generateId } from "../db";
import type { PublicCommunity } from "../db/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const COMMUNITY_IMAGES_DIR = path.resolve("public/images/communities");
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateCommunityPayload {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  tags?: string[];
  rules?: Array<{ id: number; text: string }>;
  visibility: "public" | "private";
  requireApproval?: boolean;
  enableWelcome?: boolean;
  discoverable?: boolean;
}

export interface FilePart {
  data: Buffer;
  type?: string;
  filename?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function saveImage(
  communityId: string,
  kind: "icon" | "banner",
  part: FilePart
): Promise<string> {
  const mime = part.type ?? "image/png";

  if (!ALLOWED_MIMES.has(mime)) {
    throw createError({ statusCode: 400, message: `Invalid ${kind} file type: ${mime}` });
  }
  if (part.data.length > MAX_SIZE) {
    throw createError({ statusCode: 400, message: `${kind} exceeds 8 MB limit` });
  }

  await fs.mkdir(COMMUNITY_IMAGES_DIR, { recursive: true });
  const ext = MIME_TO_EXT[mime] ?? ".png";
  const filename = `${communityId}-${kind}${ext}`;
  await fs.writeFile(path.join(COMMUNITY_IMAGES_DIR, filename), part.data);
  return `/images/communities/${filename}`;
}

function toCommunitySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);
}

// ─── Check slug availability ──────────────────────────────────────────────────

export async function checkCommunitySlug(slug: string): Promise<boolean> {
  const existing = await db
    .selectFrom("communities")
    .select("id")
    .where("slug", "=", slug)
    .executeTakeFirst();
  return !existing;
}

// ─── Create community ─────────────────────────────────────────────────────────

export async function createCommunity(
  ownerId: string,
  payload: CreateCommunityPayload,
  iconPart?: FilePart | null,
  bannerPart?: FilePart | null
): Promise<PublicCommunity> {
  const {
    name,
    description,
    category,
    tags = [],
    rules = [],
    visibility,
    requireApproval = false,
    enableWelcome = true,
    discoverable = true
  } = payload;

  const slug = payload.slug || toCommunitySlug(name);

  // Slug uniqueness
  const taken = await db
    .selectFrom("communities")
    .select("id")
    .where("slug", "=", slug)
    .executeTakeFirst();

  if (taken) {
    throw createError({ statusCode: 409, message: "Community URL (slug) is already taken" });
  }

  const id = generateId();

  // Save images first (use temp id path)
  let icon_url: string | null = null;
  let banner_url: string | null = null;

  if (iconPart?.data?.length) {
    icon_url = await saveImage(id, "icon", iconPart);
  }
  if (bannerPart?.data?.length) {
    banner_url = await saveImage(id, "banner", bannerPart);
  }

  // Insert community
  const community = await db
    .insertInto("communities")
    .values({
      id,
      owner_id: ownerId,
      name: name.trim(),
      slug,
      description: description?.trim() ?? null,
      icon_url,
      banner_url,
      rules: rules.length ? JSON.stringify(rules) : null,
      is_public: visibility === "public",
      member_count: 1,
      category: category ?? null,
      tags,
      require_approval: requireApproval,
      is_discoverable: discoverable,
      enable_welcome: enableWelcome
    })
    .returning([
      "id",
      "owner_id",
      "name",
      "slug",
      "description",
      "icon_url",
      "banner_url",
      "rules",
      "is_public",
      "member_count",
      "category",
      "tags",
      "require_approval",
      "is_discoverable",
      "enable_welcome",
      "created_at"
    ])
    .executeTakeFirstOrThrow();

  // Seed default roles
  const memberRoleId = generateId();
  const adminRoleId = generateId();

  await db
    .insertInto("roles")
    .values([
      {
        id: memberRoleId,
        community_id: id,
        name: "Member",
        color: null,
        permissions: 3, // view + send
        position: 0,
        is_default: true
      },
      {
        id: adminRoleId,
        community_id: id,
        name: "Admin",
        color: "#f59e0b",
        permissions: 63, // all bits
        position: 1,
        is_default: false
      }
    ])
    .execute();

  // Add owner as member
  await db
    .insertInto("community_members")
    .values({
      id: generateId(),
      community_id: id,
      user_id: ownerId,
      nickname: null
    })
    .execute();

  return {
    ...community,
    rules: community.rules ? JSON.parse(community.rules) : [],
    tags: community.tags ?? [],
    is_public: community.is_public as unknown as boolean,
    member_count: community.member_count as unknown as number,
    require_approval: community.require_approval as unknown as boolean,
    is_discoverable: community.is_discoverable as unknown as boolean,
    enable_welcome: community.enable_welcome as unknown as boolean
  } as unknown as PublicCommunity;
}

// ─── Get communities owned by user ───────────────────────────────────────────

export async function getUserCommunities(userId: string): Promise<PublicCommunity[]> {
  const rows = await db
    .selectFrom("communities")
    .select([
      "id",
      "owner_id",
      "name",
      "slug",
      "description",
      "icon_url",
      "banner_url",
      "rules",
      "is_public",
      "member_count",
      "category",
      "tags",
      "require_approval",
      "is_discoverable",
      "enable_welcome",
      "created_at"
    ])
    .where("owner_id", "=", userId)
    .orderBy("created_at", "desc")
    .execute();

  return rows.map((r) => ({
    ...r,
    rules: r.rules ? JSON.parse(r.rules) : [],
    tags: r.tags ?? []
  })) as unknown as PublicCommunity[];
}
