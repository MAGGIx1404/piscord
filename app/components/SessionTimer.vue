<template>
  <div v-if="userStore.isAuthenticated">
    <!-- Countdown pill at bottom-right -->
    <div
      class="fixed -right-px -bottom-px z-50 flex items-center gap-2 rounded-tl-xl px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm transition-colors"
      :class="
        isLow
          ? 'bg-destructive/90 text-destructive-foreground'
          : 'border border-border bg-card/90 text-muted-foreground'
      "
    >
      <Clock class="size-3" :class="isLow ? 'animate-pulse' : ''" />
      <span class="font-mono text-sm tabular-nums">{{ display }}</span>
    </div>

    <!-- Session expired modal -->
    <Dialog :open="expired">
      <DialogContent :hideClose="true" class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <TimerOff class="size-5 text-destructive" />
            Session Expired
          </DialogTitle>
          <DialogDescription>
            Your session time is up. Please log in again to continue.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button class="w-full" @click="handleExpiredAction">
            <LogIn class="mr-2 size-4" />
            Back to Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Clock, TimerOff, LogIn } from "lucide-vue-next";

const userStore = useUserStore();
const { display, expired, isLow, init, handleExpiredAction } = useSessionTimer();

onMounted(() => {
  if (userStore.isAuthenticated) {
    init();
  }
});
</script>
