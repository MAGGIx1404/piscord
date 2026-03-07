import { getCommunityOverview } from "../../../services/communityService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, message: "Community ID or slug is required" });
  }

  const overview = await getCommunityOverview(id, userId);
  return overview;
});
