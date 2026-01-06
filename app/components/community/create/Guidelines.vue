<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-base">
        <ScrollText class="size-5" />
        Community Guidelines
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-3 text-sm text-muted-foreground">
      <div v-for="(guideline, index) in guidelines" :key="index" class="flex gap-2">
        <CheckCircle class="size-4 text-green-500 shrink-0 mt-0.5" />
        <span>{{ guideline }}</span>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ScrollText, CheckCircle } from "lucide-vue-next";

interface Props {
  guidelines?: string[];
}

withDefaults(defineProps<Props>(), {
  guidelines: () => [
    "Choose a unique and appropriate name",
    "Write a clear description of your community",
    "Select relevant category and tags",
    "No hate speech or harmful content",
    "Respect intellectual property rights"
  ]
});
</script>
