<template>
  <Card>
    <h3 class="flex items-center gap-2 font-semibold">
      <Award class="size-4" />
      Badges
    </h3>
    <div class="flex flex-wrap gap-2">
      <TooltipProvider v-for="badge in badges" :key="badge.name">
        <Tooltip>
          <TooltipTrigger>
            <div
              class="flex size-12 cursor-pointer items-center justify-center rounded-xl text-xl transition-transform hover:scale-110"
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
      </TooltipProvider>
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
