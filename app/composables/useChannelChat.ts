import { ref, onUnmounted } from "vue";

export interface ChatMessage {
  id: string;
  channel_id: string;
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  content: string | null;
  type: string;
  reply_to_id: string | null;
  is_edited: boolean;
  is_pinned: boolean;
  reactions: { emoji: string; count: number; reacted: boolean }[];
  created_at: string;
  updated_at: string;
}

export interface ChannelMember {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface AIAgent {
  name: string | null;
  pet_name: string | null;
  avatar: string | null;
  provider: "puter" | "ollama";
  model: string | null;
  ollama_model: string | null;
  description: string | null;
}

export function useChannelChat(channelId: Ref<string>) {
  const api = useApi();
  const userStore = useUserStore();

  // State
  const messages = ref<ChatMessage[]>([]);
  const members = ref<ChannelMember[]>([]);
  const aiAgent = ref<AIAgent | null>(null);
  const canManage = ref(false);
  const onlineUsers = ref<string[]>([]);
  const typingUsers = ref<string[]>([]);
  const loading = ref(true);
  const hasMore = ref(false);
  const connected = ref(false);
  const replyingTo = ref<ChatMessage | null>(null);

  let ws: WebSocket | null = null;
  let typingTimer: ReturnType<typeof setTimeout> | null = null;
  let isTyping = false;

  // ── Fetch initial data ─────────────────────────────────────────────────

  async function fetchMessages(before?: string) {
    const params = new URLSearchParams();
    if (before) params.set("before", before);
    params.set("limit", "50");

    const data = await api<{ messages: ChatMessage[]; has_more: boolean }>(
      `/api/channels/${channelId.value}/messages?${params.toString()}`
    );

    if (before) {
      // Prepend older messages
      messages.value = [...data.messages, ...messages.value];
    } else {
      messages.value = data.messages;
    }
    hasMore.value = data.has_more;
  }

  async function fetchMembers() {
    const data = await api<{
      members: ChannelMember[];
      ai_agent: AIAgent | null;
      can_manage: boolean;
    }>(`/api/channels/${channelId.value}/members`);
    members.value = data.members;
    aiAgent.value = data.ai_agent;
    canManage.value = data.can_manage;
  }

  async function loadMore() {
    if (!hasMore.value || messages.value.length === 0) return;
    const oldest = messages.value[0];
    if (oldest) await fetchMessages(oldest.id);
  }

  // ── WebSocket ──────────────────────────────────────────────────────────

  function connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/_ws`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // Authenticate — token is read from the httpOnly cookie on the server side
      ws?.send(
        JSON.stringify({
          type: "auth",
          channelId: channelId.value
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWSMessage(data);
    };

    ws.onclose = () => {
      connected.value = false;
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (channelId.value) connect();
      }, 3000);
    };

    ws.onerror = () => {
      connected.value = false;
    };
  }

  function handleWSMessage(data: Record<string, unknown>) {
    switch (data.type) {
      case "auth:success":
        connected.value = true;
        onlineUsers.value = data.onlineUsers as string[];
        break;

      case "message:new": {
        const msg = data.message as ChatMessage;
        // Avoid duplicates (sender already has it from API response)
        if (!messages.value.find((m) => m.id === msg.id)) {
          messages.value.push(msg);
        }
        break;
      }

      case "reaction:update": {
        const msgId = data.messageId as string;
        const reactions = data.reactions as ChatMessage["reactions"];
        const msg = messages.value.find((m) => m.id === msgId);
        if (msg) msg.reactions = reactions;
        break;
      }

      case "typing:update":
        typingUsers.value = (data.typingUsers as string[]).filter(
          (id) => id !== userStore.user?.id
        );
        break;

      case "presence:join":
      case "presence:leave":
        onlineUsers.value = data.onlineUsers as string[];
        break;

      case "error":
        console.error("[WS Error]", data.message);
        break;
    }
  }

  function disconnect() {
    if (ws) {
      ws.onclose = null; // Prevent reconnect
      ws.close();
      ws = null;
    }
    connected.value = false;
  }

  // ── Actions ────────────────────────────────────────────────────────────

  async function sendMessage(content: string, replyToId?: string) {
    const data = await api<{ message: ChatMessage }>(`/api/channels/${channelId.value}/messages`, {
      method: "POST",
      body: {
        content,
        reply_to_id: replyToId
      }
    });

    // Add to local messages immediately
    if (!messages.value.find((m) => m.id === data.message.id)) {
      messages.value.push(data.message);
    }

    // Stop typing
    stopTyping();
    replyingTo.value = null;

    return data.message;
  }

  async function toggleReaction(messageId: string, emoji: string) {
    const data = await api<{ added: boolean; reactions: ChatMessage["reactions"] }>(
      `/api/messages/${messageId}/reactions`,
      {
        method: "POST",
        body: { emoji }
      }
    );

    // Update local message reactions
    const msg = messages.value.find((m) => m.id === messageId);
    if (msg) msg.reactions = data.reactions;
  }

  function startTyping() {
    if (isTyping) return;
    isTyping = true;
    ws?.send(JSON.stringify({ type: "typing:start" }));

    // Auto-stop after 5 seconds
    typingTimer = setTimeout(() => {
      stopTyping();
    }, 5000);
  }

  function stopTyping() {
    if (!isTyping) return;
    isTyping = false;
    ws?.send(JSON.stringify({ type: "typing:stop" }));
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
  }

  function setReplyTo(message: ChatMessage | null) {
    replyingTo.value = message;
  }

  // ── Init & Cleanup ────────────────────────────────────────────────────

  async function init() {
    loading.value = true;
    try {
      await Promise.all([fetchMessages(), fetchMembers()]);
      connect();
    } finally {
      loading.value = false;
    }
  }

  onUnmounted(() => {
    disconnect();
    if (typingTimer) clearTimeout(typingTimer);
  });

  return {
    // State
    messages,
    members,
    aiAgent,
    canManage,
    onlineUsers,
    typingUsers,
    loading,
    hasMore,
    connected,
    replyingTo,

    // Actions
    init,
    sendMessage,
    toggleReaction,
    loadMore,
    startTyping,
    stopTyping,
    setReplyTo,
    disconnect
  };
}
