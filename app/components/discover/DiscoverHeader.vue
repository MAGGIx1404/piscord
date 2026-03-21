<template>
  <div class="sticky top-0 z-30 border-b border-border bg-background">
    <div class="px-6 py-5">
      <!-- Title Row -->
      <div class="mb-5 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Compass class="size-6" />
          </div>
          <div>
            <h1 class="text-2xl font-bold">Discover</h1>
            <p class="text-sm text-muted-foreground">Find communities to join</p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="hidden items-center gap-6 md:flex">
          <div class="text-right">
            <div class="text-lg font-semibold">{{ totalCommunities }}</div>
            <div class="text-xs text-muted-foreground">Communities</div>
          </div>
          <div class="h-8 w-px bg-border" />
          <div class="text-right">
            <div class="text-lg font-semibold">{{ formatNumber(totalMembers) }}</div>
            <div class="text-xs text-muted-foreground">Members</div>
          </div>
          <div class="h-8 w-px bg-border" />
          <div class="text-right">
            <div class="flex items-center justify-end gap-1.5">
              <span class="relative flex h-2 w-2">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
                ></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span class="text-lg font-semibold">{{ formatNumber(onlineNow) }}</span>
            </div>
            <div class="text-xs text-muted-foreground">Online</div>
          </div>
        </div>
      </div>

      <!-- Search and Filters Row -->
      <div class="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
        <!-- Search Input -->
        <div class="relative w-full flex-1 lg:max-w-md">
          <Search class="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Search communities..."
            class="h-11 w-full rounded-xl border border-border/50 bg-card/50 pr-10 pl-11 text-sm transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
          <button
            v-if="searchQuery"
            @click="$emit('update:searchQuery', '')"
            class="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-muted"
          >
            <X class="size-4 text-muted-foreground" />
          </button>
        </div>

        <!-- Category Pills -->
        <div class="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="$emit('update:activeFilter', filter.value)"
            :class="[
              'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
              activeFilter === filter.value
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'border border-border/50 bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
            ]"
          >
            <component :is="filter.icon" class="-mt-0.5 mr-1.5 inline-block size-4" />
            {{ filter.label }}
          </button>
        </div>

        <Button size="lg" class="ml-auto shrink-0 gap-2" as-child>
          <NuxtLink to="/community/create">
            <Plus class="size-5" />
            Create Community
          </NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Compass, Search, X, Plus } from "lucide-vue-next";
import type { Component } from "vue";

interface FilterOption {
  value: string;
  label: string;
  icon: Component;
}

interface Props {
  searchQuery: string;
  activeFilter: string;
  filters: FilterOption[];
  totalCommunities: number;
  totalMembers: number;
  onlineNow: number;
}

defineProps<Props>();

defineEmits<{
  "update:searchQuery": [value: string];
  "update:activeFilter": [value: string];
}>();

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};
</script>
