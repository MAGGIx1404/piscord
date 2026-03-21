<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import type { ButtonVariants } from ".";
import { Primitive } from "reka-ui";
import { cn } from "@/lib/utils";
import { buttonVariants } from ".";

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  class?: HTMLAttributes["class"];
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  as: "button"
});
</script>

<template>
  <Primitive
    v-bind="props"
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <div
      v-if="props.isLoading"
      class="absolute inset-0 flex items-center justify-center bg-inherit"
    >
      <Loader2 class="size-4 animate-spin" />
    </div>
    <slot />
  </Primitive>
</template>
