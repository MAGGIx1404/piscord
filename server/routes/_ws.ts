import type { Peer } from "crossws";
import { verifyAccessToken } from "../utils/jwt";
import { parse as parseCookies } from "cookie-es";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuthenticatedPeer {
  userId: string;
  channelId: string;
}

// ─── State ──────────────────────────────────────────────────────────────────

// Map of peer → auth info
const peerAuth = new Map<Peer, AuthenticatedPeer>();
// Map of channelId → Set of peers
const channelPeers = new Map<string, Set<Peer>>();
// Map of channelId → Set of userIds currently typing
const typingUsers = new Map<string, Set<string>>();

// ─── Helpers ────────────────────────────────────────────────────────────────

function broadcastToChannel(channelId: string, data: unknown, excludePeer?: Peer) {
  const peers = channelPeers.get(channelId);
  if (!peers) return;
  const payload = JSON.stringify(data);
  for (const peer of peers) {
    if (peer !== excludePeer) {
      peer.send(payload);
    }
  }
}

function getOnlineUsers(channelId: string): string[] {
  const peers = channelPeers.get(channelId);
  if (!peers) return [];
  const userIds = new Set<string>();
  for (const peer of peers) {
    const auth = peerAuth.get(peer);
    if (auth) userIds.add(auth.userId);
  }
  return [...userIds];
}

// ─── Export for use by API routes ───────────────────────────────────────────

export { broadcastToChannel, getOnlineUsers, channelPeers, peerAuth };

// ─── WebSocket Handler ─────────────────────────────────────────────────────

export default defineWebSocketHandler({
  open(peer) {
    // Client must authenticate via first message
  },

  message(peer, msg) {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(msg.text());
    } catch {
      peer.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      return;
    }

    const { type } = data;

    // ── Auth ─────────────────────────────────────────────────────────────
    if (type === "auth") {
      const channelId = data.channelId as string;
      // Token can come from the message payload or from the httpOnly cookie
      // (cookie is sent with the WebSocket upgrade request)
      let token = data.token as string | undefined;

      if (!token) {
        const cookieHeader =
          peer.request?.headers?.get?.("cookie") ?? (peer as any).headers?.cookie ?? "";
        if (cookieHeader) {
          const cookies = parseCookies(cookieHeader as string);
          token = cookies.access_token;
        }
      }

      if (!token || !channelId) {
        peer.send(JSON.stringify({ type: "error", message: "Missing token or channelId" }));
        return;
      }

      try {
        const payload = verifyAccessToken(token);
        peerAuth.set(peer, { userId: payload.userId, channelId });

        // Join channel room
        if (!channelPeers.has(channelId)) {
          channelPeers.set(channelId, new Set());
        }
        channelPeers.get(channelId)!.add(peer);

        // Send auth success + online users
        peer.send(
          JSON.stringify({
            type: "auth:success",
            userId: payload.userId,
            onlineUsers: getOnlineUsers(channelId)
          })
        );

        // Broadcast presence to channel
        broadcastToChannel(
          channelId,
          {
            type: "presence:join",
            userId: payload.userId,
            onlineUsers: getOnlineUsers(channelId)
          },
          peer
        );
      } catch {
        peer.send(JSON.stringify({ type: "error", message: "Invalid token" }));
      }
      return;
    }

    // All subsequent messages require auth
    const auth = peerAuth.get(peer);
    if (!auth) {
      peer.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
      return;
    }

    // ── Typing ───────────────────────────────────────────────────────────
    if (type === "typing:start") {
      if (!typingUsers.has(auth.channelId)) {
        typingUsers.set(auth.channelId, new Set());
      }
      typingUsers.get(auth.channelId)!.add(auth.userId);
      broadcastToChannel(
        auth.channelId,
        {
          type: "typing:update",
          typingUsers: [...(typingUsers.get(auth.channelId) ?? [])]
        },
        peer
      );
      return;
    }

    if (type === "typing:stop") {
      typingUsers.get(auth.channelId)?.delete(auth.userId);
      broadcastToChannel(
        auth.channelId,
        {
          type: "typing:update",
          typingUsers: [...(typingUsers.get(auth.channelId) ?? [])]
        },
        peer
      );
      return;
    }
  },

  close(peer) {
    const auth = peerAuth.get(peer);
    if (auth) {
      // Remove from channel
      channelPeers.get(auth.channelId)?.delete(peer);
      if (channelPeers.get(auth.channelId)?.size === 0) {
        channelPeers.delete(auth.channelId);
      }

      // Remove from typing
      typingUsers.get(auth.channelId)?.delete(auth.userId);

      // Broadcast presence leave
      broadcastToChannel(auth.channelId, {
        type: "presence:leave",
        userId: auth.userId,
        onlineUsers: getOnlineUsers(auth.channelId)
      });

      peerAuth.delete(peer);
    }
  },

  error(peer, error) {
    console.error("[WebSocket Error]", error);
    const auth = peerAuth.get(peer);
    if (auth) {
      channelPeers.get(auth.channelId)?.delete(peer);
      typingUsers.get(auth.channelId)?.delete(auth.userId);
      peerAuth.delete(peer);
    }
  }
});
