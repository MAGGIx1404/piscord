import { type Kysely } from "kysely";

// Stub migration — original workspace_content migration was removed
// but was already applied to the database. This prevents Kysely from
// complaining about a missing migration file.
export async function up(_db: Kysely<unknown>): Promise<void> {}
export async function down(_db: Kysely<unknown>): Promise<void> {}
