<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    class="group relative grid h-10 w-10 place-items-center rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:scale-[1.08] sm:h-11 sm:w-11"
    :class="[
      isActive
        ? 'border-primary/40 bg-primary/10 text-primary shadow-sm'
        : 'border-border/60 bg-card text-muted-foreground shadow-sm hover:border-border hover:bg-accent hover:text-accent-foreground'
    ]"
    :aria-label="label"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    <component
      :is="icon"
      class="h-[18px] w-[18px] transition-colors duration-200"
      :class="
        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
      "
      :stroke-width="isActive ? 2.2 : 1.8"
    />
    <span
      v-if="badge"
      class="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground ring-2 ring-background"
    >
      {{ badge }}
    </span>
    <span
      class="tooltip pointer-events-none absolute -bottom-6 text-[9px] tracking-wide whitespace-nowrap text-muted-foreground sm:text-[10px]"
    >
      {{ label }}
    </span>
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";
import type { Component } from "vue";

const props = defineProps<{
  icon: Component;
  label: string;
  badge?: string;
  to?: string;
}>();

defineEmits<{ click: [] }>();

const route = useRoute();
const isActive = computed(() => !!props.to && route.path === props.to);
</script>

<style scoped>
.tooltip {
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.group:hover .tooltip {
  opacity: 1;
  transform: translateY(0);
}
</style>
