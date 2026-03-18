<template>
  <div class="flex min-h-screen w-full flex-col p-4 pb-20">
    <slot />
    <AppDock />
  </div>

  <Enable2FAModal />
</template>

<script setup></script>
