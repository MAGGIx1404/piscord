import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Add extended columns to communities
  await db.schema.alterTable("communities").addColumn("category", "text").execute();

  await db.schema
    .alterTable("communities")
    .addColumn("tags", sql`text[]`, (col) => col.defaultTo(sql`'{}'::text[]`))
    .execute();

  await db.schema
    .alterTable("communities")
    .addColumn("require_approval", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();

  // Index for category lookups
  await db.schema
    .createIndex("idx_communities_category")
    .ifNotExists()
    .on("communities")
    .column("category")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("idx_communities_category").ifExists().execute();

  await db.schema.alterTable("communities").dropColumn("require_approval").execute();
  await db.schema.alterTable("communities").dropColumn("tags").execute();
  await db.schema.alterTable("communities").dropColumn("category").execute();
}
