import { isSlugAvailable } from "~~/server/service/community";

export default defineEventHandler(async (event) => {
  const session = event.context.session;
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const query = getQuery(event);
  const slug = query.slug as string;

  if (!slug || typeof slug !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Slug is required" });
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return {
      available: false,
      reason: "Slug can only contain lowercase letters, numbers, and hyphens"
    };
  }

  if (slug.length < 2) {
    return {
      available: false,
      reason: "Slug must be at least 2 characters"
    };
  }

  if (slug.length > 30) {
    return {
      available: false,
      reason: "Slug must be at most 30 characters"
    };
  }

  const available = await isSlugAvailable(slug);

  return {
    available,
    reason: available ? null : "This URL is already taken"
  };
});
