<template>
  <div class="rounded-2xl border border-border/50 p-5 bg-card/30 space-y-4">
    <div class="flex items-center gap-2 text-sm font-medium">
      <Lightbulb class="size-4 text-amber-500" />
      Tips for Step {{ currentStep }}
    </div>
    <ul class="space-y-2 text-sm text-muted-foreground">
      <template v-if="currentStep === 1">
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          Choose a memorable, unique name
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          Use high-quality images for icon & banner
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          Write a clear, engaging description
        </li>
      </template>
      <template v-else-if="currentStep === 2">
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          Pick the most relevant category
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          Use specific, searchable tags
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          Think about what people would search for
        </li>
      </template>
      <template v-else-if="currentStep === 3">
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          Keep rules clear and concise
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          Cover the most important guidelines
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          You can always add more later
        </li>
      </template>
      <template v-else>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          Public communities grow faster
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          Approval helps control quality
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          Welcome messages boost engagement
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Lightbulb } from "lucide-vue-next";

defineProps<{
  currentStep: number;
}>();
</script>
