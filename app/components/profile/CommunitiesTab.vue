<template>
  <div>
    <div v-if="pending" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 6" :key="n" class="h-20 animate-pulse rounded-xl bg-muted/40" />
    </div>
    <div v-else-if="!communities.length" class="flex flex-col items-center gap-3 py-16 text-center">
      <div class="flex size-16 items-center justify-center rounded-2xl bg-muted/40">
        <Users class="size-7 text-muted-foreground" />
      </div>
      <p class="font-medium">No communities yet</p>
      <p class="text-sm text-muted-foreground">Discover and join communities to see them here.</p>
      <Button size="sm" class="mt-1" as-child>
        <NuxtLink to="/discover">Browse Communities</NuxtLink>
      </Button>
    </div>
    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="c in communities"
        :key="c.id"
        :to="`/community/${c.id}`"
        class="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 transition-all hover:border-border hover:bg-accent/30 hover:shadow-sm"
      >
        <Avatar class="size-11 shrink-0 rounded-xl">
          <AvatarImage :src="c.icon_url ?? ''" />
          <AvatarFallback class="rounded-xl font-semibold">{{ c.name.charAt(0) }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <p class="truncate text-sm font-semibold">{{ c.name }}</p>
            <Crown v-if="c.is_owner" class="size-3 shrink-0 text-yellow-500" />
          </div>
          <p class="text-xs text-muted-foreground">{{ formatNumber(c.member_count) }} members</p>
        </div>
        <ArrowUpRight
          class="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users, Crown, ArrowUpRight } from "lucide-vue-next";

defineProps<{
  communities: {
    id: string;
    name: string;
    slug: string;
    icon_url: string | null;
    member_count: number;
    is_public: boolean;
    is_owner: boolean;
    joined_at: string;
  }[];
  pending: boolean;
}>();
</script>
