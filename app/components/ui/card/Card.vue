<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-white border-2 border-black flex flex-col gap-6 rounded-xl p-4 shadow-xl overflow-hidden',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
