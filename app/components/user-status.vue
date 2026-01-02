<template>
  <div v-bind="attrs" :class="containerClass">
    <span :class="dotClass" :title="statusLabel"></span>
    <span v-if="!dotOnly && showLabel" class="ml-2 text-xs text-muted-foreground">{{
      statusLabel
    }}</span>
  </div>
</template>

<script setup>
import { computed, useAttrs } from "vue";

const props = defineProps({
  status: { type: String, default: "offline" },
  size: { type: String, default: "md" },
  dotOnly: { type: Boolean, default: false },
  showLabel: { type: Boolean, default: false }
});

const attrs = useAttrs();

const statusMap = {
  online: { color: "bg-green-500", ring: "ring-2 ring-green-200/30", label: "Online" },
  away: { color: "bg-amber-500", ring: "ring-2 ring-amber-200/30", label: "Away" },
  sleep: { color: "bg-violet-500", ring: "ring-2 ring-violet-200/30", label: "Sleeping" },
  offline: { color: "bg-gray-400", ring: "", label: "Offline" }
};

const sizeMap = { sm: "w-2 h-2", md: "w-3 h-3", lg: "w-4 h-4" };

const info = computed(() => statusMap[props.status] || statusMap.offline);

const dotClass = computed(() => {
  const sizeCls = sizeMap[props.size] || sizeMap.md;
  return `inline-block rounded-full ${sizeCls} ${info.value.color} ${info.value.ring}`.trim();
});

const containerClass = computed(() => `inline-flex items-center ${attrs.class || ""}`.trim());

const statusLabel = computed(() => info.value.label);
</script>
<template></template>

<script setup></script>
