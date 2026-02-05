<template>
  <div class="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
    <div class="px-6 py-5">
      <!-- Title Row -->
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-4">
          <div class="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Compass class="size-6" />
          </div>
          <div>
            <h1 class="text-2xl font-bold">Discover</h1>
            <p class="text-sm text-muted-foreground">Find communities to join</p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="hidden md:flex items-center gap-6">
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
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                ></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="text-lg font-semibold">{{ formatNumber(onlineNow) }}</span>
            </div>
            <div class="text-xs text-muted-foreground">Online</div>
          </div>
        </div>
      </div>

      <!-- Search and Filters Row -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        <!-- Search Input -->
        <div class="relative flex-1 w-full lg:max-w-md">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Search communities..."
            class="w-full h-11 pl-11 pr-10 rounded-xl bg-card/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
          <button
            v-if="searchQuery"
            @click="$emit('update:searchQuery', '')"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X class="size-4 text-muted-foreground" />
          </button>
        </div>

        <!-- Category Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="$emit('update:activeFilter', filter.value)"
            :class="[
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              activeFilter === filter.value
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card border border-border/50'
            ]"
          >
            <component :is="filter.icon" class="size-4 inline-block mr-1.5 -mt-0.5" />
            {{ filter.label }}
          </button>
        </div>

        <!-- Sort Dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="shrink-0 gap-2 rounded-xl">
              <ArrowUpDown class="size-4" />
              <span class="hidden sm:inline">{{ currentSortLabel }}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuItem
              v-for="option in sortOptions"
              :key="option.value"
              @click="$emit('update:sortBy', option.value)"
              :class="{ 'bg-primary/10 text-primary': sortBy === option.value }"
            >
              <component :is="option.icon" class="size-4 mr-2" />
              {{ option.label }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Compass, Search, X, ArrowUpDown } from "lucide-vue-next";
import type { Component } from "vue";

interface FilterOption {
  value: string;
  label: string;
  icon: Component;
}

interface SortOption {
  value: string;
  label: string;
  icon: Component;
}

interface Props {
  searchQuery: string;
  activeFilter: string;
  sortBy: string;
  filters: FilterOption[];
  sortOptions: SortOption[];
  totalCommunities: number;
  totalMembers: number;
  onlineNow: number;
}

const props = defineProps<Props>();

defineEmits<{
  "update:searchQuery": [value: string];
  "update:activeFilter": [value: string];
  "update:sortBy": [value: string];
}>();

const currentSortLabel = computed(() => {
  return props.sortOptions.find((opt) => opt.value === props.sortBy)?.label || "Sort";
});

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};
</script>
