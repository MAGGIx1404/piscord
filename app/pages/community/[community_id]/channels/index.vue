<template>
  <main class="w-full px-6 py-8">
    <div class="relative z-3 w-full">
      <!-- Loading -->
      <div v-if="pending" class="flex h-96 items-center justify-center">
        <div
          class="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
        />
      </div>

      <template v-else>
        <!-- Header -->
        <div class="mx-auto mb-8 flex max-w-7xl items-center justify-between">
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
                {{ channels.length }} channel{{ channels.length !== 1 ? "s" : "" }}
              </p>
            </div>
          </div>

          <Button v-if="canManage" size="sm" class="gap-1.5" @click="openCreateDialog()">
            <Plus class="size-4" />
            Create Channel
          </Button>
        </div>

        <!-- 4-column type-based layout -->
        <div
          v-if="channels.length"
          class="mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
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

        <!-- Global empty state -->
        <ChannelEmptyState v-else :can-manage="canManage" @create="openCreateDialog()" />
      </template>

      <!-- Create Channel Dialog -->
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
import { Hash, Mic, Megaphone, FolderOpen, Plus, ArrowLeft } from "lucide-vue-next";
import type { ChannelCardItem } from "~/components/channel/ChannelCard.vue";

const route = useRoute();
const router = useRouter();
const api = useApi();
const communityId = route.params.community_id as string;

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChannelsResponse {
  channels: ChannelCardItem[];
  can_manage: boolean;
}

// ─── Fetch channels ──────────────────────────────────────────────────────────

const { data, pending, refresh } = await useAsyncData<ChannelsResponse>(
  `community-channels-${communityId}`,
  () => api<ChannelsResponse>(`/api/communities/${communityId}/channels`)
);

const channels = computed(() => data.value?.channels ?? []);
const canManage = computed(() => data.value?.can_manage ?? false);

// ─── Column definitions ─────────────────────────────────────────────────────

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
    channels: channels.value.filter((c) => c.type === col.type)
  }))
);

// ─── Create dialog ──────────────────────────────────────────────────────────

const showCreateDialog = ref(false);
const createDefaultType = ref("text");

function openCreateDialog(type?: string) {
  createDefaultType.value = type ?? "text";
  showCreateDialog.value = true;
}

// ─── Navigation ─────────────────────────────────────────────────────────────

function handleSelect(channel: ChannelCardItem) {
  router.push(`/community/${communityId}/channels/${channel.id}`);
}

// ─── Sync community store ───────────────────────────────────────────────────

const communityStore = useCommunityStore();
communityStore.setCurrentCommunity(communityId);
</script>
