import prisma from "@@/lib/prisma";

const ignore = [
  "/auth/login",
  "/api/auth/login",
  "/auth/register",
  "/api/auth/register"
];

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "token");
  const path = getRequestURL(event).pathname;

  const isInIgnoreList = ignore.some((ignorePath) =>
    path.startsWith(ignorePath)
  );

  if (!token && isInIgnoreList) {
    console.log(
      "No token found, but path is in ignore list. Proceeding without auth."
    );
    return;
  }

  if (!token && !isInIgnoreList) {
    setResponseStatus(event, 401);
    return sendRedirect(event, "/auth/login", 302);
  }

  if (token && isInIgnoreList) {
    setResponseStatus(event, 302);
    return sendRedirect(event, "/", 302);
  }

  const isValidToken = verifyToken(token);
  if (!isValidToken) {
    setResponseStatus(event, 401);
    clearCookie(event, "token");
    return sendRedirect(event, "/auth/login", 302);
  }

  setHeader(event, "Authorization", `Bearer ${token}`);

  const { id } = getUserFromToken(token);
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    setResponseStatus(event, 401);
    clearCookie(event, "token");
    return sendRedirect(event, "/auth/login", 302);
  }

  event.context.user = user;
});
