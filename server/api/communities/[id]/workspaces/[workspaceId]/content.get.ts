import { db } from "../../../../../db";
import { resolveCommunityId } from "../../../../../utils/community";
import { requireWorkspaceMembership } from "../../../../../services/workspaceService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");
  const workspaceId = getRouterParam(event, "workspaceId");

  if (!slugOrId) throw createError({ statusCode: 400, message: "Community ID is required" });
  if (!workspaceId) throw createError({ statusCode: 400, message: "Workspace ID is required" });

  await resolveCommunityId(slugOrId);
  await requireWorkspaceMembership(workspaceId, userId);

  const workspace = await db
    .selectFrom("workspaces")
    .select(["content", "updated_at"])
    .where("id", "=", workspaceId)
    .executeTakeFirstOrThrow();

  let content = null;
  if (workspace.content) {
    try {
      content = JSON.parse(workspace.content.toString("utf-8"));
    } catch {
      content = null;
    }
  }

  return {
    content,
    updated_at: workspace.updated_at
  };
});
