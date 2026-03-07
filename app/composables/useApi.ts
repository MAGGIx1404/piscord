/**
 * useApi — a $fetch wrapper that automatically injects the
 * `Authorization: Bearer <token>` header from the user store.
 *
 * Usage:
 *   const api = useApi()
 *   const data = await api('/api/communities', { method: 'POST', body: fd })
 */
export function useApi() {
  const userStore = useUserStore();

  return $fetch.create({
    onRequest({ options }) {
      const token = userStore.accessToken;
      if (token) {
        options.headers = new Headers(options.headers as HeadersInit | undefined);
        (options.headers as Headers).set("Authorization", `Bearer ${token}`);
      }
    }
  });
}
