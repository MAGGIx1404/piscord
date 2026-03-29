<template>
  <main class="flex h-[calc(100vh-6rem)] w-full overflow-hidden rounded-xl border border-border/50">
    <div class="flex w-100 shrink-0 flex-col border-r border-border/50">
      <div class="border-b border-border/50 px-4 py-4">
        <h1 class="text-lg font-bold">Friends</h1>
      </div>

      <div class="flex border-b border-border/50">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="relative flex-1 px-3 py-2.5 text-center text-xs font-medium transition-colors"
          :class="
            activeTab === tab.id
              ? 'text-foreground after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:bg-primary'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span
            v-if="tab.count > 0"
            class="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground"
          >
            {{ tab.count > 9 ? "9+" : tab.count }}
          </span>
        </button>
      </div>

      <div v-if="activeTab === 'search'" class="border-b border-border/50 px-4 py-3">
        <div class="relative">
          <SearchIcon
            class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Search by username..."
            class="h-9 w-full rounded-lg border border-border/50 bg-card/50 pr-4 pl-9 text-sm transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <template v-if="activeTab === 'all'">
          <div v-if="loadingFriends" class="space-y-2 p-3">
            <div v-for="n in 5" :key="n" class="flex items-center gap-3 rounded-xl p-2.5">
              <div class="size-10 animate-pulse rounded-full bg-muted/50" />
              <div class="flex-1 space-y-1.5">
                <div class="h-3.5 w-24 animate-pulse rounded bg-muted/50" />
                <div class="h-2.5 w-16 animate-pulse rounded bg-muted/40" />
              </div>
            </div>
          </div>
          <div v-else-if="friends.length === 0" class="flex flex-col items-center gap-2 px-4 py-12">
            <UsersIcon class="size-8 text-muted-foreground/40" />
            <p class="text-sm font-medium text-muted-foreground">No friends yet</p>
            <p class="text-xs text-muted-foreground/70">Search for users to add friends</p>
            <Button size="sm" class="mt-2 text-xs" @click="activeTab = 'search'">
              Find Friends
            </Button>
          </div>
          <div v-else class="space-y-0.5 p-2">
            <template v-if="onlineFriends.length">
              <p
                class="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Online — {{ onlineFriends.length }}
              </p>
              <FriendsListItem
                v-for="f in onlineFriends"
                :key="f.id"
                :friend="f"
                :active="selectedFriend?.id === f.id"
                @select="selectFriend"
                @remove="removeFriend"
              />
            </template>
            <template v-if="offlineFriends.length">
              <p
                class="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Offline — {{ offlineFriends.length }}
              </p>
              <FriendsListItem
                v-for="f in offlineFriends"
                :key="f.id"
                :friend="f"
                :active="selectedFriend?.id === f.id"
                @select="selectFriend"
                @remove="removeFriend"
              />
            </template>
          </div>
        </template>

        <template v-else-if="activeTab === 'pending'">
          <div v-if="loadingRequests" class="space-y-2 p-3">
            <div v-for="n in 3" :key="n" class="h-16 animate-pulse rounded-xl bg-muted/40" />
          </div>
          <div
            v-else-if="incomingRequests.length === 0 && outgoingRequests.length === 0"
            class="flex flex-col items-center gap-2 px-4 py-12"
          >
            <Inbox class="size-8 text-muted-foreground/40" />
            <p class="text-sm font-medium text-muted-foreground">No pending requests</p>
          </div>
          <div v-else class="space-y-4 p-3">
            <div v-if="incomingRequests.length">
              <p
                class="px-1 pb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Incoming — {{ incomingRequests.length }}
              </p>
              <div class="space-y-2">
                <FriendsRequestItem
                  v-for="req in incomingRequests"
                  :key="req.id"
                  :request="req"
                  type="incoming"
                  @accept="acceptRequest"
                  @decline="declineRequest"
                />
              </div>
            </div>
            <div v-if="outgoingRequests.length">
              <p
                class="px-1 pb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Outgoing — {{ outgoingRequests.length }}
              </p>
              <div class="space-y-2">
                <FriendsRequestItem
                  v-for="req in outgoingRequests"
                  :key="req.id"
                  :request="req"
                  type="outgoing"
                  @cancel="cancelRequest"
                />
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'search'">
          <div v-if="searchQuery.length < 2" class="flex flex-col items-center gap-2 px-4 py-12">
            <SearchIcon class="size-8 text-muted-foreground/40" />
            <p class="text-sm font-medium text-muted-foreground">Search for users</p>
            <p class="text-xs text-muted-foreground/70">Type at least 2 characters</p>
          </div>
          <div v-else-if="searchLoading" class="space-y-2 p-3">
            <div v-for="n in 4" :key="n" class="flex items-center gap-3 rounded-xl p-2.5">
              <div class="size-10 animate-pulse rounded-full bg-muted/50" />
              <div class="flex-1 space-y-1.5">
                <div class="h-3.5 w-28 animate-pulse rounded bg-muted/50" />
                <div class="h-2.5 w-16 animate-pulse rounded bg-muted/40" />
              </div>
            </div>
          </div>
          <div
            v-else-if="searchResults.length === 0"
            class="flex flex-col items-center gap-2 px-4 py-12"
          >
            <SearchIcon class="size-8 text-muted-foreground/40" />
            <p class="text-sm font-medium text-muted-foreground">No users found</p>
          </div>
          <div v-else class="space-y-0.5 p-2">
            <FriendsSearchResult
              v-for="u in searchResults"
              :key="u.id"
              :user="u"
              @add-friend="sendRequest"
            />
          </div>
        </template>
      </div>
    </div>

    <div class="flex flex-1 flex-col">
      <template v-if="selectedFriend && conversationId">
        <FriendsDmChatPanel
          :friend="selectedFriend"
          :messages="dmMessages"
          :loading="dmLoading"
          :has-more="dmHasMore"
          :connected="dmConnected"
          :friend-typing="friendTyping"
          @send="handleSendDm"
          @typing="startTyping"
          @load-more="loadMoreDm"
        />
      </template>
      <template v-else>
        <div class="flex flex-1 flex-col items-center justify-center gap-3">
          <div class="flex size-20 items-center justify-center rounded-2xl bg-muted/30">
            <MessageSquare class="size-10 text-muted-foreground/30" />
          </div>
          <h3 class="text-lg font-semibold text-muted-foreground">Your Messages</h3>
          <p class="max-w-xs text-center text-sm text-muted-foreground/70">
            Select a friend to start chatting, or find new friends in the search tab.
          </p>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { Search as SearchIcon, Users as UsersIcon, Inbox, MessageSquare } from "lucide-vue-next";
