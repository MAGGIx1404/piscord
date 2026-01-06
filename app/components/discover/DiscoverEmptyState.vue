<template>
  <div class="w-full flex flex-col items-center justify-center py-20 space-y-4">
    <div class="size-20 rounded-full bg-muted flex items-center justify-center">
      <SearchX class="size-10 text-muted-foreground" />
    </div>
    <div class="text-center space-y-2">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <p class="text-sm text-muted-foreground max-w-md">
        {{ description }}
      </p>
    </div>
    <Button variant="outline" @click="$emit('reset')">
      <RotateCcw class="size-4" />
      {{ resetButtonText }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { SearchX, RotateCcw } from "lucide-vue-next";

interface Props {
  title?: string;
  description?: string;
  resetButtonText?: string;
}

withDefaults(defineProps<Props>(), {
  title: "No communities found",
  description:
    "We couldn't find any communities matching your search. Try adjusting your filters or search term.",
  resetButtonText: "Reset filters"
});

defineEmits<{
  reset: [];
}>();
</script>
