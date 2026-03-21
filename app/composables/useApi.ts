/**
 * useApi — a $fetch wrapper that forwards auth cookies during SSR
 * and works transparently on the client (browser sends cookies automatically).
 *
 * Usage:
 *   const api = useApi()
 *   const data = await api('/api/communities', { method: 'POST', body: fd })
 */
export function useApi() {
  // During SSR, grab the incoming request's cookie header so $fetch
  // forwards it to internal API routes (httpOnly cookies aren't sent otherwise).
  const headers = import.meta.server ? useRequestHeaders(["cookie"]) : {};

  return $fetch.create({
    onRequest({ options }) {
      if (import.meta.server) {
        options.headers = new Headers(options.headers as HeadersInit | undefined);
        const cookie = (headers as Record<string, string>).cookie;
        if (cookie) {
          (options.headers as Headers).set("cookie", cookie);
        }
      }
    }
  });
}
