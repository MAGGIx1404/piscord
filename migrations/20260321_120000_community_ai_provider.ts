import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("communities")
    .addColumn("ai_provider", "text", (col) => col.notNull().defaultTo("puter"))
    .execute();

  await db.schema.alterTable("communities").addColumn("ai_ollama_model", "text").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("communities").dropColumn("ai_ollama_model").execute();
  await db.schema.alterTable("communities").dropColumn("ai_provider").execute();
}
