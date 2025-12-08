<template>
  <div class="w-[400px] sticky top-0 h-screen py-4">
    <div class="size-full bg-white border-2 border-black shadow-xl rounded-xl overflow-hidden">
      <!-- User Panel -->
      <InfopanelUsersPanel v-if="route.name !== 'servers-id'" />
      <!-- Server Panel -->
      <InfopanelServerPanel v-else />
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
</script>
