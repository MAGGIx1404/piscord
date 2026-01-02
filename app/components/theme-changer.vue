<template>
  <Button
    variant="outline"
    class="rounded-full size-9 fixed top-4 right-4 z-10"
    @click="toggleTheme"
  >
    <Moon v-if="enabled" />
    <Sun v-else />
  </Button>
</template>

<script setup>
import { Sun, Moon } from "lucide-vue-next";

const { enabled, toggleTheme } = useTheme();
</script>
