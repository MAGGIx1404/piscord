<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { AvatarRoot } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <AvatarRoot
    data-slot="avatar"
    :class="cn('relative flex size-12 shrink-0 overflow-hidden transition-shadow', props.class)"
  >
    <slot />
  </AvatarRoot>
</template>
