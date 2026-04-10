<template>
  <main class="w-full px-6 py-8">
    <div class="relative z-3 w-full">
      <div class="mb-8 flex w-full items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button
            class="grid size-9 place-items-center rounded-xl border border-border/60 bg-card transition-colors hover:bg-accent"
            @click="router.push(`/community/${communityId}`)"
          >
            <ArrowLeft class="size-4 text-muted-foreground" />
          </button>
          <div>
            <h1 class="text-xl font-bold">Channels</h1>
            <p class="text-sm text-muted-foreground">
              <template v-if="!pending">
                {{ filteredChannels.length }} channel{{ filteredChannels.length !== 1 ? "s" : "" }}
              </template>
              <template v-else>&nbsp;</template>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative">
            <Search
              class="pointer-events-none absolute top-1/2 left-3 z-3 size-4 -translate-y-1/2 text-primary"
            />
            <Input
              v-model="searchQuery"
              placeholder="Search channels..."
              class="h-9 w-56 border-border/50 bg-card/50 pl-9 text-sm backdrop-blur-sm"
            />
          </div>

          <Button v-if="canManage" size="sm" class="gap-1.5" @click="openCreateDialog()">
            <Plus class="size-4" />
            Create Channel
          </Button>
        </div>
      </div>

      <div class="grid w-full grid-cols-1 gap-6 xl:grid-cols-12">
        <div class="xl:col-span-9">
          <div v-if="pending" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div v-for="col in 4" :key="col" class="space-y-3">
              <div class="h-5 w-20 animate-pulse rounded-md bg-muted/60" />
              <div
                v-for="n in 3"
                :key="n"
                class="overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-2"
              >
                <div class="h-44 w-full animate-pulse rounded-xl bg-muted/40" />
                <div class="space-y-2 px-3 pt-3 pb-3">
                  <div class="h-4 w-3/4 animate-pulse rounded bg-muted/50" />
                  <div class="h-3 w-full animate-pulse rounded bg-muted/30" />
                  <div class="mt-3 flex items-center justify-between">
                    <div class="flex -space-x-1.5">
                      <div
                        v-for="i in 3"
                        :key="i"
                        class="size-6 animate-pulse rounded-full bg-muted/40"
                      />
                    </div>
                    <div class="h-3 w-8 animate-pulse rounded bg-muted/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <template v-else>
            <div v-if="filteredChannels.length">
              <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <ChannelColumn
                  v-for="col in typeColumns"
                  :key="col.type"
                  :type="col.type"
                  :label="col.label"
                  :column-style="col.style"
                  :channels="col.channels"
                  :can-manage="canManage"
                  @create="openCreateDialog"
                  @select="handleSelect"
                />
              </div>

              <div
                v-if="searchQuery && !filteredChannels.length"
                class="flex flex-col items-center justify-center py-16"
              >
                <Search class="mb-3 size-8 text-muted-foreground/30" />
                <p class="text-sm text-muted-foreground">
                  No channels matching "{{ searchQuery }}"
                </p>
              </div>
            </div>

            <LazyChannelEmptyState
              v-else-if="!searchQuery"
              :can-manage="canManage"
              @create="openCreateDialog()"
            />
          </template>
        </div>

        <div class="xl:col-span-3">
          <div class="sticky top-8">
            <template v-if="pending">
              <div class="space-y-3 rounded-2xl border border-border/50 bg-card/50 p-4">
                <div class="h-5 w-28 animate-pulse rounded bg-muted/50" />
                <div v-for="n in 5" :key="n" class="flex items-center gap-3">
                  <div class="size-8 animate-pulse rounded-full bg-muted/40" />
                  <div class="flex-1 space-y-1.5">
                    <div class="h-3.5 w-24 animate-pulse rounded bg-muted/40" />
                    <div class="h-2.5 w-16 animate-pulse rounded bg-muted/30" />
                  </div>
                </div>
              </div>
            </template>
            <ChannelLeaderboard v-else :members="leaderboardMembers" />
          </div>
        </div>
      </div>

      <ChannelCreateDialog
        v-model="showCreateDialog"
        :community-id="communityId"
        :default-type="createDefaultType"
        @created="refresh"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import { Hash, Mic, Megaphone, FolderOpen, Plus, ArrowLeft, Search } from "lucide-vue-next";
import type { ChannelCardItem } from "~/components/channel/ChannelCard.vue";
import type { LeaderboardMember } from "~/components/channel/ChannelLeaderboard.vue";

const route = useRoute();
const router = useRouter();
const api = useApi();
const communityId = route.params.community_id as string;

interface ChannelsResponse {
  channels: ChannelCardItem[];
  can_manage: boolean;
}

const { data, pending, refresh } = await useAsyncData<ChannelsResponse>(
  `community-channels-${communityId}`,
  () => api<ChannelsResponse>(`/api/communities/${communityId}/channels`)
);

const channels = computed(() => data.value?.channels ?? []);
const canManage = computed(() => data.value?.can_manage ?? false);

const searchQuery = ref("");

const filteredChannels = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return channels.value;
  return channels.value.filter(
    (ch) => ch.name.toLowerCase().includes(q) || ch.topic?.toLowerCase().includes(q)
  );
});

interface LeaderboardResponse {
  leaderboard: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
    score: number;
  }>;
}

const { data: leaderboardData } = await useAsyncData(`community-leaderboard-${communityId}`, () =>
  api<LeaderboardResponse>(`/api/communities/${communityId}/leaderboard`)
);

const leaderboardMembers = computed<LeaderboardMember[]>(() => {
  const items = leaderboardData.value?.leaderboard ?? [];
  return items.map((m) => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar,
    role: m.role,
    score: m.score > 0 ? String(m.score) : "0"
  }));
});

const columnConfig = [
  {
    type: "text",
    label: "Text",
    style: {
      icon: Hash,
      bg: "bg-blue-500/15",
      color: "text-blue-500",
      posterBg: "bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-blue-500/10"
    }
  },
  {
    type: "voice",
    label: "Voice",
    style: {
      icon: Mic,
      bg: "bg-green-500/15",
      color: "text-green-500",
      posterBg: "bg-gradient-to-br from-green-500/10 via-green-400/5 to-green-500/10"
    }
  },
  {
    type: "announcement",
    label: "Announcement",
    style: {
      icon: Megaphone,
      bg: "bg-amber-500/15",
      color: "text-amber-500",
      posterBg: "bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-amber-500/10"
    }
  },
  {
    type: "category",
    label: "Category",
    style: {
      icon: FolderOpen,
      bg: "bg-purple-500/15",
      color: "text-purple-500",
      posterBg: "bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-purple-500/10"
    }
  }
];

const typeColumns = computed(() =>
  columnConfig.map((col) => ({
    ...col,
    channels: filteredChannels.value.filter((c) => c.type === col.type)
  }))
);

const showCreateDialog = ref(false);
const createDefaultType = ref("text");

function openCreateDialog(type?: string) {
  createDefaultType.value = type ?? "text";
  showCreateDialog.value = true;
}

function handleSelect(channel: ChannelCardItem) {
  if (channel.type === "voice") {
    router.push(`/community/${communityId}/channels/${channel.id}/voice`);
  } else {
    router.push(`/community/${communityId}/channels/${channel.id}`);
  }
}

const communityStore = useCommunityStore();
communityStore.setCurrentCommunity(communityId);
</script>
