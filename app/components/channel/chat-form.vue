<template>
  <form
    class="w-full flex items-center justify-between gap-2 absolute bottom-0 left-0 z-2 bg-white"
  >
    <Input placeholder="Type your message here..." class="w-full" />
    <Button type="submit">
      <Send />
      Send
    </Button>
  </form>
</template>

<script setup>
import { Send } from "lucide-vue-next";
</script>
