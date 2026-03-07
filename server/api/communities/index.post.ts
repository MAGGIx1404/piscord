import { createCommunity } from "../../services/communityService";
import type { CreateCommunityPayload } from "../../services/communityService";

export default defineEventHandler(async (event) => {
  const ownerId = requireAuth(event);

  const parts = await readMultipartFormData(event);
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, message: "Multipart form data required" });
  }

  // ─── Parse fields ──────────────────────────────────────────────────────────

  const field = (name: string): string | undefined => {
    const p = parts.find((p) => p.name === name);
    return p?.data ? p.data.toString("utf-8") : undefined;
  };

  const name = field("name");
  const slug = field("slug");
  const description = field("description");
  const category = field("category");
  const visibility = (field("visibility") ?? "public") as "public" | "private";

  if (!name || name.trim().length < 3) {
    throw createError({ statusCode: 400, message: "Name must be at least 3 characters" });
  }
  if (!slug || slug.trim().length < 2) {
    throw createError({ statusCode: 400, message: "Slug is required" });
  }
  if (!description || description.trim().length < 10) {
    throw createError({ statusCode: 400, message: "Description must be at least 10 characters" });
  }
  if (!category) {
    throw createError({ statusCode: 400, message: "Category is required" });
  }

  let tags: string[] = [];
  const rawTags = field("tags");
  if (rawTags) {
    try {
      tags = JSON.parse(rawTags);
    } catch {
      tags = [];
    }
  }

  let rules: Array<{ id: number; text: string }> = [];
  const rawRules = field("rules");
  if (rawRules) {
    try {
      rules = JSON.parse(rawRules);
    } catch {
      rules = [];
    }
  }

  const payload: CreateCommunityPayload = {
    name,
    slug: slug.trim(),
    description,
    category,
    tags,
    rules,
    visibility,
    requireApproval: field("requireApproval") === "true",
    enableWelcome: field("enableWelcome") !== "false",
    discoverable: field("discoverable") !== "false",
    isAiPet: field("isAiPet") === "true",
    aiAgentName: field("aiAgentName") ?? null,
    aiAgentPetName: field("aiAgentPetName") ?? null,
    aiAgentAvatar: field("aiAgentAvatar") ?? null,
    aiAgentModel: field("aiAgentModel") ?? null,
    aiAgentDescription: field("aiAgentDescription") ?? null
  };

  // ─── File parts ────────────────────────────────────────────────────────────
  const iconPart = parts.find((p) => p.name === "icon") ?? null;
  const bannerPart = parts.find((p) => p.name === "banner") ?? null;
  const aiAgentAvatarPart = parts.find((p) => p.name === "aiAgentAvatarFile") ?? null;

  const community = await createCommunity(
    ownerId,
    payload,
    iconPart ? { data: iconPart.data, type: iconPart.type, filename: iconPart.filename } : null,
    bannerPart
      ? { data: bannerPart.data, type: bannerPart.type, filename: bannerPart.filename }
      : null,
    aiAgentAvatarPart
      ? {
          data: aiAgentAvatarPart.data,
          type: aiAgentAvatarPart.type,
          filename: aiAgentAvatarPart.filename
        }
      : null
  );

  return { community };
});
