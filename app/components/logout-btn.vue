<script setup lang="ts">
import { LogOut } from "lucide-vue-next";

const router = useRouter();

async function handleLogout() {
  await $fetch("/api/auth/logout");
  router.push("/auth/login");
}
</script>

<template>
  <button class="w-full flex items-center gap-2" @click="handleLogout">
    <LogOut />
    Log out
  </button>
</template>
