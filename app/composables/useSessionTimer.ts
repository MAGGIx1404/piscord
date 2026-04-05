/**
 * Tracks the remaining session time based on the access token expiry.
 * Auto-refreshes the token when it's about to expire.
 * Shows an expired state when the session fully ends.
 */
export function useSessionTimer() {
  const remaining = ref(0); // seconds remaining
  const expired = ref(false);
  const { refreshToken, logout } = useAuth();
  const userStore = useUserStore();

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let expiresAt = 0;

  const minutes = computed(() => Math.floor(remaining.value / 60));
  const seconds = computed(() => remaining.value % 60);

  const display = computed(() => {
    const m = String(minutes.value).padStart(2, "0");
    const s = String(seconds.value).padStart(2, "0");
    return `${m}:${s}`;
  });

  const isLow = computed(() => remaining.value > 0 && remaining.value <= 60);

  async function fetchExpiresAt(): Promise<boolean> {
    try {
      const data = await $fetch<{ expiresAt: number }>("/api/auth/session-info");
      expiresAt = data.expiresAt;
      updateRemaining();
      return true;
    } catch {
      return false;
    }
  }

  function updateRemaining() {
    const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    remaining.value = diff;
    if (diff <= 0 && expiresAt > 0) {
      expired.value = true;
      stopTimer();
    }
  }

  async function tick() {
    updateRemaining();

    // Auto-refresh when 60 seconds or less remain
    if (remaining.value <= 60 && remaining.value > 0 && !expired.value) {
      const refreshed = await refreshToken();
      if (refreshed) {
        await fetchExpiresAt();
        expired.value = false;
      } else {
        expired.value = true;
        stopTimer();
      }
    }
  }

  function startTimer() {
    stopTimer();
    intervalId = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  async function init() {
    if (!userStore.isAuthenticated) return;
    const ok = await fetchExpiresAt();
    if (ok) {
      startTimer();
    }
  }

  async function handleExpiredAction() {
    stopTimer();
    await logout();
  }

  // Watch auth state
  watch(
    () => userStore.isAuthenticated,
    async (authed) => {
      if (authed) {
        expired.value = false;
        await init();
      } else {
        stopTimer();
        remaining.value = 0;
        expiresAt = 0;
      }
    }
  );

  onUnmounted(() => {
    stopTimer();
  });

  return {
    remaining: readonly(remaining),
    expired: readonly(expired),
    minutes,
    seconds,
    display,
    isLow,
    init,
    handleExpiredAction
  };
}
