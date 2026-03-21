import { toast } from "vue-sonner";

type MessageHandler = (data: Record<string, unknown>) => void;

const ws = ref<WebSocket | null>(null);
const connected = ref(false);
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const handlers = new Set<MessageHandler>();

let initialized = false;

export function useUserSocket() {
  function connect() {
    if (import.meta.server || initialized) return;
    initialized = true;
    _connect();
  }

  function _connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/_ws`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "auth", scope: "user" }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "auth:success") {
        connected.value = true;
        return;
      }

      // DM toast notification (handled globally)
      if (data.type === "dm:new") {
        const msg = data.message as { sender: { username: string }; content: string };
        toast.info(`${msg.sender.username}: ${msg.content.slice(0, 80)}`, {
          description: "New message",
          action: {
            label: "Open",
            onClick: () => {
              navigateTo({ path: "/friends", query: { dm: (data.message as any).sender.id } });
            }
          }
        });
      }

      // Forward to all registered handlers
      for (const handler of handlers) {
        handler(data);
      }
    };

    socket.onclose = () => {
      connected.value = false;
      ws.value = null;
      reconnectTimer = setTimeout(_connect, 3000);
    };

    socket.onerror = () => {
      connected.value = false;
    };

    ws.value = socket;
  }

  function disconnect() {
    initialized = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws.value) {
      ws.value.onclose = null;
      ws.value.close();
      ws.value = null;
    }
    connected.value = false;
  }

  function onMessage(handler: MessageHandler) {
    handlers.add(handler);
    return () => handlers.delete(handler);
  }

  function send(data: Record<string, unknown>) {
    ws.value?.send(JSON.stringify(data));
  }

  return {
    connected,
    connect,
    disconnect,
    onMessage,
    send
  };
}
