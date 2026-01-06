<template>
  <Card>
    <h3 class="font-semibold flex items-center gap-2">
      <Award class="size-4" />
      Badges
    </h3>
    <div class="flex flex-wrap gap-2">
      <Tooltip v-for="badge in badges" :key="badge.name">
        <TooltipTrigger>
          <div
            class="size-12 rounded-xl flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform"
            :class="badge.bg"
          >
            {{ badge.emoji }}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p class="font-medium">{{ badge.name }}</p>
          <p class="text-xs" :class="badge.color">{{ badge.description }}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Award } from "lucide-vue-next";

interface Badge {
  emoji: string;
  name: string;
  description: string;
  bg: string;
  color: string;
}

interface Props {
  badges: Badge[];
}

defineProps<Props>();
</script>
