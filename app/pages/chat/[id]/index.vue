<template>
  <Card class="h-full">
    <h1>Chat Page for ID: {{ chatId }}</h1>
  </Card>
</template>

<script setup>
const route = useRoute();
const chatId = route.params.id;
</script>
