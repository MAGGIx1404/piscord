<template>
  <Card class="gap-4">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold flex items-center gap-2">
        <Info class="size-4" />
        About
      </h3>
      <Button variant="ghost" size="icon" class="size-7" @click="$emit('edit')">
        <Pencil class="size-3" />
      </Button>
    </div>
    <div class="space-y-3 text-sm">
      <div class="flex items-center gap-3">
        <Globe class="size-4 text-muted-foreground" />
        <span>{{ visibility }}</span>
      </div>
      <div class="flex items-center gap-3">
        <Calendar class="size-4 text-muted-foreground" />
        <span>Created {{ createdAt }}</span>
      </div>
      <div class="flex items-center gap-3">
        <MapPin class="size-4 text-muted-foreground" />
        <span>{{ location }}</span>
      </div>
      <div v-if="website" class="flex items-center gap-3">
        <LinkIcon class="size-4 text-muted-foreground" />
        <a :href="website" class="text-primary hover:underline" target="_blank">
          {{ websiteDisplay }}
        </a>
      </div>
    </div>
    <!-- Tags -->
    <div v-if="tags.length" class="flex flex-wrap gap-2 pt-2">
      <Badge v-for="tag in tags" :key="tag" variant="secondary" class="text-xs">
        {{ tag }}
      </Badge>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Info, Pencil, Globe, Calendar, MapPin, LinkIcon } from "lucide-vue-next";
import { computed } from "vue";

interface Props {
  visibility?: string;
  createdAt: string;
  location?: string;
  website?: string;
  tags?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  visibility: "Public Community",
  location: "Global",
  tags: () => []
});

defineEmits<{
  edit: [];
}>();

const websiteDisplay = computed(() => {
  if (!props.website) return "";
  return props.website.replace(/^https?:\/\//, "").replace(/\/$/, "");
});
</script>
