<template>
  <main class="w-full h-screen overflow-hidden grid grid-cols-2">
    <div
      class="h-screen flex items-center justify-center py-8"
      :class="route.name === 'auth-register' ? 'order-2 pr-8' : 'pl-8'"
    >
      <figure class="size-full border-black border-4 rounded-xl">
        <img
          src="/images/auth.png"
          alt="Auth Image"
          class="size-full scale-125"
        />
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
