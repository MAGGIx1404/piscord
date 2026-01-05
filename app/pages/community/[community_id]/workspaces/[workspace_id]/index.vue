<template>
  <main class="w-full">
    <ClientOnly>
      <CommunityWorkspaceEditor v-model="content" />
    </ClientOnly>
  </main>
</template>

<script setup lang="ts">
import Intro from "@/assets/intro/workspace.txt?raw";

const content = ref<string>(Intro);
</script>
