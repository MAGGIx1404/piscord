<template>
  <figure
    class="rounded-t-lg relative overflow-hidden"
    :class="{
      'h-40': size === 'md',
      'h-60': size === 'lg',
      'h-80': size === 'xl'
    }"
  >
    <img
      :src="src"
      :alt="alt"
      class="size-full group-hover:scale-105 transition-transform duration-300"
    />

    <div class="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
  </figure>
</template>

<script setup>
defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: "Image Poster" },
  size: {
    type: String,
    validator: (v) => ["md", "lg", "xl"].includes(v),
    default: "xl"
  }
});
</script>
