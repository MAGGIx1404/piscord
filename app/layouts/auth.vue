<template>
  <main class="w-full h-screen grid grid-cols-2">
    <figure
      class="size-full"
      :class="route.name === 'auth-register' ? 'order-2' : ''"
    >
      <img
        src="/images/auth.png"
        alt="Auth Image"
        class="size-full scale-125"
      />
    </figure>
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
