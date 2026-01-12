import {
  createCommunity,
  isSlugAvailable,
  type CreateCommunityRuleInput
} from "~~/server/service/community";
import { uploadFile } from "~~/server/utils/upload";
import type { CommunityType } from "~~/server/db/tables/enums";

interface CreateCommunityBody {
  name: string;
  slug: string;
  description: string;
  category: string;
  visibility: "public" | "private";
  tags: string[];
  rules: { text: string }[];
  requireApproval: boolean;
  enableWelcome: boolean;
  discoverable: boolean;
  iconBase64?: string | null;
  bannerBase64?: string | null;
}

export default defineEventHandler(async (event) => {
  const session = event.context.session;
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const body = await readBody<CreateCommunityBody>(event);

  // Validate required fields
  if (!body.name?.trim() || body.name.trim().length < 3) {
    throw createError({
      statusCode: 400,
      statusMessage: "Community name must be at least 3 characters"
    });
  }

  if (!body.slug?.trim() || body.slug.trim().length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: "Community slug must be at least 2 characters"
    });
  }

  if (!body.description?.trim() || body.description.trim().length < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: "Description must be at least 10 characters"
    });
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(body.slug)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug can only contain lowercase letters, numbers, and hyphens"
    });
  }

  // Check if slug is available
  const slugAvailable = await isSlugAvailable(body.slug);
  if (!slugAvailable) {
    throw createError({
      statusCode: 400,
      statusMessage: "This community URL is already taken"
    });
  }

  // Upload images if provided
  let logoUrl: string | null = null;
  let coverUrl: string | null = null;

  if (body.iconBase64) {
    try {
      const result = await uploadFile(body.iconBase64, "communities/logos", "logo.png");
      logoUrl = result.url;
    } catch (error) {
      console.error("Failed to upload logo:", error);
    }
  }

  if (body.bannerBase64) {
    try {
      const result = await uploadFile(body.bannerBase64, "communities/banners", "banner.png");
      coverUrl = result.url;
    } catch (error) {
      console.error("Failed to upload banner:", error);
    }
  }

  // Prepare rules
  const rules: CreateCommunityRuleInput[] = (body.rules || []).map((rule, index) => ({
    title: rule.text,
    sort_order: index
  }));

  // Create community
  const community = await createCommunity(
    {
      name: body.name.trim(),
      slug: body.slug.trim(),
      description: body.description.trim(),
      type: body.visibility as CommunityType,
      logo_url: logoUrl,
      cover_url: coverUrl
    },
    session.user_id,
    rules
  );

  return {
    success: true,
    community: {
      id: community?.id,
      name: community?.name,
      slug: community?.slug,
      description: community?.description,
      logo_url: community?.logo_url,
      cover_url: community?.cover_url,
      type: community?.type
    }
  };
});
