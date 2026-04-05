import { updateNode } from "../../../../../../../services/nodeService";
import { resolveCommunityId } from "../../../../../../../utils/community";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");
  const workspaceId = getRouterParam(event, "workspaceId");
  const nodeId = getRouterParam(event, "nodeId");

  if (!slugOrId) throw createError({ statusCode: 400, message: "Community ID is required" });
  if (!workspaceId) throw createError({ statusCode: 400, message: "Workspace ID is required" });
  if (!nodeId) throw createError({ statusCode: 400, message: "Node ID is required" });

  const body = await readBody<{
    title?: string;
    model?: string;
    position_x?: number;
    position_y?: number;
    config?: Record<string, unknown>;
  }>(event);

  const communityId = await resolveCommunityId(slugOrId);
  return updateNode(nodeId, workspaceId, communityId, userId, {
    title: body?.title,
    model: body?.model,
    position_x: body?.position_x,
    position_y: body?.position_y,
    config: body?.config as any
  });
});
