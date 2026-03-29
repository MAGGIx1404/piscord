import type { Peer } from "crossws";
import { verifyAccessToken } from "../utils/jwt";
import { parse as parseCookies } from "cookie-es";
import { getFriendIds } from "../services/friendService";

interface ChannelPeer {
  userId: string;
  scope: "channel";
  channelId: string;
}

interface CommunityPeer {
  userId: string;
  scope: "community";
  communityId: string;
}

interface UserPeer {
  userId: string;
  scope: "user";
}

type AuthenticatedPeer = ChannelPeer | CommunityPeer | UserPeer;

const peerAuth = new Map<Peer, AuthenticatedPeer>();
const channelPeers = new Map<string, Set<Peer>>();
const communityPeers = new Map<string, Set<Peer>>();
const userPeers = new Map<string, Set<Peer>>();
const typingUsers = new Map<string, Set<string>>();

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

function broadcastToCommunity(communityId: string, data: unknown, excludePeer?: Peer) {
  const peers = communityPeers.get(communityId);
  if (!peers) return;
  const payload = JSON.stringify(data);
  for (const peer of peers) {
    if (peer !== excludePeer) {
      peer.send(payload);
    }
  }
}

function broadcastToUser(userId: string, data: unknown, excludePeer?: Peer) {
  const peers = userPeers.get(userId);
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

function isUserOnline(userId: string): boolean {
  return (userPeers.get(userId)?.size ?? 0) > 0;
}

export {
  broadcastToChannel,
  broadcastToCommunity,
  broadcastToUser,
  getOnlineUsers,
  isUserOnline,
  channelPeers,
  communityPeers,
  userPeers,
  peerAuth
};

export default defineWebSocketHandler({
  open(_peer) {},

  message(peer, msg) {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(msg.text());
    } catch {
      peer.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      return;
    }

    const { type } = data;

    if (type === "auth") {
      const channelId = data.channelId as string | undefined;
      const communityId = data.communityId as string | undefined;
      const scope = data.scope as string | undefined;

      let token = data.token as string | undefined;

      if (!token) {
        const cookieHeader =
          peer.request?.headers?.get?.("cookie") ?? (peer as any).headers?.cookie ?? "";
        if (cookieHeader) {
          const cookies = parseCookies(cookieHeader as string);
          token = cookies.access_token;
        }
      }

      if (!token || (!channelId && !communityId && scope !== "user")) {
        peer.send(
          JSON.stringify({
            type: "error",
            message: "Missing token or channelId/communityId/scope"
          })
        );
        return;
      }

      try {
        const payload = verifyAccessToken(token);

        if (channelId) {
          peerAuth.set(peer, { userId: payload.userId, scope: "channel", channelId });

          if (!channelPeers.has(channelId)) {
            channelPeers.set(channelId, new Set());
          }
          channelPeers.get(channelId)!.add(peer);

          peer.send(
            JSON.stringify({
              type: "auth:success",
              userId: payload.userId,
              onlineUsers: getOnlineUsers(channelId)
            })
          );

          broadcastToChannel(
            channelId,
            {
              type: "presence:join",
              userId: payload.userId,
              onlineUsers: getOnlineUsers(channelId)
            },
            peer
          );
        } else if (communityId) {
          peerAuth.set(peer, { userId: payload.userId, scope: "community", communityId });

          if (!communityPeers.has(communityId)) {
            communityPeers.set(communityId, new Set());
          }
          communityPeers.get(communityId)!.add(peer);

          peer.send(JSON.stringify({ type: "auth:success", userId: payload.userId }));
        } else if (scope === "user") {
          peerAuth.set(peer, { userId: payload.userId, scope: "user" });

          const wasOnline = (userPeers.get(payload.userId)?.size ?? 0) > 0;

          if (!userPeers.has(payload.userId)) {
            userPeers.set(payload.userId, new Set());
          }
          userPeers.get(payload.userId)!.add(peer);

          peer.send(JSON.stringify({ type: "auth:success", userId: payload.userId }));

          if (!wasOnline) {
            getFriendIds(payload.userId).then((friendIds) => {
              for (const fid of friendIds) {
                broadcastToUser(fid, { type: "friend:online", userId: payload.userId });
              }
            });
          }
        }
      } catch {
        peer.send(JSON.stringify({ type: "error", message: "Invalid token" }));
      }
      return;
    }

    const auth = peerAuth.get(peer);
    if (!auth) {
      peer.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
      return;
    }

    if (auth.scope === "channel") {
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
    }

    if (auth.scope === "user") {
      if (type === "dm:typing:start") {
        const recipientId = data.recipientId as string;
        const conversationId = data.conversationId as string;
        if (recipientId && conversationId) {
          broadcastToUser(recipientId, {
            type: "dm:typing:update",
            conversationId,
            userId: auth.userId,
            typing: true
          });
        }
        return;
      }

      if (type === "dm:typing:stop") {
        const recipientId = data.recipientId as string;
        const conversationId = data.conversationId as string;
        if (recipientId && conversationId) {
          broadcastToUser(recipientId, {
            type: "dm:typing:update",
            conversationId,
            userId: auth.userId,
            typing: false
          });
        }
        return;
      }
    }
  },

  close(peer) {
    const auth = peerAuth.get(peer);
    if (auth) {
      if (auth.scope === "channel") {
        channelPeers.get(auth.channelId)?.delete(peer);
        if (channelPeers.get(auth.channelId)?.size === 0) {
          channelPeers.delete(auth.channelId);
        }

        typingUsers.get(auth.channelId)?.delete(auth.userId);

        broadcastToChannel(auth.channelId, {
          type: "presence:leave",
          userId: auth.userId,
          onlineUsers: getOnlineUsers(auth.channelId)
        });
      } else if (auth.scope === "community") {
        communityPeers.get(auth.communityId)?.delete(peer);
        if (communityPeers.get(auth.communityId)?.size === 0) {
          communityPeers.delete(auth.communityId);
        }
      } else if (auth.scope === "user") {
        userPeers.get(auth.userId)?.delete(peer);
        if (userPeers.get(auth.userId)?.size === 0) {
          userPeers.delete(auth.userId);

          getFriendIds(auth.userId).then((friendIds) => {
            for (const fid of friendIds) {
              broadcastToUser(fid, { type: "friend:offline", userId: auth.userId });
            }
          });
        }
      }

      peerAuth.delete(peer);
    }
  },

  error(peer, error) {
    console.error("[WebSocket Error]", error);
    const auth = peerAuth.get(peer);
    if (auth) {
      if (auth.scope === "channel") {
        channelPeers.get(auth.channelId)?.delete(peer);
        typingUsers.get(auth.channelId)?.delete(auth.userId);
      } else if (auth.scope === "community") {
        communityPeers.get(auth.communityId)?.delete(peer);
      } else if (auth.scope === "user") {
        userPeers.get(auth.userId)?.delete(peer);
        if (userPeers.get(auth.userId)?.size === 0) {
          userPeers.delete(auth.userId);
        }
      }
      peerAuth.delete(peer);
    }
  }
});
