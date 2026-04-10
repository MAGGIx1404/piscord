<template>
  <div
    class="group flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-300"
    :class="[
      participant.isSpeaking && !participant.isMuted
        ? 'border-green-500/30 bg-green-500/6 shadow-lg shadow-green-500/10'
        : 'border-border/40 bg-card/50 hover:border-border/60 hover:bg-card/80'
    ]"
  >
    <!-- Avatar with speaking ring -->
    <div class="relative">
      <div
        class="rounded-full p-0.5 transition-all duration-300"
        :class="
          participant.isSpeaking && !participant.isMuted
            ? 'bg-linear-to-br from-green-400 to-emerald-600'
            : 'bg-transparent'
        "
      >
        <Avatar
          class="size-20 border-2 border-background transition-transform duration-200 group-hover:scale-105"
        >
          <AvatarImage
            :src="participant.avatarUrl || '/images/avatar/default.png'"
            :alt="participant.username"
          />
          <AvatarFallback class="text-xl font-semibold">
            {{ participant.username.slice(0, 2).toUpperCase() }}
          </AvatarFallback>
        </Avatar>
      </div>

      <!-- Speaking animation rings -->
      <template v-if="participant.isSpeaking && !participant.isMuted">
        <div
          class="absolute inset-0 rounded-full border-2 border-green-500/30"
          style="animation: voice-ripple 2s ease-out infinite"
        />
        <div
          class="absolute inset-0 rounded-full border-2 border-green-500/20"
          style="animation: voice-ripple 2s ease-out infinite 0.5s"
        />
      </template>

      <!-- Mute badge -->
      <div
        v-if="participant.isMuted"
        class="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-red-500 text-white shadow-md"
      >
        <MicOff class="size-3.5" />
      </div>

      <!-- Speaking indicator -->
      <div
        v-else-if="participant.isSpeaking"
        class="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-green-500 text-white shadow-md"
      >
        <AudioLines class="size-3.5" />
      </div>
    </div>

    <!-- Name -->
    <div class="text-center">
      <p class="text-sm font-semibold">
        {{ participant.username }}
        <span v-if="isCurrentUser" class="font-normal text-muted-foreground">(You)</span>
      </p>
      <p class="mt-0.5 text-[11px] text-muted-foreground">
        <span v-if="participant.isMuted" class="text-red-400">Muted</span>
        <span v-else-if="participant.isSpeaking" class="text-green-400">Speaking</span>
        <span v-else>Listening</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MicOff, AudioLines } from "lucide-vue-next";
import type { VoiceParticipant } from "~/composables/useVoiceChannel";

defineProps<{
  participant: VoiceParticipant;
  isCurrentUser: boolean;
}>();
</script>

<style scoped>
@keyframes voice-ripple {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
</style>
