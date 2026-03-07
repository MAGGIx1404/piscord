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
  is_discoverable: ColumnType<boolean, boolean | undefined, boolean>;
  enable_welcome: ColumnType<boolean, boolean | undefined, boolean>;
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

// ─── Database ────────────────────────────────────────────────────────────────

export interface Database {
  users: UsersTable;
  refresh_sessions: RefreshSessionsTable;
  communities: CommunitiesTable;
  roles: RolesTable;
  community_members: CommunityMembersTable;
}
