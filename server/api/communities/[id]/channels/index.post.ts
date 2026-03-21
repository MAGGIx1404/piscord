import { createChannel } from "../../../../services/channelService";
import type { CreateChannelPayload } from "../../../../services/channelService";
import type { ChannelType } from "../../../../db/tables";
import { resolveCommunityId } from "../../../../utils/community";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const slugOrId = getRouterParam(event, "id");

  if (!slugOrId) {
    throw createError({ statusCode: 400, message: "Community ID is required" });
  }

  const communityId = await resolveCommunityId(slugOrId);

  const body = await readBody<CreateChannelPayload>(event);

  if (!body.name || body.name.trim().length < 1) {
    throw createError({ statusCode: 400, message: "Channel name is required" });
  }

  if (body.name.trim().length > 100) {
    throw createError({ statusCode: 400, message: "Channel name must be 100 characters or less" });
  }

  const validTypes: ChannelType[] = ["text", "voice", "announcement", "category"];
  if (body.type && !validTypes.includes(body.type)) {
    throw createError({
      statusCode: 400,
      message: `Invalid channel type. Must be one of: ${validTypes.join(", ")}`
    });
  }

  return createChannel(communityId, userId, {
    name: body.name.trim(),
    type: body.type,
    topic: body.topic?.trim(),
    description: body.description?.trim(),
    banner_url: body.banner_url?.trim(),
    parent_id: body.parent_id,
    is_private: body.is_private
  });
});
