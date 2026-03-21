import type { Kysely } from "kysely";

/**
 * Migration: reactions
 * Created:   2026-03-19
 *
 * Adds reactions table for emoji reactions on messages.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("reactions")
    .ifNotExists()
    .addColumn("id", "text", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid"))
    )
    .addColumn("message_id", "text", (col) =>
      col.notNull().references("messages.id").onDelete("cascade")
    )
    .addColumn("user_id", "text", (col) =>
      col.notNull().references("users.id").onDelete("cascade")
    )
    .addColumn("emoji", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .execute();

  // Unique constraint: one reaction per user per emoji per message
  await db.schema
    .createIndex("reactions_unique_user_emoji_message")
    .on("reactions")
    .columns(["message_id", "user_id", "emoji"])
    .unique()
    .execute();

  // Index for fast lookup by message
  await db.schema
    .createIndex("reactions_message_id_idx")
    .on("reactions")
    .column("message_id")
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("reactions").ifExists().execute();
}
