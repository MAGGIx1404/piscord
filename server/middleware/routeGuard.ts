import { verifyAccessToken } from "../utils/jwt";

/**
 * Server middleware that handles route protection for page requests.
 *
 * Rules:
 *  - /auth/* routes → accessible only when NOT authenticated
 *                     (redirect to / if already logged in)
 *  - All other page routes → accessible only when authenticated
 *                            (redirect to /auth/login if not logged in)
 *
 * Only runs for page navigations (skips /api/, /_nuxt/, static assets).
 */
const SKIP_PREFIXES = ["/api/", "/_nuxt/", "/__nuxt", "/_loading"];
const STATIC_EXTENSIONS = [
  ".js",
  ".css",
  ".ico",
  ".png",
  ".jpg",
  ".svg",
  ".woff",
  ".woff2",
  ".ttf",
  ".webp",
  ".gif",
  ".map"
];

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;

  // Skip API routes, Nuxt internals, and static assets
  if (SKIP_PREFIXES.some((prefix) => path.startsWith(prefix))) return;
  if (STATIC_EXTENSIONS.some((ext) => path.endsWith(ext))) return;

  // Check if user is authenticated via access_token cookie
  const token = getCookie(event, "access_token");
  let isAuthenticated = false;

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      // Store userId in context for downstream use (SSR)
      event.context.userId = payload.userId;
      isAuthenticated = true;
    } catch {
      // Token invalid/expired — treat as unauthenticated
    }
  }

  const isGuestRoute = path.startsWith("/auth/");

  // Authenticated user trying to access auth pages → redirect to home
  if (isGuestRoute && isAuthenticated) {
    return sendRedirect(event, "/", 302);
  }

  // Unauthenticated user trying to access protected pages → redirect to login
  if (!isGuestRoute && !isAuthenticated) {
    return sendRedirect(event, "/auth/login", 302);
  }
});
