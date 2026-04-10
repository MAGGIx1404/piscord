import { db } from "../../../../../db";
import { resolveCommunityId } from "../../../../../utils/community";
import { requireWorkspaceMembership } from "../../../../../services/workspaceService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");
  const workspaceId = getRouterParam(event, "workspaceId");

  if (!slugOrId) throw createError({ statusCode: 400, message: "Community ID is required" });
  if (!workspaceId) throw createError({ statusCode: 400, message: "Workspace ID is required" });

  const communityId = await resolveCommunityId(slugOrId);
  await requireWorkspaceMembership(workspaceId, userId);

  // Find distinct users who created prompt_runs in this workspace
  const activeUserIds = await db
    .selectFrom("prompt_runs")
    .select("created_by")
    .distinct()
    .where("workspace_id", "=", workspaceId)
    .where("created_by", "is not", null)
    .execute();

  const ids = activeUserIds.map((r) => r.created_by).filter(Boolean) as string[];

  // Always include the current user
  if (!ids.includes(userId)) ids.push(userId);

  if (!ids.length) return [];

  const members = await db
    .selectFrom("users")
    .select(["id", "username", "avatar_url"])
    .where("id", "in", ids)
    .orderBy("username", "asc")
    .execute();

  return members;
});
