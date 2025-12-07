<template>
  <header class="w-28 sticky top-0 h-screen p-4">
    <div
      class="size-full bg-white border-2 border-black shadow-lg rounded-lg flex flex-col items-start justify-between gap-2 p-2"
    >
      <!-- top panel -->
      <div class="w-full flex flex-col gap-2">
        <NuxtLink
          to="/"
          class="size-12 bg-accent p-2 rounded-lg border-2 border-black"
        >
          <icons-logo />
        </NuxtLink>
        <Button variant="outline" class="h-12 p-2" as-child>
          <NuxtLink to="/">
            <Search class="size-full" />
          </NuxtLink>
        </Button>
        <Separator />
      </div>

      <!-- Account  -->
    </div>
  </header>
</template>

<script setup>
import { Search } from "lucide-vue-next";
</script>
