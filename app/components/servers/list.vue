<template>
  <div class="w-full grid grid-cols-3 gap-6">
    <Card v-for="server in servers" :key="server.id" class="p-0 gap-0">
      <!-- server poster -->
      <figure class="w-full h-64 border-b-2 border-black">
        <img :src="server.poster" :alt="server.name + ' Image'" class="size-full" />
      </figure>
      <!-- content -->
      <div class="w-full p-4 relative z-2 flex flex-col gap-2.5">
        <!-- server icon -->
        <div class="size-14 bg-accent p-2 rounded-lg border-2 border-black shadow-xl -mt-12">
          <IconsLogo />
        </div>

        <!-- server name -->
        <h1 class="text-xl font-semibold">{{ server.name }}</h1>

        <!-- server stats -->
        <div class="w-full flex items-center gap-4">
          <p class="text-base flex items-center gap-1"><Status /> <strong>32.2k</strong> Online</p>
          <p class="text-base flex items-center gap-1">
            <Status type="offline" /> <strong>312.2k</strong> Members
          </p>
        </div>

        <Separator />

        <!-- server actions -->
        <div class="w-full grid grid-cols-2 gap-4">
          <Button variant="secondary"> Connect </Button>
          <Button variant="destructive">
            <LogOut />
            Leave Server
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { LogOut } from "lucide-vue-next";

const servers = ref([
  {
    id: 1,
    name: "Freedom hosters 💥",
    poster: "/images/servers/5.png"
  },
  {
    id: 2,
    name: "Liberty servers ⛅️",
    poster: "/images/servers/2.png"
  },
  {
    id: 3,
    name: "OpenNet 🌟",
    poster: "/images/servers/3.png"
  },
  {
    id: 4,
    name: "SecureHost ⚔️",
    poster: "/images/servers/4.png"
  },
  {
    id: 5,
    name: "FastConnect 🔗",
    poster: "/images/servers/1.png"
  }
]);
</script>
