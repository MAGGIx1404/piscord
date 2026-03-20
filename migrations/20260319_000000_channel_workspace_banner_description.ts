import type { Kysely } from "kysely";

/**
 * Migration: channel_workspace_banner_description
 * Created:   2026-03-19
 *
 * Adds banner_url and description to channels,
 * and banner_url to workspaces.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("channels").addColumn("banner_url", "text").execute();

  await db.schema.alterTable("channels").addColumn("description", "text").execute();

  await db.schema.alterTable("workspaces").addColumn("banner_url", "text").execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("channels").dropColumn("banner_url").execute();

  await db.schema.alterTable("channels").dropColumn("description").execute();

  await db.schema.alterTable("workspaces").dropColumn("banner_url").execute();
}
