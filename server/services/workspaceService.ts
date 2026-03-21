import { db, generateId } from "../db";

// Permission bitmask
// 4 = manage_channels (also covers workspaces)
const MANAGE_CHANNELS = 4;

export interface CreateWorkspacePayload {
  name: string;
  emoji?: string;
  description?: string;
  banner_url?: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  emoji: string | null;
  description: string | null;
  banner_url: string | null;
  is_public: boolean;
  created_by: string;
  created_at: Date;
}

export interface WorkspaceListResult {
  workspaces: WorkspaceItem[];
  can_manage: boolean;
}

async function requireMembership(communityId: string, userId: string) {
  const membership = await db
    .selectFrom("community_members")
    .select("id")
    .where("community_id", "=", communityId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!membership) {
    throw createError({ statusCode: 403, message: "You are not a member of this community" });
  }

  return membership;
}

async function checkCanManage(communityId: string, userId: string): Promise<boolean> {
  const community = await db
    .selectFrom("communities")
    .select("owner_id")
    .where("id", "=", communityId)
    .executeTakeFirst();

  if (!community) {
    throw createError({ statusCode: 404, message: "Community not found" });
  }

  if (community.owner_id === userId) return true;

  const membership = await db
    .selectFrom("community_members")
    .select("id")
    .where("community_id", "=", communityId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!membership) return false;

  const roleRow = await db
    .selectFrom("member_roles as mr")
    .innerJoin("roles as r", "r.id", "mr.role_id")
    .select("r.permissions")
    .where("mr.member_id", "=", membership.id)
    .where("r.community_id", "=", communityId)
    .execute();

  return roleRow.some((r) => ((r.permissions as number) & MANAGE_CHANNELS) !== 0);
}

export async function getWorkspacesByCommunity(
  communityId: string,
  userId: string
): Promise<WorkspaceListResult> {
  await requireMembership(communityId, userId);
  const canManage = await checkCanManage(communityId, userId);

  const rows = await db
    .selectFrom("workspaces")
    .select([
      "id",
      "name",
      "emoji",
      "description",
      "banner_url",
      "is_public",
      "created_by",
      "created_at"
    ])
    .where("community_id", "=", communityId)
    .orderBy("created_at", "asc")
    .execute();

  return {
    workspaces: rows.map((r) => ({
      ...r,
      is_public: r.is_public
    })),
    can_manage: canManage
  };
}

export async function createWorkspace(
  communityId: string,
  userId: string,
  payload: CreateWorkspacePayload
): Promise<WorkspaceItem> {
  const canManage = await checkCanManage(communityId, userId);
  if (!canManage) {
    throw createError({
      statusCode: 403,
      message: "You don't have permission to create workspaces"
    });
  }

  const id = generateId();
  await db
    .insertInto("workspaces")
    .values({
      id,
      community_id: communityId,
      created_by: userId,
      name: payload.name,
      emoji: payload.emoji ?? null,
      description: payload.description ?? null,
      banner_url: payload.banner_url ?? null
    })
    .execute();

  const workspace = await db
    .selectFrom("workspaces")
    .select([
      "id",
      "name",
      "emoji",
      "description",
      "banner_url",
      "is_public",
      "created_by",
      "created_at"
    ])
    .where("id", "=", id)
    .executeTakeFirstOrThrow();

  return {
    ...workspace,
    is_public: workspace.is_public
  };
}
