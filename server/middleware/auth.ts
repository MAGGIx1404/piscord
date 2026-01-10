import { getSessionById } from "../service/session";
import { clearSessionCookies } from "../utils/cookie";

const authPages = ["/auth/login", "/auth/register"];
const excludedApiRoutes = [
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/user/username-available",
  "/api/auth/logout"
];

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, "session_id");
  const sessionToken = getCookie(event, "session_token");
  const isValidSessionRequest = sessionId && sessionToken;
  const pathname = getRequestURL(event).pathname;

  if (excludedApiRoutes.includes(pathname)) {
    return;
  }

  if (!isValidSessionRequest) {
    if (authPages.includes(pathname)) {
      return;
    }

    clearSessionCookies(event);
    return sendRedirect(event, "/auth/login", 302);
  }

  const session = await getSessionById(sessionId);
  if (!session || session.token !== sessionToken) {
    clearSessionCookies(event);
    return sendRedirect(event, "/auth/login", 302);
  }

  if (authPages.includes(pathname)) {
    return sendRedirect(event, "/", 302);
  }

  event.context.session = session;
});
