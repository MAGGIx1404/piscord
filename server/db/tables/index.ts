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

// ─── Database ────────────────────────────────────────────────────────────────

export interface Database {
  users: UsersTable;
  refresh_sessions: RefreshSessionsTable;
}
