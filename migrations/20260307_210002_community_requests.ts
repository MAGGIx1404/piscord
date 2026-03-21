import type { Kysely } from "kysely";
import { sql } from "kysely";

/**
 * Migration: community_requests
 * Created:   2026-03-07T15:08:02.697Z
 *
 * Adds `community_join_requests` — the source of truth for all join requests
 * to communities that have `require_approval = true` or are private
 * (`is_public = false`).
 *
 * status: 'pending' | 'approved' | 'rejected' | 'cancelled'
 *   - pending   : awaiting review by a community admin / moderator
 *   - approved  : accepted; the user should be inserted into community_members
 *   - rejected  : denied by a reviewer
 *   - cancelled : withdrawn by the requester before a decision was made
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  // ─── community_join_requests ──────────────────────────────────────────────
  await db.schema
    .createTable("community_join_requests")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("community_id", "text", (col) =>
      col.notNull().references("communities.id").onDelete("cascade")
    )
    .addColumn("user_id", "text", (col) => col.notNull().references("users.id").onDelete("cascade"))
    // Optional message the requester attaches to their join request
    .addColumn("note", "text")
    // status: 'pending' | 'approved' | 'rejected' | 'cancelled'
    .addColumn("status", "text", (col) => col.notNull().defaultTo("pending"))
    // Who reviewed the request (admin / mod); null while pending or cancelled
    .addColumn("reviewed_by", "text", (col) => col.references("users.id").onDelete("set null"))
    // When the request was reviewed / actioned
    .addColumn("reviewed_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Auto-update updated_at on every row change
  await sql`
    CREATE OR REPLACE TRIGGER community_join_requests_updated_at
      BEFORE UPDATE ON community_join_requests
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);

  // Prevent duplicate active (pending) requests from the same user
  await sql`
    CREATE UNIQUE INDEX uq_community_join_requests_pending
      ON community_join_requests (community_id, user_id)
      WHERE status = 'pending'
  `.execute(db);

  // General lookup indexes
  await db.schema
    .createIndex("idx_community_join_requests_community")
    .ifNotExists()
    .on("community_join_requests")
    .column("community_id")
    .execute();

  await db.schema
    .createIndex("idx_community_join_requests_user")
    .ifNotExists()
    .on("community_join_requests")
    .column("user_id")
    .execute();

  await db.schema
    .createIndex("idx_community_join_requests_status")
    .ifNotExists()
    .on("community_join_requests")
    .column("status")
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("community_join_requests").ifExists().execute();
}
