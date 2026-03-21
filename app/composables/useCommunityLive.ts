import { ref, onUnmounted, type Ref } from "vue";

export interface LiveActivityItem {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  joined_at: string;
}

export interface LiveJoinRequest {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  note: string | null;
  created_at: string;
  status: string;
}

interface CommunityLiveCallbacks {
  onJoinRequest?: (request: LiveJoinRequest) => void;
  onMemberJoin?: (member: LiveActivityItem, memberCount: number) => void;
  onRequestReviewed?: (
    requestId: string,
    status: string,
    userId: string,
    memberCount: number
  ) => void;
}

export function useCommunityLive(communityId: Ref<string>, callbacks: CommunityLiveCallbacks) {
  const connected = ref(false);
  let ws: WebSocket | null = null;

  function connect() {
    if (import.meta.server) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/_ws`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws?.send(JSON.stringify({ type: "auth", communityId: communityId.value }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleMessage(data);
    };

    ws.onclose = () => {
      connected.value = false;
      setTimeout(() => {
        if (communityId.value) connect();
      }, 3000);
    };

    ws.onerror = () => {
      connected.value = false;
    };
  }

  function handleMessage(data: Record<string, unknown>) {
    switch (data.type) {
      case "auth:success":
        connected.value = true;
        break;

      case "community:join_request":
        callbacks.onJoinRequest?.(data.request as LiveJoinRequest);
        break;

      case "community:member_join":
        callbacks.onMemberJoin?.(data.member as LiveActivityItem, data.member_count as number);
        break;

      case "community:request_reviewed":
        callbacks.onRequestReviewed?.(
          data.request_id as string,
          data.status as string,
          data.user_id as string,
          data.member_count as number
        );
        break;
    }
  }

  function disconnect() {
    if (ws) {
      ws.onclose = null;
      ws.close();
      ws = null;
    }
    connected.value = false;
  }

  onUnmounted(() => {
    disconnect();
  });

  return { connected, connect, disconnect };
}
