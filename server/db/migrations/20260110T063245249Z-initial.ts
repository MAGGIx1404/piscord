import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);
  await sql`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`.execute(db);

  await sql`CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';`.execute(db);

  await sql`CREATE TYPE user_status AS ENUM('online', 'offline', 'away', 'sleep')`.execute(db);
  await sql`CREATE TYPE community_type AS ENUM('public', 'private')`.execute(db);
  await sql`CREATE TYPE community_tier AS ENUM('free', 'premium', 'enterprise')`.execute(db);
  await sql`CREATE TYPE member_role AS ENUM('owner', 'admin', 'moderator', 'member', 'guest')`.execute(
    db
  );
  await sql`CREATE TYPE friendship_status AS ENUM('pending', 'accepted', 'blocked', 'removed')`.execute(
    db
  );
  await sql`CREATE TYPE notification_type AS ENUM('friend_request', 'friend_accepted', 'community_invite', 'join_community_request', 'community_joined', 'message_mention', 'message_reply', 'message_reaction', 'channel_mention', 'badge_earned', 'document_comment', 'document_shared')`.execute(
    db
  );
  await sql`CREATE TYPE community_category AS ENUM('gaming', 'tech', 'study', 'art', 'music', 'fun', 'business', 'entertainment', 'lifestyle', 'education')`.execute(
    db
  );

  await db.schema
    .createTable("users")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("username", "varchar(30)", (col) => col.unique().notNull())
    .addColumn("email", "text", (col) => col.unique().notNull())
    .addColumn("password", "text", (col) => col.notNull())
    .addColumn("first_name", "varchar(50)", (col) => col.notNull())
    .addColumn("last_name", "varchar(50)", (col) => col.notNull())
    .addColumn("about", "varchar(500)")
    .addColumn("avatar_url", "text")
    .addColumn("cover_url", "text")
    .addColumn("birthdate", "date")
    .addColumn("url", "text")
    .addColumn("is_premium", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("status", sql`user_status`, (col) => col.notNull().defaultTo("offline"))
    .addColumn("status_message", "varchar(100)")
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("email_verified", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("email_verified_at", "timestamptz")
    .addColumn("last_seen_at", "timestamptz")
    .addColumn("total_friends", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_messages", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_communities", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("badges")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "varchar(30)", (col) => col.notNull())
    .addColumn("description", "varchar(200)")
    .addColumn("icon_url", "text")
    .addColumn("color", "varchar(7)")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("communities")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .addColumn("slug", "varchar(100)", (col) => col.unique().notNull())
    .addColumn("description", "text")
    .addColumn("logo_url", "text")
    .addColumn("cover_url", "text")
    .addColumn("is_verified", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("type", sql`community_type`, (col) => col.notNull().defaultTo("public"))
    .addColumn("tier", sql`community_tier`, (col) => col.notNull().defaultTo("free"))
    .addColumn("url", "text")
    .addColumn("location", "varchar(255)")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("tags")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "varchar(50)", (col) => col.unique().notNull())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("sessions")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("user_id", "text", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("token", "text", (col) => col.unique().notNull())
    .addColumn("expires_at", "timestamptz")
    .addColumn("ip_address", "text")
    .addColumn("user_agent", "text")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("user_badges")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("user_id", "text", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("badge_id", "text", (col) =>
      col.references("badges.id").onDelete("cascade").notNull()
    )
    .addColumn("earned_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("user_badges_user_badge_unique", ["user_id", "badge_id"])
    .execute();

  await db.schema
    .createTable("friendships")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("requester_id", "text", (col) =>
      col.references("users.id").onDelete("cascade").notNull()
    )
    .addColumn("addressee_id", "text", (col) =>
      col.references("users.id").onDelete("cascade").notNull()
    )
    .addColumn("status", sql`friendship_status`, (col) => col.notNull().defaultTo("pending"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addCheckConstraint("friendships_different_users", sql`requester_id != addressee_id`)
    .addUniqueConstraint("friendships_requester_addressee_unique", ["requester_id", "addressee_id"])
    .execute();

  await db.schema
    .createTable("community_tags")
    .addColumn("community_id", "text", (col) =>
      col.references("communities.id").onDelete("cascade").notNull()
    )
    .addColumn("tag_id", "text", (col) => col.references("tags.id").onDelete("cascade").notNull())
    .addPrimaryKeyConstraint("community_tags_pk", ["community_id", "tag_id"])
    .execute();

  await db.schema
    .createTable("community_rules")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("community_id", "text", (col) =>
      col.references("communities.id").onDelete("cascade").notNull()
    )
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("sort_order", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("community_members")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("community_id", "text", (col) =>
      col.references("communities.id").onDelete("cascade").notNull()
    )
    .addColumn("user_id", "text", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("role", sql`member_role`, (col) => col.notNull().defaultTo("member"))
    .addColumn("nickname", "varchar(100)")
    .addColumn("joined_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("community_members_community_user_unique", ["community_id", "user_id"])
    .execute();

  await db.schema
    .createTable("community_invites")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("community_id", "text", (col) =>
      col.references("communities.id").onDelete("cascade").notNull()
    )
    .addColumn("code", "varchar(20)", (col) => col.unique().notNull())
    .addColumn("created_by", "text", (col) =>
      col.references("users.id").onDelete("cascade").notNull()
    )
    .addColumn("max_uses", "integer")
    .addColumn("current_uses", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("expires_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("channels")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("community_id", "text", (col) =>
      col.references("communities.id").onDelete("cascade").notNull()
    )
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .addColumn("slug", "varchar(100)", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("is_private", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("sort_order", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_messages", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("channels_community_slug_unique", ["community_id", "slug"])
    .execute();

  await db.schema
    .createTable("channel_permissions")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("channel_id", "text", (col) =>
      col.references("channels.id").onDelete("cascade").notNull()
    )
    .addColumn("user_id", "text", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("can_view", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("can_send", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("can_manage", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("granted_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("channel_permissions_channel_user_unique", ["channel_id", "user_id"])
    .execute();

  await db.schema
    .createTable("emojis")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("community_id", "text", (col) =>
      col.references("communities.id").onDelete("cascade")
    )
    .addColumn("name", "varchar(50)", (col) => col.notNull())
    .addColumn("code", "varchar(50)", (col) => col.notNull())
    .addColumn("image_url", "text")
    .addColumn("unicode", "varchar(20)")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("emojis_community_code_unique", ["community_id", "code"])
    .execute();

  await db.schema
    .createTable("messages")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("channel_id", "text", (col) =>
      col.references("channels.id").onDelete("cascade").notNull()
    )
    .addColumn("author_id", "text", (col) =>
      col.references("users.id").onDelete("cascade").notNull()
    )
    .addColumn("content", "text", (col) => col.notNull())
    .addColumn("reply_to_id", "text", (col) => col.references("messages.id").onDelete("set null"))
    .addColumn("is_pinned", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("is_edited", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("is_deleted", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("pinned_by", "text", (col) => col.references("users.id").onDelete("set null"))
    .addColumn("pinned_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("message_reactions")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("message_id", "text", (col) =>
      col.references("messages.id").onDelete("cascade").notNull()
    )
    .addColumn("user_id", "text", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("emoji_id", "text", (col) =>
      col.references("emojis.id").onDelete("cascade").notNull()
    )
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("message_reactions_message_user_emoji_unique", [
      "message_id",
      "user_id",
      "emoji_id"
    ])
    .execute();

  await db.schema
    .createTable("message_mentions")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("message_id", "text", (col) =>
      col.references("messages.id").onDelete("cascade").notNull()
    )
    .addColumn("mentioned_user_id", "text", (col) =>
      col.references("users.id").onDelete("cascade").notNull()
    )
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("message_mentions_message_user_unique", [
      "message_id",
      "mentioned_user_id"
    ])
    .execute();

  await db.schema
    .createTable("workspaces")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("community_id", "text", (col) =>
      col.references("communities.id").onDelete("cascade").notNull()
    )
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("icon_url", "text")
    .addColumn("created_by", "text", (col) =>
      col.references("users.id").onDelete("cascade").notNull()
    )
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("folders")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("workspace_id", "text", (col) =>
      col.references("workspaces.id").onDelete("cascade").notNull()
    )
    .addColumn("parent_folder_id", "text", (col) =>
      col.references("folders.id").onDelete("cascade")
    )
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .addColumn("icon_url", "text")
    .addColumn("sort_order", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("created_by", "text", (col) =>
      col.references("users.id").onDelete("cascade").notNull()
    )
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("documents")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("folder_id", "text", (col) =>
      col.references("folders.id").onDelete("cascade").notNull()
    )
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("content", "text")
    .addColumn("is_public", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("total_collaborators", "integer", (col) => col.notNull().defaultTo(1))
    .addColumn("total_views", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_comments", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_words", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("created_by", "text", (col) =>
      col.references("users.id").onDelete("cascade").notNull()
    )
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("document_collaborators")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("document_id", "text", (col) =>
      col.references("documents.id").onDelete("cascade").notNull()
    )
    .addColumn("user_id", "text", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("can_edit", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("added_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("document_collaborators_document_user_unique", ["document_id", "user_id"])
    .execute();

  await db.schema
    .createTable("document_views")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("document_id", "text", (col) =>
      col.references("documents.id").onDelete("cascade").notNull()
    )
    .addColumn("user_id", "text", (col) => col.references("users.id").onDelete("set null"))
    .addColumn("ip_address", sql`inet`)
    .addColumn("viewed_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("document_comments")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("document_id", "text", (col) =>
      col.references("documents.id").onDelete("cascade").notNull()
    )
    .addColumn("author_id", "text", (col) =>
      col.references("users.id").onDelete("cascade").notNull()
    )
    .addColumn("parent_comment_id", "text", (col) =>
      col.references("document_comments.id").onDelete("cascade")
    )
    .addColumn("content", "text", (col) => col.notNull())
    .addColumn("is_resolved", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("position_start", "integer")
    .addColumn("position_end", "integer")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("notifications")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("user_id", "text", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("type", sql`notification_type`, (col) => col.notNull())
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("body", "text")
    .addColumn("reference_type", "varchar(50)")
    .addColumn("reference_id", "text")
    .addColumn("actor_id", "text", (col) => col.references("users.id").onDelete("set null"))
    .addColumn("is_read", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("read_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("audit_logs")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("community_id", "text", (col) =>
      col.references("communities.id").onDelete("cascade")
    )
    .addColumn("actor_id", "text", (col) => col.references("users.id").onDelete("set null"))
    .addColumn("action", "varchar(100)", (col) => col.notNull())
    .addColumn("entity_type", "varchar(50)", (col) => col.notNull())
    .addColumn("entity_id", "text")
    .addColumn("old_values", "jsonb")
    .addColumn("new_values", "jsonb")
    .addColumn("ip_address", sql`inet`)
    .addColumn("user_agent", "text")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Indexes

  await db.schema.createIndex("idx_users_username").on("users").column("username").execute();
  await db.schema.createIndex("idx_users_email").on("users").column("email").execute();
  await db.schema.createIndex("idx_user_badges_user").on("user_badges").column("user_id").execute();
  await db.schema
    .createIndex("idx_friendships_requester")
    .on("friendships")
    .column("requester_id")
    .execute();
  await db.schema
    .createIndex("idx_friendships_addressee")
    .on("friendships")
    .column("addressee_id")
    .execute();
  await db.schema
    .createIndex("idx_friendships_status")
    .on("friendships")
    .column("status")
    .execute();
  await db.schema.createIndex("idx_communities_slug").on("communities").column("slug").execute();
  await db.schema.createIndex("idx_communities_type").on("communities").column("type").execute();
  await db.schema
    .createIndex("idx_community_tags_tag")
    .on("community_tags")
    .column("tag_id")
    .execute();
  await db.schema
    .createIndex("idx_community_rules_community")
    .on("community_rules")
    .column("community_id")
    .execute();
  await db.schema
    .createIndex("idx_community_members_community")
    .on("community_members")
    .column("community_id")
    .execute();
  await db.schema
    .createIndex("idx_community_members_user")
    .on("community_members")
    .column("user_id")
    .execute();
  await db.schema
    .createIndex("idx_community_members_role")
    .on("community_members")
    .column("role")
    .execute();
  await db.schema
    .createIndex("idx_channels_community")
    .on("channels")
    .column("community_id")
    .execute();
  await db.schema
    .createIndex("idx_channel_permissions_channel")
    .on("channel_permissions")
    .column("channel_id")
    .execute();
  await db.schema
    .createIndex("idx_channel_permissions_user")
    .on("channel_permissions")
    .column("user_id")
    .execute();
  await db.schema.createIndex("idx_emojis_community").on("emojis").column("community_id").execute();
  await db.schema.createIndex("idx_emojis_code").on("emojis").column("code").execute();
  await db.schema.createIndex("idx_messages_channel").on("messages").column("channel_id").execute();
  await db.schema.createIndex("idx_messages_author").on("messages").column("author_id").execute();
  await db.schema
    .createIndex("idx_messages_reply_to")
    .on("messages")
    .column("reply_to_id")
    .execute();
  await db.schema
    .createIndex("idx_message_reactions_message")
    .on("message_reactions")
    .column("message_id")
    .execute();
  await db.schema
    .createIndex("idx_message_reactions_user")
    .on("message_reactions")
    .column("user_id")
    .execute();
  await db.schema
    .createIndex("idx_message_mentions_message")
    .on("message_mentions")
    .column("message_id")
    .execute();
  await db.schema
    .createIndex("idx_message_mentions_user")
    .on("message_mentions")
    .column("mentioned_user_id")
    .execute();
  await db.schema
    .createIndex("idx_workspaces_community")
    .on("workspaces")
    .column("community_id")
    .execute();
  await db.schema
    .createIndex("idx_folders_workspace")
    .on("folders")
    .column("workspace_id")
    .execute();
  await db.schema
    .createIndex("idx_folders_parent")
    .on("folders")
    .column("parent_folder_id")
    .execute();
  await db.schema.createIndex("idx_documents_folder").on("documents").column("folder_id").execute();
  await db.schema
    .createIndex("idx_documents_created_by")
    .on("documents")
    .column("created_by")
    .execute();
  await db.schema
    .createIndex("idx_document_collaborators_document")
    .on("document_collaborators")
    .column("document_id")
    .execute();
  await db.schema
    .createIndex("idx_document_collaborators_user")
    .on("document_collaborators")
    .column("user_id")
    .execute();
  await db.schema
    .createIndex("idx_document_views_document")
    .on("document_views")
    .column("document_id")
    .execute();
  await db.schema
    .createIndex("idx_document_views_user")
    .on("document_views")
    .column("user_id")
    .execute();
  await db.schema
    .createIndex("idx_document_comments_document")
    .on("document_comments")
    .column("document_id")
    .execute();
  await db.schema
    .createIndex("idx_document_comments_author")
    .on("document_comments")
    .column("author_id")
    .execute();
  await db.schema
    .createIndex("idx_document_comments_parent")
    .on("document_comments")
    .column("parent_comment_id")
    .execute();
  await db.schema
    .createIndex("idx_notifications_user")
    .on("notifications")
    .column("user_id")
    .execute();
  await db.schema
    .createIndex("idx_community_invites_community")
    .on("community_invites")
    .column("community_id")
    .execute();
  await db.schema
    .createIndex("idx_community_invites_code")
    .on("community_invites")
    .column("code")
    .execute();
  await db.schema
    .createIndex("idx_audit_logs_community")
    .on("audit_logs")
    .column("community_id")
    .execute();
  await db.schema.createIndex("idx_audit_logs_actor").on("audit_logs").column("actor_id").execute();
  await db.schema.createIndex("idx_sessions_user").on("sessions").column("user_id").execute();

  await sql`CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`.execute(
    db
  );
  await sql`CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`.execute(
    db
  );
  await sql`CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`.execute(
    db
  );
  await sql`CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`.execute(
    db
  );
  await sql`CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`.execute(
    db
  );
  await sql`CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`.execute(
    db
  );
  await sql`CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`.execute(
    db
  );
  await sql`CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`.execute(
    db
  );
  await sql`CREATE TRIGGER update_community_rules_updated_at BEFORE UPDATE ON community_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`.execute(
    db
  );
  await sql`CREATE TRIGGER update_document_comments_updated_at BEFORE UPDATE ON document_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`.execute(
    db
  );
  await sql`CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`.execute(
    db
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  const tables = [
    "audit_logs",
    "notifications",
    "document_comments",
    "document_views",
    "document_collaborators",
    "documents",
    "folders",
    "workspaces",
    "message_mentions",
    "message_reactions",
    "messages",
    "emojis",
    "channel_permissions",
    "channels",
    "community_invites",
    "community_members",
    "community_rules",
    "community_tags",
    "friendships",
    "user_badges",
    "tags",
    "communities",
    "badges",
    "users",
    "sessions"
  ];

  for (const table of tables) {
    await db.schema.dropTable(table).ifExists().execute();
  }

  await sql`DROP TYPE IF EXISTS community_category`.execute(db);
  await sql`DROP TYPE IF EXISTS notification_type`.execute(db);
  await sql`DROP TYPE IF EXISTS friendship_status`.execute(db);
  await sql`DROP TYPE IF EXISTS member_role`.execute(db);
  await sql`DROP TYPE IF EXISTS community_tier`.execute(db);
  await sql`DROP TYPE IF EXISTS community_type`.execute(db);
  await sql`DROP TYPE IF EXISTS user_status`.execute(db);

  await sql`DROP FUNCTION IF EXISTS update_updated_at_column`.execute(db);
}
