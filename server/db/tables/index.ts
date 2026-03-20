import type { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

// ─── Users ──────────────────────────────────────────────────────────────────

export interface UsersTable {
  id: Generated<string>;
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  is_2fa_enabled: ColumnType<boolean, boolean | undefined, boolean>;
  totp_secret: string | null;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

// ─── Refresh Sessions ────────────────────────────────────────────────────────

export interface RefreshSessionsTable {
  id: Generated<string>;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: ColumnType<Date, never, never>;
}

export type RefreshSession = Selectable<RefreshSessionsTable>;
export type NewRefreshSession = Insertable<RefreshSessionsTable>;

// ─── Communities ─────────────────────────────────────────────────────────────

export interface CommunitiesTable {
  id: Generated<string>;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  banner_url: string | null;
  /** JSON-serialised array of { id: number; text: string } */
  rules: string | null;
  is_public: ColumnType<boolean, boolean | undefined, boolean>;
  member_count: ColumnType<number, number | undefined, number>;
  category: string | null;
  tags: ColumnType<string[], string[] | undefined, string[]>;
  require_approval: ColumnType<boolean, boolean | undefined, boolean>;
  is_ai_pet: ColumnType<boolean, boolean | undefined, boolean>;
  ai_agent_name: string | null;
  ai_agent_pet_name: string | null;
  ai_agent_avatar: string | null;
  ai_agent_model: string | null;
  ai_agent_description: string | null;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
}

export type Community = Selectable<CommunitiesTable>;
export type NewCommunity = Insertable<CommunitiesTable>;
export type CommunityUpdate = Updateable<CommunitiesTable>;

// ─── Roles ───────────────────────────────────────────────────────────────────

export interface RolesTable {
  id: Generated<string>;
  community_id: string;
  name: string;
  color: string | null;
  permissions: ColumnType<number, number | undefined, number>;
  position: ColumnType<number, number | undefined, number>;
  is_default: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: ColumnType<Date, never, never>;
}

export type Role = Selectable<RolesTable>;
export type NewRole = Insertable<RolesTable>;

// ─── Community Members ────────────────────────────────────────────────────────

export interface CommunityMembersTable {
  id: Generated<string>;
  community_id: string;
  user_id: string;
  nickname: string | null;
  joined_at: ColumnType<Date, never, never>;
}

export type CommunityMember = Selectable<CommunityMembersTable>;
export type NewCommunityMember = Insertable<CommunityMembersTable>;

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType =
  | "friend_request"
  | "friend_accepted"
  | "community_invite"
  | "community_join"
  | "mention"
  | "channel_message"
  | "system";

export type NotificationEntityType = "friend_request" | "community" | "channel" | "message";

export interface NotificationsTable {
  id: Generated<string>;
  /** Recipient user */
  user_id: string;
  /** User who triggered the notification – NULL for system notifications */
  actor_id: string | null;
  /** Discriminator for the notification kind */
  type: NotificationType;
  /** Polymorphic discriminator – names the source table */
  entity_type: NotificationEntityType | null;
  /** PK of the referenced row (no DB-level FK – polymorphic) */
  entity_id: string | null;
  /** Arbitrary JSON payload (previews, snapshots, etc.) */
  data: ColumnType<
    Record<string, unknown>,
    Record<string, unknown> | undefined,
    Record<string, unknown>
  >;
  /** NULL = unread; timestamp = when it was read */
  read_at: Date | null;
  created_at: ColumnType<Date, never, never>;
}

export type Notification = Selectable<NotificationsTable>;
export type NewNotification = Insertable<NotificationsTable>;
export type NotificationUpdate = Updateable<NotificationsTable>;

// ─── Community Join Requests ──────────────────────────────────────────────────

export type CommunityJoinRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface CommunityJoinRequestsTable {
  id: Generated<string>;
  community_id: string;
  user_id: string;
  /** Optional message from the requester */
  note: string | null;
  /** 'pending' | 'approved' | 'rejected' | 'cancelled' */
  status: CommunityJoinRequestStatus;
  /** Admin/mod who reviewed the request – NULL until actioned */
  reviewed_by: string | null;
  reviewed_at: Date | null;
  /** Set to now() when the user opens the notification modal and sees the result */
  notified_at: Date | null;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
}

export type CommunityJoinRequest = Selectable<CommunityJoinRequestsTable>;
export type NewCommunityJoinRequest = Insertable<CommunityJoinRequestsTable>;
export type CommunityJoinRequestUpdate = Updateable<CommunityJoinRequestsTable>;

// ─── Channels ───────────────────────────────────────────────────────────────

export type ChannelType = "text" | "voice" | "announcement" | "category";

export interface ChannelsTable {
  id: Generated<string>;
  community_id: string;
  /** Self-referencing FK — categories contain child channels */
  parent_id: string | null;
  type: ColumnType<ChannelType, ChannelType | undefined, ChannelType>;
  name: string;
  topic: string | null;
  description: string | null;
  banner_url: string | null;
  position: ColumnType<number, number | undefined, number>;
  is_private: ColumnType<boolean, boolean | undefined, boolean>;
  slowmode_seconds: ColumnType<number, number | undefined, number>;
  last_message_at: Date | null;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
}

export type Channel = Selectable<ChannelsTable>;
export type NewChannel = Insertable<ChannelsTable>;
export type ChannelUpdate = Updateable<ChannelsTable>;

// ─── Workspaces ─────────────────────────────────────────────────────────────

export interface WorkspacesTable {
  id: Generated<string>;
  community_id: string;
  created_by: string;
  name: string;
  emoji: string | null;
  description: string | null;
  banner_url: string | null;
  is_public: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
}

export type Workspace = Selectable<WorkspacesTable>;
export type NewWorkspace = Insertable<WorkspacesTable>;
export type WorkspaceUpdate = Updateable<WorkspacesTable>;

// ─── Messages ──────────────────────────────────────────────────────────────

export type MessageType = "default" | "system" | "ai";

export interface MessagesTable {
  id: Generated<string>;
  channel_id: string;
  author_id: string;
  reply_to_id: string | null;
  content: string | null;
  type: ColumnType<MessageType, MessageType | undefined, MessageType>;
  is_edited: ColumnType<boolean, boolean | undefined, boolean>;
  is_pinned: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
}

export type Message = Selectable<MessagesTable>;
export type NewMessage = Insertable<MessagesTable>;
export type MessageUpdate = Updateable<MessagesTable>;

// ─── Message Attachments ───────────────────────────────────────────────────

export interface MessageAttachmentsTable {
  id: Generated<string>;
  message_id: string;
  url: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: ColumnType<Date, never, never>;
}

export type MessageAttachment = Selectable<MessageAttachmentsTable>;
export type NewMessageAttachment = Insertable<MessageAttachmentsTable>;

// ─── Reactions ─────────────────────────────────────────────────────────────

export interface ReactionsTable {
  id: Generated<string>;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: ColumnType<Date, never, never>;
}

export type Reaction = Selectable<ReactionsTable>;
export type NewReaction = Insertable<ReactionsTable>;

// ─── Member Roles ───────────────────────────────────────────────────────────

export interface MemberRolesTable {
  member_id: string;
  role_id: string;
}

export type MemberRole = Selectable<MemberRolesTable>;
export type NewMemberRole = Insertable<MemberRolesTable>;

// ─── Database ────────────────────────────────────────────────────────────────

export interface Database {
  users: UsersTable;
  refresh_sessions: RefreshSessionsTable;
  communities: CommunitiesTable;
  roles: RolesTable;
  community_members: CommunityMembersTable;
  notifications: NotificationsTable;
  community_join_requests: CommunityJoinRequestsTable;
  channels: ChannelsTable;
  workspaces: WorkspacesTable;
  member_roles: MemberRolesTable;
  messages: MessagesTable;
  message_attachments: MessageAttachmentsTable;
  reactions: ReactionsTable;
}
