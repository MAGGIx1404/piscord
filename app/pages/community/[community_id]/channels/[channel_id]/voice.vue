<template>
  <main
    class="flex h-[calc(100vh-96px)] w-full flex-col overflow-hidden bg-linear-to-b from-background to-background/95"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between border-b border-border/50 bg-background/60 px-5 py-2.5 backdrop-blur-md"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex size-8 items-center justify-center rounded-lg"
          :class="joined ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'"
        >
          <Volume2 class="size-4" />
        </div>
        <div>
          <h1 class="text-sm leading-tight font-semibold">{{ channelName || "Voice Channel" }}</h1>
          <p class="text-xs text-muted-foreground">
            <span v-if="joined" class="text-green-500">Connected</span>
            <span v-else>Not connected</span>
            <span class="mx-1.5 text-border">·</span>
            {{ participants.length }}
            {{ participants.length === 1 ? "participant" : "participants" }}
          </p>
        </div>
      </div>

      <LazyVoiceControlBar
        v-if="joined"
        :is-muted="isMuted"
        @toggle-mute="toggleMute"
        @leave="leave"
        @reaction="handleReaction"
      />
    </div>

    <!-- Main Voice Area -->
    <div class="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
      <!-- Background glow -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          class="absolute top-1/2 left-1/2 size-150 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.03]"
          :class="joined ? 'bg-green-500' : 'bg-primary'"
        />
        <div
          v-if="joined"
          class="absolute top-1/2 left-1/2 size-100 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-green-500/2"
          style="animation-duration: 4s"
        />
      </div>

      <VoiceEmojiRain ref="emojiRainRef" />

      <!-- Not joined -->
      <div
        v-if="!joined && !connecting"
        class="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
      >
        <div class="relative">
          <div
            class="flex size-28 items-center justify-center rounded-3xl border border-border/50 bg-linear-to-br from-muted/80 to-muted/30 shadow-xl"
          >
            <Headphones class="size-14 text-muted-foreground/50" />
          </div>
          <div
            class="absolute -right-2 -bottom-2 flex size-10 items-center justify-center rounded-xl border border-border/50 bg-background shadow-lg"
          >
            <Mic class="size-5 text-muted-foreground/60" />
          </div>
        </div>
        <div>
          <h3 class="text-2xl font-bold tracking-tight">{{ channelName || "Voice Channel" }}</h3>
          <p class="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {{
              channelDescription ||
              "Ready to start a conversation? Join the voice channel to talk with others in real-time."
            }}
          </p>
        </div>
        <Button
          size="lg"
          class="mt-1 h-12 gap-2.5 rounded-xl px-8 text-base shadow-lg"
          @click="handleJoin"
        >
          <Phone class="size-5" />
          Join Voice Channel
        </Button>
        <p v-if="joinError" class="max-w-sm text-sm text-red-400">{{ joinError }}</p>
      </div>

      <!-- Connecting -->
      <div v-else-if="connecting" class="relative z-10 flex flex-col items-center gap-4">
        <div class="relative flex size-20 items-center justify-center">
          <div
            class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary"
            style="animation-duration: 1s"
          />
          <div
            class="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-primary/50"
            style="animation-duration: 1.5s; animation-direction: reverse"
          />
          <Headphones class="size-8 text-primary" />
        </div>
        <div class="text-center">
          <p class="font-medium">Connecting...</p>
          <p class="mt-1 text-xs text-muted-foreground">Setting up your microphone</p>
        </div>
      </div>

      <!-- Participants grid -->
      <div
        v-else-if="joined"
        class="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-6 p-6"
      >
        <div class="grid w-full max-w-4xl gap-5" :class="participantGridClass">
          <LazyVoiceParticipantCard
            v-for="p in participants"
            :key="p.userId"
            :participant="p"
            :is-current-user="p.userId === currentUserId"
          />
        </div>
        <p
          v-if="participants.length === 1"
          class="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <UsersRound class="size-4" />
          Waiting for others to join...
        </p>
      </div>

      <LazyVoiceReactionLog v-if="joined" ref="reactionLogRef" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { Volume2, Headphones, Phone, Mic, UsersRound } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const api = useApi();
const userStore = useUserStore();

const channelId = computed(() => route.params.channel_id as string);
const communityId = computed(() => route.params.community_id as string);
const currentUserId = computed(() => userStore.user?.id);

const channelName = ref("");
const channelDescription = ref("");
const joinError = ref("");

const {
  joined,
  connecting,
  isMuted,
  participants,
  join,
  leave,
  toggleMute,
  sendReaction,
  onReaction,
  getMemberInfo
} = useVoiceChannel(channelId);

const emojiRainRef = ref<{ spawn: (emoji: string) => void }>();
const reactionLogRef = ref<{ add: (emoji: string, username: string) => void }>();

// ── Reactions ──
onReaction((userId: string, emoji: string) => {
  const info = getMemberInfo(userId);
  emojiRainRef.value?.spawn(emoji);
  reactionLogRef.value?.add(emoji, info.username);
});

function handleReaction(emoji: string) {
  sendReaction(emoji);
}

// ── Channel info ──
async function fetchChannelInfo() {
  const data = await api<{
    channels: Array<{ id: string; name: string; description: string | null; type: string }>;
  }>(`/api/communities/${communityId.value}/channels`);

  const channel = data.channels.find((c) => c.id === channelId.value);
  if (channel) {
    if (channel.type !== "voice") {
      router.replace(`/community/${communityId.value}/channels/${channelId.value}`);
      return;
    }
    channelName.value = channel.name;
    channelDescription.value = channel.description ?? "";
  }
}

async function handleJoin() {
  joinError.value = "";
  try {
    await join();
  } catch (err) {
    if (err instanceof DOMException && err.name === "NotAllowedError") {
      joinError.value =
        "Microphone access denied. Please allow microphone permission and try again.";
    } else if (err instanceof DOMException && err.name === "NotFoundError") {
      joinError.value = "No microphone found. Please connect a microphone and try again.";
    } else if (err instanceof Error && err.message.startsWith("INSECURE_CONTEXT")) {
      joinError.value =
        "Microphone requires HTTPS. Use the LAN proxy (pnpm dev:lan) or access via localhost.";
    } else if (err instanceof Error && err.message.startsWith("WS_")) {
      joinError.value = "Could not connect to voice server. Check your connection and try again.";
    } else if (err instanceof Error && err.message.startsWith("TIMEOUT")) {
      joinError.value = "Voice connection timed out. Please try again.";
    } else {
      joinError.value = "Failed to join voice channel. Please try again.";
    }
  }
}

const participantGridClass = computed(() => {
  const count = participants.value.length;
  if (count <= 1) return "grid-cols-1 justify-items-center";
  if (count <= 2) return "mx-auto max-w-lg grid-cols-2 justify-items-center";
  if (count <= 4) return "grid-cols-2 justify-items-center sm:grid-cols-4";
  if (count <= 6) return "grid-cols-3 justify-items-center";
  return "grid-cols-3 justify-items-center sm:grid-cols-5";
});

onMounted(fetchChannelInfo);
</script>
