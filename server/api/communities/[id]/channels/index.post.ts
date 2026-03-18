import { createChannel } from "../../../../services/channelService";
import type { CreateChannelPayload } from "../../../../services/channelService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const communityId = getRouterParam(event, "id");

  if (!communityId) {
    throw createError({ statusCode: 400, message: "Community ID is required" });
  }

  const body = await readBody<CreateChannelPayload>(event);

  if (!body.name || body.name.trim().length < 1) {
    throw createError({ statusCode: 400, message: "Channel name is required" });
  }

  if (body.name.trim().length > 100) {
    throw createError({ statusCode: 400, message: "Channel name must be 100 characters or less" });
  }

  const validTypes = ["text", "voice", "announcement", "category"];
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
    parent_id: body.parent_id,
    is_private: body.is_private
  });
});
