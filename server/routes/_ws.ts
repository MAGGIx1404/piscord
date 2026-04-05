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

interface WorkspacePeer {
  userId: string;
  scope: "workspace";
  workspaceId: string;
}

type AuthenticatedPeer = ChannelPeer | CommunityPeer | UserPeer | WorkspacePeer;

const peerAuth = new Map<Peer, AuthenticatedPeer>();
const channelPeers = new Map<string, Set<Peer>>();
const communityPeers = new Map<string, Set<Peer>>();
const userPeers = new Map<string, Set<Peer>>();
const workspacePeers = new Map<string, Set<Peer>>();
const typingUsers = new Map<string, Set<string>>();

// Voice channel state: channelId → set of userIds currently in voice
const voiceParticipants = new Map<string, Set<string>>();

function getVoiceParticipants(channelId: string): string[] {
  return [...(voiceParticipants.get(channelId) ?? [])];
}

function sendToPeerByUserId(channelId: string, targetUserId: string, data: unknown) {
  const peers = channelPeers.get(channelId);
  if (!peers) return;
  const payload = JSON.stringify(data);
  for (const peer of peers) {
    const auth = peerAuth.get(peer);
    if (auth && auth.userId === targetUserId && auth.scope === "channel") {
      peer.send(payload);
    }
  }
}

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

function broadcastToWorkspace(workspaceId: string, data: unknown, excludePeer?: Peer) {
  const peers = workspacePeers.get(workspaceId);
  if (!peers) return;
  const payload = JSON.stringify(data);
  for (const peer of peers) {
    if (peer !== excludePeer) {
      peer.send(payload);
    }
  }
}

function getWorkspaceOnlineUsers(workspaceId: string): { userId: string }[] {
  const peers = workspacePeers.get(workspaceId);
  if (!peers) return [];
  const seen = new Set<string>();
  const result: { userId: string }[] = [];
  for (const peer of peers) {
    const auth = peerAuth.get(peer);
    if (auth && !seen.has(auth.userId)) {
      seen.add(auth.userId);
      result.push({ userId: auth.userId });
    }
  }
  return result;
}

