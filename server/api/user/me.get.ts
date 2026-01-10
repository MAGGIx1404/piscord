import { findUserById } from "~~/server/service/user";

export default defineEventHandler(async (event) => {
  const session = event.context.session;
  if (!session) {
    return sendError(event, createError({ statusCode: 401, statusMessage: "Unauthorized" }));
  }

  const user = await findUserById(session.user_id);
  if (!user) {
    return sendError(event, createError({ statusCode: 404, statusMessage: "User not found" }));
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar: user.avatar_url,
    is_premium: user.is_premium,
    about: user.about
  };
});
