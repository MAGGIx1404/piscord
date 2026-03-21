import { onUnmounted } from "vue";

export interface DmChatMessage {
  id: string;
  conversation_id: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export function useDmChat(conversationId: Ref<string | null>, friendId: Ref<string>) {
  const api = useApi();

  const messages = ref<DmChatMessage[]>([]);
  const loading = ref(false);
  const hasMore = ref(false);
  const connected = ref(false);
  const friendTyping = ref(false);

  let ws: WebSocket | null = null;
  let typingTimer: ReturnType<typeof setTimeout> | null = null;
  let isTyping = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Fetch messages ──────────────────────────────────────────────────────

  async function fetchMessages(before?: string) {
    if (!conversationId.value) return;

    const params = new URLSearchParams();
    if (before) params.set("before", before);
    params.set("limit", "50");

    const data = await api<{ messages: DmChatMessage[]; has_more: boolean }>(
      `/api/dm/conversations/${conversationId.value}/messages?${params.toString()}`
    );

    if (before) {
      messages.value = [...data.messages, ...messages.value];
    } else {
      messages.value = data.messages;
    }
    hasMore.value = data.has_more;
  }

  async function loadMore() {
    if (!hasMore.value || messages.value.length === 0) return;
    const oldest = messages.value[0];
    if (oldest) await fetchMessages(oldest.id);
  }

  // ── WebSocket ───────────────────────────────────────────────────────────

  function connect() {
    if (import.meta.server) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/_ws`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws?.send(JSON.stringify({ type: "auth", scope: "user" }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWSMessage(data);
    };

    ws.onclose = () => {
      connected.value = false;
      reconnectTimer = setTimeout(() => {
        connect();
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
        break;

      case "dm:new": {
        const msg = data.message as DmChatMessage;
        if (data.conversationId === conversationId.value) {
          if (!messages.value.find((m) => m.id === msg.id)) {
            messages.value.push(msg);
          }
        }
        break;
      }

      case "dm:typing:update":
        if (data.conversationId === conversationId.value) {
          friendTyping.value = data.typing as boolean;
          // Auto-clear after 5 seconds
          if (data.typing) {
            setTimeout(() => {
              friendTyping.value = false;
            }, 5000);
          }
        }
        break;
    }
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      ws.onclose = null;
      ws.close();
      ws = null;
    }
    connected.value = false;
  }

  // ── Actions ─────────────────────────────────────────────────────────────

  async function sendMessage(content: string) {
    if (!conversationId.value) return null;

    const data = await api<{ message: DmChatMessage }>(
      `/api/dm/conversations/${conversationId.value}/messages`,
      { method: "POST", body: { content } }
    );

    if (!messages.value.find((m) => m.id === data.message.id)) {
      messages.value.push(data.message);
    }

    stopTyping();
    return data.message;
  }

  function startTyping() {
    if (isTyping || !connected.value) return;
    isTyping = true;
    ws?.send(
      JSON.stringify({
        type: "dm:typing:start",
        recipientId: friendId.value,
        conversationId: conversationId.value
      })
    );
    typingTimer = setTimeout(stopTyping, 5000);
  }

  function stopTyping() {
    if (!isTyping) return;
    isTyping = false;
    ws?.send(
      JSON.stringify({
        type: "dm:typing:stop",
        recipientId: friendId.value,
        conversationId: conversationId.value
      })
    );
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
  }

  // ── Init & Cleanup ──────────────────────────────────────────────────────

  async function init() {
    loading.value = true;
    try {
      await fetchMessages();
      connect();
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    messages.value = [];
    hasMore.value = false;
    friendTyping.value = false;
    loading.value = false;
  }

  onUnmounted(() => {
    disconnect();
    if (typingTimer) clearTimeout(typingTimer);
  });

  return {
    messages,
    loading,
    hasMore,
    connected,
    friendTyping,
    init,
    reset,
    sendMessage,
    loadMore,
    startTyping,
    stopTyping,
    disconnect
  };
}
