<template>
  <div class="w-full relative overflow-hidden">
    <WidgetsImagePoster :src="backgroundImage" />
    <div class="max-w-3xl absolute bottom-0 left-0 p-10 text-white space-y-3">
      <h1 class="text-5xl font-bold">{{ title }}</h1>
      <p class="text-lg">{{ description }}</p>
      <slot name="actions">
        <Button variant="secondary" as-child>
          <NuxtLink :to="createLink">
            <BadgePlus />
            {{ createButtonText }}
          </NuxtLink>
        </Button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BadgePlus } from "lucide-vue-next";

interface Props {
  title?: string;
  description?: string;
  backgroundImage?: string;
  createLink?: string;
  createButtonText?: string;
}

withDefaults(defineProps<Props>(), {
  title: "Discover Communities",
  description:
    "Explore a variety of communities and join the ones that interest you. Connect, share, and grow with like-minded individuals.",
  backgroundImage: "/images/servers/p-4.jpg",
  createLink: "/community/create",
  createButtonText: "Create Community"
});
</script>
