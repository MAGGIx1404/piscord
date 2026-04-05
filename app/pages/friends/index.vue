<template>
  <main class="flex h-[calc(100vh-6rem)] w-full overflow-hidden rounded-xl border border-border/50">
    <FriendsSidebar
      :friends="friends"
      :incoming-requests="incomingRequests"
      :outgoing-requests="outgoingRequests"
      :search-results="searchResults"
      :loading-friends="loadingFriends"
      :loading-requests="loadingRequests"
      :search-loading="searchLoading"
      :selected-friend-id="selectedFriend?.id ?? null"
      @select-friend="selectFriend"
      @remove-friend="(f: Friend) => removeFriend(f.id)"
      @accept-request="acceptRequest"
      @decline-request="declineRequest"
      @cancel-request="cancelRequest"
      @send-request="(u: { id: string }) => sendRequest(u.id)"
      @search="searchUsers"
    />

    <div class="flex flex-1 flex-col">
      <template v-if="selectedFriend && conversationId">
        <LazyFriendsDmChatPanel
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
import { MessageSquare } from "lucide-vue-next";
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
