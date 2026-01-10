export type UserStatus = "online" | "offline" | "away" | "sleep";
export type CommunityType = "public" | "private";
export type CommunityTier = "free" | "premium" | "enterprise";
export type MemberRole = "owner" | "admin" | "moderator" | "member" | "guest";
export type FriendshipStatus = "pending" | "accepted" | "blocked" | "removed";
export type NotificationType =
  | "friend_request"
  | "friend_accepted"
  | "community_invite"
  | "join_community_request"
  | "community_joined"
  | "message_mention"
  | "message_reply"
  | "message_reaction"
  | "channel_mention"
  | "badge_earned"
  | "document_comment"
  | "document_shared";
export type CommunityCategory =
  | "gaming"
  | "tech"
  | "study"
  | "art"
  | "music"
  | "fun"
  | "business"
  | "entertainment"
  | "lifestyle"
  | "education";
