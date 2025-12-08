<template>
  <header class="w-28 sticky top-0 h-screen p-4">
    <div
      class="size-full bg-white border-2 border-black shadow-xl rounded-xl flex flex-col items-start justify-between gap-2 p-2"
    >
      <!-- top panel -->
      <div class="w-full flex flex-col gap-2">
        <NuxtLink to="/" class="size-12 bg-accent p-2 rounded-lg border-2 border-black shadow-xl">
          <icons-logo />
        </NuxtLink>
        <Button variant="outline" class="h-12 p-2" as-child>
          <NuxtLink to="/search">
            <Search class="size-full" />
          </NuxtLink>
        </Button>
        <Separator />
      </div>

      <!-- servers list -->
      <div class="size-full relative overflow-hidden">
        <div class="size-full flex flex-col items-center gap-2 pt-2 pb-10 overflow-y-scroll">
          <NuxtLink
            to="/"
            class="size-10 bg-accent p-2 rounded-lg border-2 border-black shadow-xl"
            v-for="n in 20"
            :key="n"
          >
            <icons-logo />
          </NuxtLink>
        </div>

        <!-- overlay -->
        <FadeOverlay />
      </div>

      <!-- Account  -->
      <div class="w-full flex flex-col gap-2">
        <Separator />
        <Button size="icon" variant="destructive">
          <LogOut />
        </Button>
        <Button size="icon">
          <Avatar>
            <AvatarImage src="/images/avatar/1.png" alt="@User" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Search, LogOut } from "lucide-vue-next";
</script>
