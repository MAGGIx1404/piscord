import type { Kysely } from "kysely";

/**
 * Migration: join_request_notified_at
 * Created:   2026-03-08T00:00:00.000Z
 *
 * Adds `notified_at` to `community_join_requests` so the frontend can track
 * whether the user has seen an actioned (approved / rejected) request.
 * While NULL the request contributes to the bell-badge unread count.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("community_join_requests")
    .addColumn("notified_at", "timestamptz")
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("community_join_requests").dropColumn("notified_at").execute();
}
