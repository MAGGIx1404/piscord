<template>
  <TooltipProvider :delay-duration="200">
    <div class="flex items-center gap-2">
      <!-- Mute Toggle -->
      <Tooltip>
        <TooltipTrigger as-child>
          <button
            class="flex size-9 items-center justify-center rounded-xl border transition-all duration-200"
            :class="
              isMuted
                ? 'border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25'
                : 'border-border/50 bg-muted/50 text-foreground hover:bg-muted'
            "
            @click="$emit('toggle-mute')"
          >
            <MicOff v-if="isMuted" class="size-4" />
            <Mic v-else class="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{{ isMuted ? "Unmute" : "Mute" }}</TooltipContent>
      </Tooltip>

      <!-- Reaction Button -->
      <Popover v-model:open="pickerOpen">
        <PopoverTrigger as-child>
          <button
            class="flex size-9 items-center justify-center rounded-xl border border-border/50 bg-muted/50 text-foreground transition-all duration-200 hover:bg-muted"
            title="Reactions"
          >
            <SmilePlus class="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" :side-offset="8" class="w-auto p-2">
          <div class="grid grid-cols-5 gap-1">
            <button
              v-for="emoji in emojis"
              :key="emoji"
              class="flex size-10 items-center justify-center rounded-lg text-xl transition-all hover:scale-110 hover:bg-muted"
              @click="handleReaction(emoji)"
            >
              {{ emoji }}
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <!-- Leave Call -->
      <Tooltip>
        <TooltipTrigger as-child>
          <button
            class="flex size-9 items-center justify-center rounded-xl bg-red-500 text-white shadow-md shadow-red-500/20 transition-all duration-200 hover:bg-red-600"
            @click="$emit('leave')"
          >
            <PhoneOff class="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Leave Call</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { Mic, MicOff, PhoneOff, SmilePlus } from "lucide-vue-next";

defineProps<{
  isMuted: boolean;
}>();

const emit = defineEmits<{
  "toggle-mute": [];
  leave: [];
  reaction: [emoji: string];
}>();

const emojis = ["🔥", "❤️", "😂", "👏", "🎉", "😍", "🤯", "💀", "👀", "✨"];
const pickerOpen = ref(false);

function handleReaction(emoji: string) {
  emit("reaction", emoji);
  pickerOpen.value = false;
}
</script>
