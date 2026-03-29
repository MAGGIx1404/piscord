import { runSingleNode } from "../../../../../../../services/nodeService";
import { resolveCommunityId } from "../../../../../../../utils/community";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");
  const workspaceId = getRouterParam(event, "workspaceId");
  const nodeId = getRouterParam(event, "nodeId");

  if (!slugOrId) throw createError({ statusCode: 400, message: "Community ID is required" });
  if (!workspaceId) throw createError({ statusCode: 400, message: "Workspace ID is required" });
  if (!nodeId) throw createError({ statusCode: 400, message: "Node ID is required" });

  const body = await readBody<{ prompt?: string }>(event);
  if (!body?.prompt?.trim()) {
    throw createError({ statusCode: 400, message: "Prompt is required" });
  }

  const communityId = await resolveCommunityId(slugOrId);
  return runSingleNode(nodeId, workspaceId, userId, body.prompt.trim());
});
