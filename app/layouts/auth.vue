<template>
  <main class="w-full h-screen overflow-hidden grid grid-cols-2">
    <div class="h-screen flex items-center justify-center p-4">
      <figure class="size-full rounded-lg">
        <img src="/images/auth.png" alt="Auth Image" class="size-full" />
      </figure>
    </div>
    <div class="size-full flex items-center justify-center relative">
      <slot />
    </div>
  </main>
</template>
