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

  const messages = await db
    .selectFrom("node_messages as nm")
    .innerJoin("ai_nodes as n", "n.id", "nm.node_id")
    .select([
      "nm.id",
      "nm.node_id",
      "nm.role",
      "nm.content",
      "nm.created_at",
      "n.title as node_title",
      "n.model as node_model"
    ])
    .where("n.workspace_id", "=", workspaceId)
    .orderBy("nm.created_at", "asc")
    .execute();

  return messages;
});
