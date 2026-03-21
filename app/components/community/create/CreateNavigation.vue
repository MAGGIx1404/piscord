<template>
  <div class="flex items-center justify-between pt-8 mt-8 border-t border-border/50">
    <Button v-if="currentStep > 1" variant="secondary" @click="$emit('prev')" class="gap-2">
      <ArrowLeft class="size-4" />
      Back
    </Button>
    <div v-else />

    <Button
      v-if="currentStep < totalSteps"
      @click="$emit('next')"
      :disabled="!canProceed"
      class="gap-2"
    >
      Continue
      <ArrowRight class="size-4" />
    </Button>
    <Button
      v-else
      @click="$emit('create')"
      :disabled="!isFormValid || isCreating"
      class="gap-2 min-w-32"
    >
      <Loader2 v-if="isCreating" class="size-4 animate-spin" />
      <Rocket v-else class="size-4" />
      {{ isCreating ? "Creating..." : "Create Community" }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, Loader2, Rocket } from "lucide-vue-next";

defineProps<{
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isFormValid: boolean;
  isCreating: boolean;
}>();

defineEmits<{
  prev: [];
  next: [];
  create: [];
}>();
</script>
