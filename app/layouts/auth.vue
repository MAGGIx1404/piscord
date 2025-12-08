<template>
  <main class="w-full h-screen overflow-hidden grid grid-cols-2">
    <div
      class="h-screen flex items-center justify-center border-black"
      :class="route.name === 'auth-register' ? 'order-2 border-l-4' : 'border-r-4'"
    >
      <figure class="size-full">
        <img src="/images/auth.png" alt="Auth Image" class="size-full" />
      </figure>
    </div>
    <div class="size-full flex items-center justify-center relative">
      <div
        class="absolute top-8 left-8 size-16 bg-accent p-2 rounded-lg border-2 border-black shadow-md"
      >
        <icons-logo />
      </div>
      <slot />
    </div>
  </main>
</template>

<script setup>
const route = useRoute();
</script>
