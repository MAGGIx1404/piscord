<template>
  <div class="space-y-3">
    <Button class="w-full" size="lg" :disabled="!isValid || isLoading" @click="$emit('create')">
      <Loader2 v-if="isLoading" class="size-5 mr-2 animate-spin" />
      <Rocket v-else class="size-5 mr-2" />
      {{ isLoading ? "Creating..." : "Create Community" }}
    </Button>
    <Button variant="outline" class="w-full" :disabled="isLoading" @click="$emit('cancel')">
      Cancel
    </Button>
    <p class="text-xs text-center text-muted-foreground">
      By creating a community, you agree to our
      <a href="#" class="text-primary hover:underline">Terms of Service</a>
      and
      <a href="#" class="text-primary hover:underline">Community Guidelines</a>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { Rocket, Loader2 } from "lucide-vue-next";

interface Props {
  isValid: boolean;
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false
});

defineEmits<{
  create: [];
  cancel: [];
}>();
</script>
