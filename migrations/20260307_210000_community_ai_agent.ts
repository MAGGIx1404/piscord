import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("communities")
    .addColumn("is_ai_pet", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();

  await db.schema.alterTable("communities").addColumn("ai_agent_name", "text").execute();

  await db.schema.alterTable("communities").addColumn("ai_agent_pet_name", "text").execute();

  await db.schema.alterTable("communities").addColumn("ai_agent_avatar", "text").execute();

  await db.schema.alterTable("communities").addColumn("ai_agent_model", "text").execute();

  await db.schema.alterTable("communities").addColumn("ai_agent_description", "text").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("communities").dropColumn("ai_agent_description").execute();
  await db.schema.alterTable("communities").dropColumn("ai_agent_model").execute();
  await db.schema.alterTable("communities").dropColumn("ai_agent_avatar").execute();
  await db.schema.alterTable("communities").dropColumn("ai_agent_pet_name").execute();
  await db.schema.alterTable("communities").dropColumn("ai_agent_name").execute();
  await db.schema.alterTable("communities").dropColumn("is_ai_pet").execute();
}
