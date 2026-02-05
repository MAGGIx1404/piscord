import { findUserByUsername } from "~~/server/service/user";

export default defineEventHandler(async (event) => {
  const { username } = await readBody(event);
  if (!username || typeof username !== "string") {
    return sendError(event, createError({ statusCode: 400, statusMessage: "Invalid username" }));
  }
  const userWithUsername = await findUserByUsername(username);
  return { available: !userWithUsername };
});
