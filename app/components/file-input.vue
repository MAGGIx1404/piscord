<template>
  <div class="size-full relative p-5">
    <!-- Visible -->
    <div class="size-full border-2 border-black border-dotted rounded-lg grid place-items-center">
      <slot name="trigger"></slot>
    </div>

    <!-- Hidden -->
    <input type="file" class="absolute top-0 left-0 size-full opacity-0 cursor-pointer z-10" />
  </div>
  <h1>custom file input</h1>
</template>

<script setup></script>
