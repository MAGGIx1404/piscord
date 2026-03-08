import { type Kysely, sql } from "kysely";

/**
 * Migration: notification
 * Created:   2026-03-07T14:41:01.169Z
 *
 * Creates the `notifications` table with a polymorphic relation via
 * (entity_type, entity_id) so a single table can reference any domain
 * object (message, friend_request, community, channel, …) without
 * requiring a foreign-key per entity type.
 *
 * Notification types
 * ──────────────────
 *  friend_request    – actor sent the recipient a friend request
 *  friend_accepted   – actor accepted the recipient's friend request
 *  community_invite  – actor invited the recipient to a community
 *  community_join    – someone joined a community the recipient owns/manages
 *  mention           – recipient was @mentioned in a message
 *  channel_message   – new direct/channel message
 *  system            – platform-level announcement (actor_id is NULL)
 *
 * Polymorphic entity_type values
 * ───────────────────────────────
 *  'friend_request' → friend_requests.id
 *  'community'      → communities.id
 *  'channel'        → channels.id
 *  'message'        → messages.id
 *  (NULL)           → no linked entity
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  // ─── notifications ────────────────────────────────────────────────────────
  await db.schema
    .createTable("notifications")
    .ifNotExists()
    // Primary key
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    // Recipient
    .addColumn("user_id", "text", (col) => col.notNull().references("users.id").onDelete("cascade"))
    // Actor who triggered the notification (NULL for system notifications)
    .addColumn("actor_id", "text", (col) => col.references("users.id").onDelete("set null"))
    // Discriminator: 'friend_request' | 'friend_accepted' | 'community_invite'
    //               | 'community_join' | 'mention' | 'channel_message' | 'system'
    .addColumn("type", "text", (col) => col.notNull())
    // Polymorphic relation ─ entity_type names the table, entity_id is the PK
    .addColumn("entity_type", "text") // e.g. 'message' | 'community' | 'friend_request' | 'channel'
    .addColumn("entity_id", "text") // PK of the referenced row (no FK constraint – polymorphic)
    // Arbitrary extra payload (e.g. message preview, community name snapshot)
    .addColumn("data", sql`jsonb`, (col) => col.defaultTo(sql`'{}'::jsonb`))
    // NULL  → unread,  timestamptz → read
    .addColumn("read_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // ─── indexes ──────────────────────────────────────────────────────────────

  // Fast unread-count queries per user
  await db.schema
    .createIndex("idx_notifications_user_unread")
    .ifNotExists()
    .on("notifications")
    .columns(["user_id", "read_at"])
    .execute();

  // Paginated notifications feed per user (most-recent first)
  await db.schema
    .createIndex("idx_notifications_user_created")
    .ifNotExists()
    .on("notifications")
    .columns(["user_id", "created_at"])
    .execute();

  // Look up all notifications that reference a given polymorphic entity
  await db.schema
    .createIndex("idx_notifications_entity")
    .ifNotExists()
    .on("notifications")
    .columns(["entity_type", "entity_id"])
    .execute();

  // Quickly find notifications triggered by a specific actor
  await db.schema
    .createIndex("idx_notifications_actor")
    .ifNotExists()
    .on("notifications")
    .column("actor_id")
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("idx_notifications_actor").ifExists().execute();
  await db.schema.dropIndex("idx_notifications_entity").ifExists().execute();
  await db.schema.dropIndex("idx_notifications_user_created").ifExists().execute();
  await db.schema.dropIndex("idx_notifications_user_unread").ifExists().execute();
  await db.schema.dropTable("notifications").ifExists().execute();
}
