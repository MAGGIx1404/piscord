<template>
  <div class="pointer-events-none absolute inset-0 z-30 overflow-hidden">
    <span
      v-for="drop in drops"
      :key="drop.id"
      class="emoji-drop absolute select-none"
      :style="{
        left: drop.x + '%',
        top: '-48px',
        fontSize: drop.size + 'rem',
        '--end-rotation': drop.rotation + 'deg',
        animationDuration: drop.duration + 's',
        animationDelay: drop.delay + 's'
      }"
    >
      {{ drop.emoji }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface EmojiDrop {
  id: number;
  emoji: string;
  x: number;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
}

const drops = ref<EmojiDrop[]>([]);
let idCounter = 0;

function spawn(emoji: string) {
  const count = 18 + Math.floor(Math.random() * 12);
  const newDrops: EmojiDrop[] = [];
  for (let i = 0; i < count; i++) {
    newDrops.push({
      id: ++idCounter,
      emoji,
      x: Math.random() * 95 + 2,
      size: 0.8 + Math.random() * 1.6,
      rotation: Math.floor(Math.random() * 90 - 45),
      duration: 1.8 + Math.random() * 2,
      delay: Math.random() * 0.6
    });
  }
  drops.value.push(...newDrops);

  setTimeout(() => {
    const ids = new Set(newDrops.map((d) => d.id));
    drops.value = drops.value.filter((d) => !ids.has(d.id));
  }, 5000);
}

defineExpose({ spawn });
</script>

<style>
.emoji-drop {
  animation-name: emoji-fall;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-fill-mode: forwards;
  opacity: 0;
}

@keyframes emoji-fall {
  0% {
    transform: translateY(0) rotate(0deg) scale(0.2);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translateY(8vh) rotate(5deg) scale(0.5);
  }
  50% {
    opacity: 0.95;
    transform: translateY(45vh) rotate(var(--end-rotation, 25deg)) scale(0.9);
  }
  85% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(105vh) rotate(var(--end-rotation, 25deg)) scale(1.1);
    opacity: 0;
  }
}
</style>
