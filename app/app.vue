<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
  <Toaster position="top-center" />
  <ThemeChanger />
</template>

<script setup>
import "vue-sonner/style.css";
</script>
