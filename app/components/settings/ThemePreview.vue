<template>
  <button
    class="group relative flex flex-col items-center gap-2 rounded-xl border p-2 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    :class="active ? 'border-primary ring-2 ring-primary/30' : 'hover:border-muted-foreground/30'"
    @click="$emit('select', theme.id)"
  >
    <!-- Mini preview -->
    <div
      class="h-16 w-full overflow-hidden rounded-lg border"
      :class="
        theme.dark
          ? 'bg-zinc-900'
          : theme.id === 'system'
            ? 'bg-linear-to-br from-white to-zinc-800'
            : 'bg-white'
      "
    >
      <div
        class="flex h-full flex-col gap-1 p-1.5"
        :class="theme.dark || theme.id === 'system' ? 'opacity-70' : ''"
      >
        <!-- Fake sidebar -->
        <div class="flex flex-1 gap-1">
          <div
            class="w-3 space-y-1 rounded pt-1"
            :class="theme.dark ? 'bg-zinc-700' : 'bg-zinc-200'"
          >
            <div
              v-for="i in 4"
              :key="i"
              class="mx-auto h-1 w-2 rounded-sm"
              :class="theme.dark ? 'bg-zinc-600' : 'bg-zinc-300'"
            />
          </div>
          <!-- Fake content -->
          <div class="flex-1 space-y-1 pt-1">
            <div
              class="h-1.5 w-3/4 rounded-sm"
              :class="theme.dark ? 'bg-zinc-700' : 'bg-zinc-200'"
            />
            <div
              class="h-1.5 w-1/2 rounded-sm"
              :class="theme.dark ? 'bg-zinc-600' : 'bg-zinc-300'"
            />
            <div
              class="h-1.5 w-2/3 rounded-sm"
              :class="theme.dark ? 'bg-zinc-700' : 'bg-zinc-200'"
            />
          </div>
        </div>
      </div>
    </div>

    <span class="text-xs font-medium" :class="active ? 'text-primary' : 'text-muted-foreground'">
      {{ theme.label }}
    </span>

    <!-- Checkmark -->
    <div
      v-if="active"
      class="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
    >
      <Check class="size-2.5" />
    </div>
  </button>
</template>

<script setup lang="ts">
import { Check } from "lucide-vue-next";

defineProps<{
  theme: { id: string; label: string; dark: boolean };
  active: boolean;
}>();

defineEmits<{
  select: [id: string];
}>();
</script>