import { watchDebounced } from "@vueuse/core";
import type { Friend } from "~/composables/useFriends";

const api = useApi();
const route = useRoute();

const {
  friends,
  incomingRequests,
  outgoingRequests,
  searchResults,
  loadingFriends,
  loadingRequests,
  searchLoading,
  fetchFriends,
  fetchRequests,
  sendRequest,
  acceptRequest,
  declineRequest,
  cancelRequest,
  removeFriend,
  searchUsers,
  listenRealtime,
  stopRealtime
} = useFriends();

const activeTab = ref<"all" | "pending" | "search">("all");
const searchQuery = ref("");

const tabs = computed(() => [
  { id: "all" as const, label: "All Friends", count: friends.value.length },
  {
    id: "pending" as const,
    label: "Pending",
    count: incomingRequests.value.length + outgoingRequests.value.length
  },
  { id: "search" as const, label: "Search", count: 0 }
]);

const onlineFriends = computed(() => friends.value.filter((f) => f.is_online));
const offlineFriends = computed(() => friends.value.filter((f) => !f.is_online));

watchDebounced(
  searchQuery,
  (q) => {
    searchUsers(q);
  },
  { debounce: 300 }
);

const selectedFriend = ref<Friend | null>(null);
const conversationId = ref<string | null>(null);

const {
  messages: dmMessages,
  loading: dmLoading,
  hasMore: dmHasMore,
  connected: dmConnected,
  friendTyping,
  init: initDm,
  reset: resetDm,
  sendMessage: sendDm,
  loadMore: loadMoreDm,
  startTyping,
  disconnect: disconnectDm
} = useDmChat(
  conversationId,
  computed(() => selectedFriend.value?.id ?? "")
);

async function selectFriend(friend: Friend) {
  if (selectedFriend.value?.id === friend.id) return;

  selectedFriend.value = friend;
  resetDm();

  try {
    const data = await api<{ conversation: { id: string } }>("/api/dm/conversations", {
      method: "POST",
      body: { friendId: friend.id }
    });
    conversationId.value = data.conversation.id;
    await initDm();
  } catch {
    conversationId.value = null;
  }
}

async function handleSendDm(content: string) {
  await sendDm(content);
}

onMounted(async () => {
  await Promise.all([fetchFriends(), fetchRequests()]);
  listenRealtime();

  const dmUserId = route.query.dm as string | undefined;
  if (dmUserId) {
    const friend = friends.value.find((f) => f.id === dmUserId);
    if (friend) {
      await selectFriend(friend);
    }
  }
});

onUnmounted(() => {
  stopRealtime();
  disconnectDm();
});
</script>
