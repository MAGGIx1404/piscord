import { findUserByUsername } from "~~/server/service/user";

export default defineEventHandler(async (event) => {
  const username = getQuery(event).username as string;
  const userWithUsername = await findUserByUsername(username);
  return { available: userWithUsername === null };
});
