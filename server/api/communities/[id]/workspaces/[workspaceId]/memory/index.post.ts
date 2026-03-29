import { addMemory } from "#server/services/memoryService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");
  const workspaceId = getRouterParam(event, "workspaceId");

  if (!slugOrId) throw createError({ statusCode: 400, message: "Community ID is required" });
  if (!workspaceId) throw createError({ statusCode: 400, message: "Workspace ID is required" });

  const body = await readBody<{ content?: string; type?: string }>(event);
  if (!body?.content?.trim())
    throw createError({ statusCode: 400, message: "Content is required" });

  await resolveCommunityId(slugOrId);
  return addMemory(workspaceId, userId, body.content.trim(), body.type ?? "note");
});
