<template>
  <div v-if="log.length" class="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5">
    <TransitionGroup name="activity">
      <div
        v-for="entry in log"
        :key="entry.id"
        class="flex items-center gap-2 rounded-full border border-border/30 bg-background/80 px-3 py-1.5 text-sm shadow-sm backdrop-blur-sm"
      >
        <span class="text-lg leading-none">{{ entry.emoji }}</span>
        <span class="max-w-28 truncate text-xs text-muted-foreground">{{ entry.username }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
interface LogEntry {
  id: number;
  emoji: string;
  username: string;
}

const log = ref<LogEntry[]>([]);
let idCounter = 0;

function add(emoji: string, username: string) {
  const entry: LogEntry = { id: ++idCounter, emoji, username };
  log.value.push(entry);

  if (log.value.length > 5) {
    log.value = log.value.slice(-5);
  }

  setTimeout(() => {
    log.value = log.value.filter((e) => e.id !== entry.id);
  }, 4000);
}

defineExpose({ add });
</script>

<style scoped>
.activity-enter-active {
  transition: all 0.3s ease-out;
}

.activity-leave-active {
  transition: all 0.4s ease-in;
}

.activity-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(0.9);
}

.activity-leave-to {
  opacity: 0;
  transform: translateX(-10px) scale(0.85);
}
</style>
