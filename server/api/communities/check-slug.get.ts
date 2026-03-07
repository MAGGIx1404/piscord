import { checkCommunitySlug } from "../../services/communityService";

export default defineEventHandler(async (event) => {
  const { slug } = getQuery(event) as { slug?: string };

  if (!slug || slug.trim().length < 2) {
    throw createError({ statusCode: 400, message: "slug query param required (min 2 chars)" });
  }

  const available = await checkCommunitySlug(slug.trim().toLowerCase());
  return { available };
});
