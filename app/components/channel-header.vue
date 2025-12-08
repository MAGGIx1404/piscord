<template>
  <Card
    class="max-w-[calc(100%-32px)] w-full flex-row justify-between absolute top-4 left-1/2 -translate-x-1/2 z-2"
  >
    <h1 class="text-xl font-semibold flex items-center gap-2"><Antenna /> Default Channel</h1>

    <div class="flex items-center gap-2">
      <Button size="icon" variant="outline"><Bell /></Button>
      <Button size="icon" variant="outline"><Settings /></Button>
      <Button size="icon" variant="outline"><Users /></Button>
      <Button size="icon" variant="outline"><PanelRight /></Button>
    </div>
  </Card>
</template>

<script setup>
import { Antenna, Bell, Users, PanelRight, Settings } from "lucide-vue-next";
</script>
