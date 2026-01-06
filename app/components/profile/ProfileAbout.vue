<template>
  <Card class="gap-4">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold flex items-center gap-2">
        <User class="size-4" />
        About Me
      </h3>
      <Button v-if="editable" variant="ghost" size="icon" class="size-7" @click="$emit('edit')">
        <Pencil class="size-3" />
      </Button>
    </div>
    <div class="space-y-3 text-sm">
      <div v-if="location" class="flex items-center gap-3">
        <MapPin class="size-4 text-muted-foreground" />
        <span>{{ location }}</span>
      </div>
      <div v-if="birthday" class="flex items-center gap-3">
        <Cake class="size-4 text-muted-foreground" />
        <span>{{ birthday }}</span>
      </div>
      <div v-if="occupation" class="flex items-center gap-3">
        <Briefcase class="size-4 text-muted-foreground" />
        <span>{{ occupation }}</span>
      </div>
      <div v-if="website" class="flex items-center gap-3">
        <Globe class="size-4 text-muted-foreground" />
        <a :href="websiteUrl" class="text-primary hover:underline" target="_blank" rel="noopener">
          {{ website }}
        </a>
      </div>
      <slot />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { User, Pencil, MapPin, Cake, Briefcase, Globe } from "lucide-vue-next";

interface Props {
  location?: string;
  birthday?: string;
  occupation?: string;
  website?: string;
  websiteUrl?: string;
  editable?: boolean;
}

withDefaults(defineProps<Props>(), {
  location: "",
  birthday: "",
  occupation: "",
  website: "",
  websiteUrl: "#",
  editable: false
});

defineEmits<{
  edit: [];
}>();
</script>
