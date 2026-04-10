interface CollabUser {
  userId: string;
  username: string;
  avatar_url: string | null;
}

interface CursorPosition {
  userId: string;
  from: number;
  to: number;
}

export function useWorkspaceCollab(communityId: string, workspaceId: string) {
  const api = useApi();

  const connected = ref(false);
  const onlineUsers = ref<CollabUser[]>([]);
  const remoteCursors = ref<Map<string, CursorPosition>>(new Map());
  const saving = ref(false);
  const lastSavedAt = ref<Date | null>(null);
  const saveError = ref(false);

  let ws: WebSocket | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let contentVersion = 0;
  let onUpdateCallback: ((content: any, userId: string) => void) | null = null;
  let onCursorCallback: ((cursor: CursorPosition) => void) | null = null;
  let memberCache = new Map<string, CollabUser>();

  // --- WebSocket connection ---

  function connect() {
    if (import.meta.server) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/_ws`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws?.send(
        JSON.stringify({
          type: "auth",
          scope: "workspace",
          workspaceId
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleMessage(data);
    };

    ws.onclose = () => {
      connected.value = false;
      // auto-reconnect after 3s
      setTimeout(() => {
        if (!connected.value) connect();
      }, 3000);
    };

    ws.onerror = () => {
      connected.value = false;
    };
  }

  async function handleMessage(data: Record<string, unknown>) {
    const type = data.type as string;

    if (type === "auth:success") {
      connected.value = true;
      await loadMembers();
      return;
    }

    if (type === "workspace:presence:join" || type === "workspace:presence:leave") {
      const users = data.onlineUsers as { userId: string }[];
      await resolveUsers(users.map((u) => u.userId));
      onlineUsers.value = users
        .map((u) => memberCache.get(u.userId))
        .filter(Boolean) as CollabUser[];
      return;
    }

    if (type === "workspace:update") {
      const remoteVersion = data.version as number;
      if (remoteVersion > contentVersion) {
        contentVersion = remoteVersion;
        onUpdateCallback?.(data.content, data.userId as string);
      }
      return;
    }

    if (type === "workspace:cursor") {
      const cursor = data.cursor as CursorPosition;
      if (cursor) {
        cursor.userId = data.userId as string;
        remoteCursors.value.set(cursor.userId, cursor);
        remoteCursors.value = new Map(remoteCursors.value);
        onCursorCallback?.(cursor);
      }
      return;
    }

    if (type === "workspace:saved") {
      // Another user saved
      return;
    }
  }

  // --- Member resolution ---

  async function loadMembers() {
    try {
      const members = await api<CollabUser[]>(
        `/api/communities/${communityId}/workspaces/${workspaceId}/members`
      );
      for (const m of members) {
        memberCache.set(m.userId ?? (m as any).id, {
          userId: (m as any).id ?? m.userId,
          username: m.username,
          avatar_url: m.avatar_url
        });
      }
    } catch {
      // will resolve lazily
    }
  }

  async function resolveUsers(userIds: string[]) {
    const missing = userIds.filter((id) => !memberCache.has(id));
    if (missing.length === 0) return;

    try {
      const members = await api<CollabUser[]>(
        `/api/communities/${communityId}/workspaces/${workspaceId}/members`
      );
      for (const m of members) {
        const id = (m as any).id ?? m.userId;
        memberCache.set(id, {
          userId: id,
          username: m.username,
          avatar_url: m.avatar_url
        });
      }
    } catch {
      // fallback - create placeholder users
      for (const id of missing) {
        memberCache.set(id, { userId: id, username: "User", avatar_url: null });
      }
    }
  }

  // --- Content sync ---

  async function loadContent(): Promise<any> {
    try {
      const data = await api<{ content: any; updated_at: string }>(
        `/api/communities/${communityId}/workspaces/${workspaceId}/content`
      );
      if (data.updated_at) {
        lastSavedAt.value = new Date(data.updated_at);
      }
      return data.content;
    } catch {
      return null;
    }
  }

  function broadcastUpdate(content: any) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    contentVersion++;
    ws.send(
      JSON.stringify({
        type: "workspace:update",
        content,
        version: contentVersion
      })
    );
  }

  function broadcastCursor(from: number, to: number) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({
        type: "workspace:cursor",
        cursor: { from, to }
      })
    );
  }

  async function saveContent(content: any) {
    saving.value = true;
    saveError.value = false;
    try {
      const result = await api<{ success: boolean; updated_at: string }>(
        `/api/communities/${communityId}/workspaces/${workspaceId}/content`,
        {
          method: "PUT",
          body: { content }
        }
      );
      lastSavedAt.value = new Date(result.updated_at);

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "workspace:saved",
            version: contentVersion
          })
        );
      }
    } catch {
      saveError.value = true;
    } finally {
      saving.value = false;
    }
  }

  function debouncedSave(content: any) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveContent(content), 1500);
  }

  // --- Event callbacks ---

  function onRemoteUpdate(cb: (content: any, userId: string) => void) {
    onUpdateCallback = cb;
  }

  function onRemoteCursor(cb: (cursor: CursorPosition) => void) {
    onCursorCallback = cb;
  }

  // --- Cleanup ---

  function disconnect() {
    if (saveTimer) clearTimeout(saveTimer);
    if (ws) {
      ws.onclose = null;
      ws.close();
      ws = null;
    }
    connected.value = false;
  }

  return {
    connected,
    onlineUsers,
    remoteCursors,
    saving,
    lastSavedAt,
    saveError,
    connect,
    disconnect,
    loadContent,
    saveContent,
    debouncedSave,
    broadcastUpdate,
    broadcastCursor,
    onRemoteUpdate,
    onRemoteCursor
  };
}
