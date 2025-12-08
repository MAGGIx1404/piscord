<template>
  <header class="w-30 sticky top-0 h-screen p-4">
    <div
      class="size-full bg-white border-2 border-black shadow-xl rounded-xl flex flex-col items-start justify-between gap-2 p-4"
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
      <div class="size-full flex flex-col items-center gap-2">
        <Button size="icon" v-for="n in 5" :key="n" as-child>
          <NuxtLink :to="`/servers/${n}`">
            <Avatar>
              <AvatarImage :src="`/images/servers/${n}.png`" alt="@Server" />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
          </NuxtLink>
        </Button>
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
