<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <h1 class="text-3xl font-medium">{{ title }}</h1>

      <!-- Search and Sort -->
      <div class="flex items-center gap-2 w-full md:w-auto">
        <!-- Search Input -->
        <div class="relative flex-1 md:w-80">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            :model-value="searchQuery"
            @update:model-value="$emit('update:searchQuery', String($event))"
            placeholder="Search communities..."
            class="pl-10 pr-4"
          />
          <button
            v-if="searchQuery"
            @click="$emit('update:searchQuery', '')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X class="size-4" />
          </button>
        </div>

        <!-- Sort Dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger asChild class="h-auto">
            <Button variant="outline" size="default" class="shrink-0">
              <ArrowUpDown class="size-4" />
              <span class="hidden sm:inline">{{ currentSortLabel }}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              v-for="option in sortOptions"
              :key="option.value"
              @click="$emit('update:sortBy', option.value)"
              :class="{ 'bg-accent': sortBy === option.value }"
            >
              <component :is="option.icon" class="size-4" />
              {{ option.label }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex items-center gap-2 flex-wrap">
      <Button
        v-for="filter in filters"
        :key="filter.value"
        :variant="activeFilter === filter.value ? 'default' : 'outline'"
        size="sm"
        @click="$emit('update:activeFilter', filter.value)"
        class="gap-1.5"
      >
        <component :is="filter.icon" class="size-4" />
        {{ filter.label }}
        <Badge v-if="filter.count" variant="secondary" class="ml-1 text-xs px-1.5">
          {{ filter.count }}
        </Badge>
      </Button>
    </div>

    <!-- Active Filters & Results Count -->
    <div class="flex items-center">
      <p class="text-sm text-muted-foreground">
        Showing <span class="font-medium text-foreground">{{ resultsCount }}</span>
        {{ resultsCount === 1 ? "community" : "communities" }}
        <template v-if="activeFilter !== 'all' || searchQuery">
          <span class="mx-1">•</span>
          <button @click="$emit('clearFilters')" class="text-primary hover:underline">
            Clear filters
          </button>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, X, ArrowUpDown } from "lucide-vue-next";
import { computed, type Component } from "vue";

interface FilterOption {
  value: string;
  label: string;
  icon: Component;
  count?: number | null;
}

interface SortOption {
  value: string;
  label: string;
  icon: Component;
}

interface Props {
  title?: string;
  searchQuery: string;
  activeFilter: string;
  sortBy: string;
  filters: FilterOption[];
  sortOptions: SortOption[];
  resultsCount: number;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Featured Communities"
});

defineEmits<{
  "update:searchQuery": [value: string];
  "update:activeFilter": [value: string];
  "update:sortBy": [value: string];
  clearFilters: [];
}>();

const currentSortLabel = computed(() => {
  return props.sortOptions.find((s) => s.value === props.sortBy)?.label || "Sort";
});
</script>
