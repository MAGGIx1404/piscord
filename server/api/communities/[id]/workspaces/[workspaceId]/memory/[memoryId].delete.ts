import { deleteMemory } from "#server/services/memoryService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");
  const workspaceId = getRouterParam(event, "workspaceId");
  const memoryId = getRouterParam(event, "memoryId");

  if (!slugOrId) throw createError({ statusCode: 400, message: "Community ID is required" });
  if (!workspaceId) throw createError({ statusCode: 400, message: "Workspace ID is required" });
  if (!memoryId) throw createError({ statusCode: 400, message: "Memory ID is required" });

  await resolveCommunityId(slugOrId);
  await deleteMemory(memoryId, workspaceId, userId);
  return { success: true };
});
