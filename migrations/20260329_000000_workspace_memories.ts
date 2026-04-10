import type { Kysely } from "kysely";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("workspace_memories")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspaces.id").onDelete("cascade")
    )
    .addColumn("content", "text", (col) => col.notNull())
    .addColumn("type", "text", (col) => col.notNull().defaultTo("note"))
    .addColumn("created_by", "text", (col) => col.references("users.id").onDelete("set null"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(db.fn("now")))
    .execute();

  await db.schema
    .createIndex("idx_workspace_memories_workspace_id")
    .ifNotExists()
    .on("workspace_memories")
    .column("workspace_id")
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("workspace_memories").ifExists().execute();
}
