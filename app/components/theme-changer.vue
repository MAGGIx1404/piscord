<template>
  <Button variant="ghost" class="rounded-md size-8" @click="toggleTheme">
    <Moon v-if="enabled" />
    <Sun v-else />
  </Button>
</template>

<script setup>
import { Sun, Moon } from "lucide-vue-next";

const { enabled, toggleTheme } = useTheme();
</script>
