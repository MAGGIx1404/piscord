<script setup lang="ts">
import { LogOut } from "lucide-vue-next";

const { logout } = useAuth();
</script>

<template>
  <Button variant="destructive" @click="logout">
    <LogOut />
    Log out
  </Button>
</template>
