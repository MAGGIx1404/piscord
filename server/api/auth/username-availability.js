import prisma from "@@/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username } = body;

  const existingUser = await prisma.user.findUnique({ where: { username } });
  return { available: !existingUser };
});