export {
  broadcastToChannel,
  broadcastToCommunity,
  broadcastToUser,
  broadcastToWorkspace,
  getOnlineUsers,
  getWorkspaceOnlineUsers,
  isUserOnline,
  channelPeers,
  communityPeers,
  userPeers,
  workspacePeers,
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

      if (!token || (!channelId && !communityId && scope !== "user" && scope !== "workspace")) {
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

        if (scope === "workspace") {
          const workspaceId = data.workspaceId as string | undefined;
          if (!workspaceId) {
            peer.send(JSON.stringify({ type: "error", message: "Missing workspaceId" }));
            return;
          }

          peerAuth.set(peer, { userId: payload.userId, scope: "workspace", workspaceId });

          if (!workspacePeers.has(workspaceId)) {
            workspacePeers.set(workspaceId, new Set());
          }
          workspacePeers.get(workspaceId)!.add(peer);

          const onlineUsers = getWorkspaceOnlineUsers(workspaceId);

          peer.send(
            JSON.stringify({
              type: "auth:success",
              userId: payload.userId,
              onlineUsers
            })
          );

          broadcastToWorkspace(
            workspaceId,
            {
              type: "workspace:presence:join",
              userId: payload.userId,
              onlineUsers
            },
            peer
          );
        } else if (channelId) {
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

      // ── Voice channel signaling ──

      if (type === "voice:join") {
        if (!voiceParticipants.has(auth.channelId)) {
          voiceParticipants.set(auth.channelId, new Set());
        }
        voiceParticipants.get(auth.channelId)!.add(auth.userId);

        // Tell the joiner who's already in the call
        peer.send(
          JSON.stringify({
            type: "voice:participants",
            participants: getVoiceParticipants(auth.channelId)
          })
        );

        // Tell everyone else that this user joined
        broadcastToChannel(
          auth.channelId,
          {
            type: "voice:user-joined",
            userId: auth.userId,
            participants: getVoiceParticipants(auth.channelId)
          },
          peer
        );
        return;
      }

      if (type === "voice:leave") {
        voiceParticipants.get(auth.channelId)?.delete(auth.userId);
        if (voiceParticipants.get(auth.channelId)?.size === 0) {
          voiceParticipants.delete(auth.channelId);
        }
        broadcastToChannel(auth.channelId, {
          type: "voice:user-left",
          userId: auth.userId,
          participants: getVoiceParticipants(auth.channelId)
        });
        return;
      }

      if (type === "voice:offer") {
        const targetUserId = data.targetUserId as string;
        if (targetUserId) {
          sendToPeerByUserId(auth.channelId, targetUserId, {
            type: "voice:offer",
            fromUserId: auth.userId,
            offer: data.offer
          });
        }
        return;
      }

      if (type === "voice:answer") {
        const targetUserId = data.targetUserId as string;
        if (targetUserId) {
          sendToPeerByUserId(auth.channelId, targetUserId, {
            type: "voice:answer",
            fromUserId: auth.userId,
            answer: data.answer
          });
        }
        return;
      }

      if (type === "voice:ice-candidate") {
        const targetUserId = data.targetUserId as string;
        if (targetUserId) {
          sendToPeerByUserId(auth.channelId, targetUserId, {
            type: "voice:ice-candidate",
            fromUserId: auth.userId,
            candidate: data.candidate
          });
        }
        return;
      }

      if (type === "voice:reaction") {
        const emoji = data.emoji as string;
        if (emoji) {
          broadcastToChannel(auth.channelId, {
            type: "voice:reaction",
            userId: auth.userId,
            emoji
          });
        }
        return;
      }
    }

    if (auth.scope === "workspace") {
      if (type === "workspace:update") {
        // Broadcast document update to all other peers in this workspace
        broadcastToWorkspace(
          auth.workspaceId,
          {
            type: "workspace:update",
            userId: auth.userId,
            content: data.content,
            version: data.version
          },
          peer
        );
        return;
      }

      if (type === "workspace:cursor") {
        broadcastToWorkspace(
          auth.workspaceId,
          {
            type: "workspace:cursor",
            userId: auth.userId,
            cursor: data.cursor
          },
          peer
        );
        return;
      }

      if (type === "workspace:saved") {
        broadcastToWorkspace(
          auth.workspaceId,
          {
            type: "workspace:saved",
            userId: auth.userId,
            version: data.version
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

        // Clean up voice participation on disconnect
        if (voiceParticipants.get(auth.channelId)?.has(auth.userId)) {
          voiceParticipants.get(auth.channelId)!.delete(auth.userId);
          if (voiceParticipants.get(auth.channelId)?.size === 0) {
            voiceParticipants.delete(auth.channelId);
          }
          broadcastToChannel(auth.channelId, {
            type: "voice:user-left",
            userId: auth.userId,
            participants: getVoiceParticipants(auth.channelId)
          });
        }

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
      } else if (auth.scope === "workspace") {
        workspacePeers.get(auth.workspaceId)?.delete(peer);
        if (workspacePeers.get(auth.workspaceId)?.size === 0) {
          workspacePeers.delete(auth.workspaceId);
        }

        broadcastToWorkspace(auth.workspaceId, {
          type: "workspace:presence:leave",
          userId: auth.userId,
          onlineUsers: getWorkspaceOnlineUsers(auth.workspaceId)
        });
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
        voiceParticipants.get(auth.channelId)?.delete(auth.userId);
      } else if (auth.scope === "community") {
        communityPeers.get(auth.communityId)?.delete(peer);
      } else if (auth.scope === "user") {
        userPeers.get(auth.userId)?.delete(peer);
        if (userPeers.get(auth.userId)?.size === 0) {
          userPeers.delete(auth.userId);
        }
      } else if (auth.scope === "workspace") {
        workspacePeers.get(auth.workspaceId)?.delete(peer);
        if (workspacePeers.get(auth.workspaceId)?.size === 0) {
          workspacePeers.delete(auth.workspaceId);
        }
      }
      peerAuth.delete(peer);
    }
  }
});
