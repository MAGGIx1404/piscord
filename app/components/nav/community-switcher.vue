<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        class="group relative grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-border/60 bg-card shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:scale-[1.08] hover:border-border hover:bg-accent sm:h-11 sm:w-11"
        :class="currentCommunity ? 'border-primary/40 bg-primary/10' : ''"
        aria-label="Switch community"
      >
        <Avatar v-if="currentCommunity" class="size-6 rounded-lg">
          <AvatarImage :src="currentCommunity.icon_url ?? ''" />
          <AvatarFallback class="rounded-lg text-[10px] font-semibold">
            {{ currentCommunity.name.charAt(0).toUpperCase() }}
          </AvatarFallback>
        </Avatar>
        <Building2
          v-else
          class="h-[18px] w-[18px] text-muted-foreground transition-colors duration-200 group-hover:text-accent-foreground"
          :stroke-width="1.8"
        />
        <span
          class="tooltip pointer-events-none absolute -bottom-6 text-[9px] tracking-wide whitespace-nowrap text-muted-foreground sm:text-[10px]"
        >
          Communities
        </span>
      </button>
    </PopoverTrigger>

    <PopoverContent side="top" :side-offset="12" align="center" class="w-64 p-0">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <p class="text-sm font-semibold">My Communities</p>
        <span class="text-xs text-muted-foreground">
          {{ communities.length }}
        </span>
      </div>

      <!-- Community list -->
      <ScrollArea class="max-h-56">
        <div class="py-1">
          <button
            v-for="community in communities"
            :key="community.id"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/50"
            :class="
              community.id === currentCommunityId ? 'border-l-2 border-primary bg-primary/5' : ''
            "
            @click="switchCommunity(community.id)"
          >
            <Avatar class="size-8 shrink-0 rounded-lg">
              <AvatarImage :src="community.icon_url ?? ''" />
              <AvatarFallback class="rounded-lg text-xs">
                {{ community.name.charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ community.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ formatMemberCount(community.member_count) }} members
              </p>
            </div>
            <Check
              v-if="community.id === currentCommunityId"
              class="size-4 shrink-0 text-primary"
            />
          </button>

          <div
            v-if="communities.length === 0"
            class="px-4 py-6 text-center text-sm text-muted-foreground"
          >
            No communities yet
          </div>
        </div>
      </ScrollArea>

      <!-- Footer actions -->
      <div class="border-t border-border/50 p-2">
        <NuxtLink
          to="/discover"
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          @click="open = false"
        >
          <Compass class="size-4" />
          Discover Communities
        </NuxtLink>
        <NuxtLink
          to="/community/create"
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          @click="open = false"
        >
          <Plus class="size-4" />
          Create Community
        </NuxtLink>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { Building2, Check, Compass, Plus } from "lucide-vue-next";

const router = useRouter();
const communityStore = useCommunityStore();
const open = ref(false);

const communities = computed(() => communityStore.communities);
const currentCommunityId = computed(() => communityStore.currentCommunityId);
const currentCommunity = computed(() => communityStore.currentCommunity);

function switchCommunity(id: string) {
  communityStore.setCurrentCommunity(id);
  open.value = false;
  router.push(`/community/${id}`);
}

function formatMemberCount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
</script>

<style scoped>
.tooltip {
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.15s,
    transform 0.15s;
}
.group:hover .tooltip {
  opacity: 1;
  transform: translateY(0);
}
</style>
