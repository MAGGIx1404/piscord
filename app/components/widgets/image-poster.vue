<template>
  <figure class="h-80 rounded-md">
    <img :src="src" :alt="alt" class="size-full" />
  </figure>
</template>

<script setup>
defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: "Image Poster" }
});
</script>
