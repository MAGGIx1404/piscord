import type { Kysely } from "kysely";
import { sql } from "kysely";

/**
 * Migration: dm_conversations + dm_messages
 * Created:   2026-03-21
 *
 * Adds tables for direct message conversations between friends.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  // ─── dm_conversations ──────────────────────────────────────────────────
  await db.schema
    .createTable("dm_conversations")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(db.fn("gen_random_uuid")))
    .addColumn("user1_id", "text", (col) =>
      col.notNull().references("users.id").onDelete("cascade")
    )
    .addColumn("user2_id", "text", (col) =>
      col.notNull().references("users.id").onDelete("cascade")
    )
    .addColumn("last_message_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(db.fn("now")))
    .execute();

  // Unique constraint: one conversation per user pair (canonical order)
  await db.schema
    .createIndex("dm_conversations_unique_pair")
    .on("dm_conversations")
    .columns(["user1_id", "user2_id"])
    .unique()
    .execute();

  await db.schema
    .createIndex("idx_dm_conversations_user1")
    .on("dm_conversations")
    .column("user1_id")
    .execute();

  await db.schema
    .createIndex("idx_dm_conversations_user2")
    .on("dm_conversations")
    .column("user2_id")
    .execute();

  // ─── dm_messages ────────────────────────────────────────────────────────
  await db.schema
    .createTable("dm_messages")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(db.fn("gen_random_uuid")))
    .addColumn("conversation_id", "text", (col) =>
      col.notNull().references("dm_conversations.id").onDelete("cascade")
    )
    .addColumn("sender_id", "text", (col) =>
      col.notNull().references("users.id").onDelete("cascade")
    )
    .addColumn("content", "text", (col) => col.notNull())
    .addColumn("is_edited", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(db.fn("now")))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(db.fn("now")))
    .execute();

  await sql`
    CREATE OR REPLACE TRIGGER dm_messages_updated_at
      BEFORE UPDATE ON dm_messages
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);

  await db.schema
    .createIndex("idx_dm_messages_conversation")
    .on("dm_messages")
    .column("conversation_id")
    .execute();

  await db.schema
    .createIndex("idx_dm_messages_sender")
    .on("dm_messages")
    .column("sender_id")
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("dm_messages").ifExists().execute();
  await db.schema.dropTable("dm_conversations").ifExists().execute();
}
