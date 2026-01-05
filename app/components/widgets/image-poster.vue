<template>
  <figure
    class="rounded-lg"
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
