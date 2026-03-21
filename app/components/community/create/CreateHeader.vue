<template>
  <div class="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
    <div class="px-6 py-5">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <Button variant="ghost" size="icon" @click="$emit('cancel')" class="rounded-full">
            <ArrowLeft class="size-5" />
          </Button>
          <div>
            <h1 class="text-xl font-bold">Create Community</h1>
            <p class="text-sm text-muted-foreground">Step {{ currentStep }} of {{ totalSteps }}</p>
          </div>
        </div>
        <div class="text-sm text-muted-foreground">
          {{ stepTitles[currentStep - 1] }}
        </div>
      </div>

      <!-- Step Progress Bar -->
      <div class="flex items-center gap-2">
        <template v-for="step in totalSteps" :key="step">
          <div
            class="flex-1 h-1.5 rounded-full transition-all duration-500"
            :class="[
              step <= currentStep ? 'bg-primary' : 'bg-muted',
              step === currentStep ? 'shadow-lg shadow-primary/30' : ''
            ]"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

defineProps<{
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}>();

defineEmits<{
  cancel: [];
}>();
</script>
