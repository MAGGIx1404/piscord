export function usePuterAuth() {
  const puterToken = ref<string | null>(null);
  const isAuthenticated = ref(false);

  async function ensureAuth(): Promise<string> {
    if (puterToken.value) return puterToken.value;

    const { puter } = await import("@heyputer/puter.js");
    if (!puter.auth?.isSignedIn()) {
      await puter.auth.signIn();
    }
    const token: string = puter.authToken ?? "";
    puterToken.value = token;
    isAuthenticated.value = true;
    return token;
  }

  return { puterToken, isAuthenticated, ensureAuth };
}
