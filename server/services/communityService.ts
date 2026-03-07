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
  isAiPet?: boolean;
  aiAgentName?: string | null;
  aiAgentPetName?: string | null;
  aiAgentAvatar?: string | null;
  aiAgentModel?: string | null;
  aiAgentDescription?: string | null;
}

export interface FilePart {
  data: Buffer;
  type?: string;
  filename?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function saveImage(
  communityId: string,
  kind: "icon" | "banner" | "ai-avatar",
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
  bannerPart?: FilePart | null,
  aiAgentAvatarPart?: FilePart | null
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
    discoverable = true,
    isAiPet = false,
    aiAgentName = null,
    aiAgentPetName = null,
    aiAgentAvatar = null,
    aiAgentModel = null,
    aiAgentDescription = null
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

  // Resolve AI agent avatar: uploaded file takes precedence over preset key
  let resolvedAiAgentAvatar = aiAgentName ? (aiAgentAvatar ?? null) : null;
  if (aiAgentAvatarPart?.data?.length) {
    resolvedAiAgentAvatar = await saveImage(id, "ai-avatar", aiAgentAvatarPart);
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
      enable_welcome: enableWelcome,
      is_ai_pet: isAiPet,
      ai_agent_name: aiAgentName ?? null,
      ai_agent_pet_name: aiAgentPetName ?? null,
      ai_agent_avatar: resolvedAiAgentAvatar,
      ai_agent_model: aiAgentModel ?? null,
      ai_agent_description: aiAgentDescription ?? null
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
      "is_ai_pet",
      "ai_agent_name",
      "ai_agent_pet_name",
      "ai_agent_avatar",
      "ai_agent_model",
      "ai_agent_description",
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
      "is_ai_pet",
      "ai_agent_name",
      "ai_agent_pet_name",
      "ai_agent_avatar",
      "ai_agent_model",
      "ai_agent_description",
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

// ─── Discover communities ─────────────────────────────────────────────────────

export interface DiscoverQuery {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface DiscoverCommunity extends PublicCommunity {
  is_member: boolean;
}

export async function getDiscoverableCommunities(
  userId: string,
  query: DiscoverQuery = {}
): Promise<{ communities: DiscoverCommunity[]; total: number }> {
  const { search, category, limit = 24, offset = 0 } = query;

  let q = db
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
      "is_ai_pet",
      "ai_agent_name",
      "ai_agent_pet_name",
      "ai_agent_avatar",
      "ai_agent_model",
      "ai_agent_description",
      "created_at"
    ])
    .where("is_discoverable", "=", true);

  if (search) {
    q = q.where((eb) =>
      eb.or([eb("name", "ilike", `%${search}%`), eb("description", "ilike", `%${search}%`)])
    );
  }

  if (category && category !== "all") {
    q = q.where("category", "=", category);
  }

  const [rows, countRow] = await Promise.all([
    q.limit(limit).offset(offset).execute(),
    db
      .selectFrom("communities")
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .where("is_discoverable", "=", true)
      .executeTakeFirstOrThrow()
  ]);

  // Check membership for each community in one query
  const communityIds = rows.map((r) => r.id);
  const memberships =
    communityIds.length > 0
      ? await db
          .selectFrom("community_members")
          .select("community_id")
          .where("user_id", "=", userId)
          .where("community_id", "in", communityIds)
          .execute()
      : [];

  const memberSet = new Set(memberships.map((m) => m.community_id));

  return {
    communities: rows.map((r) => ({
      ...r,
      rules: r.rules ? JSON.parse(r.rules) : [],
      tags: r.tags ?? [],
      is_public: r.is_public as unknown as boolean,
      member_count: r.member_count as unknown as number,
      require_approval: r.require_approval as unknown as boolean,
      is_discoverable: r.is_discoverable as unknown as boolean,
      enable_welcome: r.enable_welcome as unknown as boolean,
      is_ai_pet: r.is_ai_pet as unknown as boolean,
      is_member: memberSet.has(r.id)
    })) as unknown as DiscoverCommunity[],
    total: Number(countRow.count)
  };
}

// ─── Join community ───────────────────────────────────────────────────────────

export async function joinCommunity(
  userId: string,
  communityId: string
): Promise<{ joined: boolean; member_count: number }> {
  // Check community exists and is joinable
  const community = await db
    .selectFrom("communities")
    .select(["id", "require_approval", "is_public", "member_count"])
    .where("id", "=", communityId)
    .executeTakeFirst();

  if (!community) {
    throw createError({ statusCode: 404, message: "Community not found" });
  }

  if (!community.is_public) {
    throw createError({ statusCode: 403, message: "This community is private" });
  }

  // Already a member?
  const existing = await db
    .selectFrom("community_members")
    .select("id")
    .where("community_id", "=", communityId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (existing) {
    return { joined: false, member_count: community.member_count as unknown as number };
  }

  await db
    .insertInto("community_members")
    .values({
      id: generateId(),
      community_id: communityId,
      user_id: userId,
      nickname: null
    })
    .execute();

  // Increment member count
  const updated = await db
    .updateTable("communities")
    .set((eb) => ({ member_count: eb("member_count", "+", 1) }))
    .where("id", "=", communityId)
    .returning("member_count")
    .executeTakeFirstOrThrow();

  return { joined: true, member_count: updated.member_count as unknown as number };
}

// ─── Get community overview ───────────────────────────────────────────────────

export interface CommunityMemberPublic {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  nickname: string | null;
  joined_at: Date;
}

export interface CommunityRole {
  id: string;
  name: string;
  color: string | null;
  position: number;
  is_default: boolean;
  member_count: number;
}

export interface CommunityOverview {
  community: PublicCommunity;
  roles: CommunityRole[];
  members: CommunityMemberPublic[];
  is_member: boolean;
  is_owner: boolean;
}

export async function getCommunityOverview(
  slugOrId: string,
  userId: string
): Promise<CommunityOverview> {
  // Try slug first, fallback to id
  const row = await db
    .selectFrom("communities")
    .selectAll()
    .where((eb) => eb.or([eb("slug", "=", slugOrId), eb("id", "=", slugOrId)]))
    .executeTakeFirst();

  if (!row) {
    throw createError({ statusCode: 404, message: "Community not found" });
  }

  const communityId = row.id;

  const [roles, memberRows, membership] = await Promise.all([
    db
      .selectFrom("roles")
      .select(["id", "name", "color", "position", "is_default"])
      .where("community_id", "=", communityId)
      .orderBy("position", "asc")
      .execute(),

    db
      .selectFrom("community_members")
      .innerJoin("users", "users.id", "community_members.user_id")
      .select([
        "community_members.id",
        "community_members.user_id",
        "community_members.nickname",
        "community_members.joined_at",
        "users.username",
        "users.avatar_url"
      ])
      .where("community_members.community_id", "=", communityId)
      .orderBy("community_members.joined_at", "asc")
      .limit(50)
      .execute(),

    db
      .selectFrom("community_members")
      .select("id")
      .where("community_id", "=", communityId)
      .where("user_id", "=", userId)
      .executeTakeFirst()
  ]);

  // Count members per role (using is_default as proxy — owner = first member)
  const totalMembers = memberRows.length;
  const defaultRole = roles.find((r) => r.is_default);
  const adminRole = roles.find((r) => !r.is_default);

  const rolesWithCount: CommunityRole[] = roles.map((r) => ({
    ...r,
    position: r.position as unknown as number,
    is_default: r.is_default as unknown as boolean,
    member_count: r.is_default ? totalMembers : 1
  }));

  const community: PublicCommunity = {
    ...row,
    rules: row.rules ? JSON.parse(row.rules) : [],
    tags: row.tags ?? [],
    is_public: row.is_public as unknown as boolean,
    member_count: row.member_count as unknown as number,
    require_approval: row.require_approval as unknown as boolean,
    is_discoverable: row.is_discoverable as unknown as boolean,
    enable_welcome: row.enable_welcome as unknown as boolean,
    is_ai_pet: row.is_ai_pet as unknown as boolean
  } as unknown as PublicCommunity;

  return {
    community,
    roles: rolesWithCount,
    members: memberRows as unknown as CommunityMemberPublic[],
    is_member: !!membership,
    is_owner: row.owner_id === userId
  };
}
