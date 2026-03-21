import { type Kysely, sql } from "kysely";

/**
 * Migration: init
 * Created:   2026-03-07T06:46:33.969Z
 *
 * Full initial schema for Flowcord:
 *   users, refresh_sessions, communities, community_members,
 *   roles, member_roles, channels, messages, message_attachments,
 *   workspaces, workspace_pages, friend_requests
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  // ─── pgcrypto (gen_random_uuid) ───────────────────────────────────────────
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`.execute(db);

  // ─── updated_at trigger function ──────────────────────────────────────────
  await sql`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db);

  // ─── users ────────────────────────────────────────────────────────────────
  await db.schema
    .createTable("users")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("username", "text", (col) => col.notNull().unique())
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("password_hash", "text", (col) => col.notNull())
    .addColumn("avatar_url", "text")
    .addColumn("bio", "text")
    .addColumn("is_2fa_enabled", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("totp_secret", "text")
    .addColumn("status", "text", (col) => col.notNull().defaultTo("offline"))
    // status: 'online' | 'idle' | 'dnd' | 'offline'
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`
    CREATE OR REPLACE TRIGGER users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);

  // ─── refresh_sessions ─────────────────────────────────────────────────────
  await db.schema
    .createTable("refresh_sessions")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("user_id", "text", (col) => col.notNull().references("users.id").onDelete("cascade"))
    .addColumn("token_hash", "text", (col) => col.notNull().unique())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex("idx_refresh_sessions_user_id")
    .ifNotExists()
    .on("refresh_sessions")
    .column("user_id")
    .execute();

  await db.schema
    .createIndex("idx_refresh_sessions_token_hash")
    .ifNotExists()
    .on("refresh_sessions")
    .column("token_hash")
    .execute();

  // ─── friend_requests ──────────────────────────────────────────────────────
  await db.schema
    .createTable("friend_requests")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("sender_id", "text", (col) =>
      col.notNull().references("users.id").onDelete("cascade")
    )
    .addColumn("receiver_id", "text", (col) =>
      col.notNull().references("users.id").onDelete("cascade")
    )
    // status: 'pending' | 'accepted' | 'declined' | 'blocked'
    .addColumn("status", "text", (col) => col.notNull().defaultTo("pending"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`
    CREATE OR REPLACE TRIGGER friend_requests_updated_at
      BEFORE UPDATE ON friend_requests
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);

  await db.schema
    .createIndex("idx_friend_requests_sender")
    .ifNotExists()
    .on("friend_requests")
    .column("sender_id")
    .execute();

  await db.schema
    .createIndex("idx_friend_requests_receiver")
    .ifNotExists()
    .on("friend_requests")
    .column("receiver_id")
    .execute();

  // ─── communities ──────────────────────────────────────────────────────────
  await db.schema
    .createTable("communities")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("owner_id", "text", (col) =>
      col.notNull().references("users.id").onDelete("restrict")
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("description", "text")
    .addColumn("icon_url", "text")
    .addColumn("banner_url", "text")
    .addColumn("rules", "text")
    .addColumn("is_public", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("member_count", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`
    CREATE OR REPLACE TRIGGER communities_updated_at
      BEFORE UPDATE ON communities
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);

  await db.schema
    .createIndex("idx_communities_slug")
    .ifNotExists()
    .on("communities")
    .column("slug")
    .execute();

  await db.schema
    .createIndex("idx_communities_owner")
    .ifNotExists()
    .on("communities")
    .column("owner_id")
    .execute();

  // ─── roles ────────────────────────────────────────────────────────────────
  await db.schema
    .createTable("roles")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("community_id", "text", (col) =>
      col.notNull().references("communities.id").onDelete("cascade")
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("color", "text")
    // Bitmask: 1=view_channels, 2=send_messages, 4=manage_channels,
    //          8=manage_members, 16=manage_roles, 32=admin
    .addColumn("permissions", "integer", (col) => col.notNull().defaultTo(3))
    .addColumn("position", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("is_default", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex("idx_roles_community")
    .ifNotExists()
    .on("roles")
    .column("community_id")
    .execute();

  // ─── community_members ────────────────────────────────────────────────────
  await db.schema
    .createTable("community_members")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("community_id", "text", (col) =>
      col.notNull().references("communities.id").onDelete("cascade")
    )
    .addColumn("user_id", "text", (col) => col.notNull().references("users.id").onDelete("cascade"))
    .addColumn("nickname", "text")
    .addColumn("joined_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`
    ALTER TABLE community_members
      ADD CONSTRAINT uq_community_members UNIQUE (community_id, user_id)
  `.execute(db);

  await db.schema
    .createIndex("idx_community_members_community")
    .ifNotExists()
    .on("community_members")
    .column("community_id")
    .execute();

  await db.schema
    .createIndex("idx_community_members_user")
    .ifNotExists()
    .on("community_members")
    .column("user_id")
    .execute();

  // ─── member_roles ─────────────────────────────────────────────────────────
  await db.schema
    .createTable("member_roles")
    .ifNotExists()
    .addColumn("member_id", "text", (col) =>
      col.notNull().references("community_members.id").onDelete("cascade")
    )
    .addColumn("role_id", "text", (col) => col.notNull().references("roles.id").onDelete("cascade"))
    .addPrimaryKeyConstraint("pk_member_roles", ["member_id", "role_id"])
    .execute();

  // ─── channels ─────────────────────────────────────────────────────────────
  await db.schema
    .createTable("channels")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("community_id", "text", (col) =>
      col.notNull().references("communities.id").onDelete("cascade")
    )
    .addColumn("parent_id", "text", (col) => col.references("channels.id").onDelete("set null"))
    // type: 'text' | 'voice' | 'announcement' | 'category'
    .addColumn("type", "text", (col) => col.notNull().defaultTo("text"))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("topic", "text")
    .addColumn("position", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("is_private", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("slowmode_seconds", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("last_message_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`
    CREATE OR REPLACE TRIGGER channels_updated_at
      BEFORE UPDATE ON channels
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);

  await db.schema
    .createIndex("idx_channels_community")
    .ifNotExists()
    .on("channels")
    .column("community_id")
    .execute();

  // ─── messages ─────────────────────────────────────────────────────────────
  await db.schema
    .createTable("messages")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("channel_id", "text", (col) =>
      col.notNull().references("channels.id").onDelete("cascade")
    )
    .addColumn("author_id", "text", (col) =>
      col.notNull().references("users.id").onDelete("set null")
    )
    .addColumn("reply_to_id", "text", (col) => col.references("messages.id").onDelete("set null"))
    .addColumn("content", "text")
    // type: 'default' | 'system' | 'ai'
    .addColumn("type", "text", (col) => col.notNull().defaultTo("default"))
    .addColumn("is_edited", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("is_pinned", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`
    CREATE OR REPLACE TRIGGER messages_updated_at
      BEFORE UPDATE ON messages
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);

  await db.schema
    .createIndex("idx_messages_channel")
    .ifNotExists()
    .on("messages")
    .column("channel_id")
    .execute();

  await db.schema
    .createIndex("idx_messages_author")
    .ifNotExists()
    .on("messages")
    .column("author_id")
    .execute();

  // ─── message_attachments ──────────────────────────────────────────────────
  await db.schema
    .createTable("message_attachments")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("message_id", "text", (col) =>
      col.notNull().references("messages.id").onDelete("cascade")
    )
    .addColumn("url", "text", (col) => col.notNull())
    .addColumn("filename", "text", (col) => col.notNull())
    // mime_type: e.g. 'image/png', 'application/pdf'
    .addColumn("mime_type", "text")
    .addColumn("size_bytes", "integer")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex("idx_message_attachments_message")
    .ifNotExists()
    .on("message_attachments")
    .column("message_id")
    .execute();

  // ─── workspaces ───────────────────────────────────────────────────────────
  await db.schema
    .createTable("workspaces")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("community_id", "text", (col) =>
      col.notNull().references("communities.id").onDelete("cascade")
    )
    .addColumn("created_by", "text", (col) =>
      col.notNull().references("users.id").onDelete("set null")
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("emoji", "text")
    .addColumn("description", "text")
    .addColumn("is_public", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`
    CREATE OR REPLACE TRIGGER workspaces_updated_at
      BEFORE UPDATE ON workspaces
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);

  await db.schema
    .createIndex("idx_workspaces_community")
    .ifNotExists()
    .on("workspaces")
    .column("community_id")
    .execute();

  // ─── workspace_pages ──────────────────────────────────────────────────────
  await db.schema
    .createTable("workspace_pages")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspaces.id").onDelete("cascade")
    )
    .addColumn("parent_id", "text", (col) =>
      col.references("workspace_pages.id").onDelete("set null")
    )
    .addColumn("created_by", "text", (col) =>
      col.notNull().references("users.id").onDelete("set null")
    )
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("emoji", "text")
    // content stored as Tiptap JSON (jsonb)
    .addColumn("content", "jsonb")
    .addColumn("position", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("is_published", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`
    CREATE OR REPLACE TRIGGER workspace_pages_updated_at
      BEFORE UPDATE ON workspace_pages
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);

  await db.schema
    .createIndex("idx_workspace_pages_workspace")
    .ifNotExists()
    .on("workspace_pages")
    .column("workspace_id")
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  // Drop in reverse dependency order
  await db.schema.dropTable("workspace_pages").ifExists().execute();
  await db.schema.dropTable("workspaces").ifExists().execute();
  await db.schema.dropTable("message_attachments").ifExists().execute();
  await db.schema.dropTable("messages").ifExists().execute();
  await db.schema.dropTable("channels").ifExists().execute();
  await db.schema.dropTable("member_roles").ifExists().execute();
  await db.schema.dropTable("community_members").ifExists().execute();
  await db.schema.dropTable("roles").ifExists().execute();
  await db.schema.dropTable("communities").ifExists().execute();
  await db.schema.dropTable("friend_requests").ifExists().execute();
  await db.schema.dropTable("refresh_sessions").ifExists().execute();
  await db.schema.dropTable("users").ifExists().execute();

  await sql`DROP FUNCTION IF EXISTS set_updated_at CASCADE`.execute(db);
}
