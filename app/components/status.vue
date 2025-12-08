<template>
  <div
    class="size-3 rounded-full border border-black"
    :class="type === 'online' ? 'bg-green-500' : 'bg-gray-400'"
  ></div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: "online"
  }
});
</script>
