/**
 * scripts/create-migration.ts
 *
 * Scaffolds a new timestamped migration file in the migrations/ folder.
 *
 * Usage:
 *   npm run create-migration -- <migration_name>
 *
 * Example:
 *   npm run create-migration -- add_communities_table
 *   → creates: migrations/20260307_153045_add_communities_table.ts
 */

import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

// ─── Args ─────────────────────────────────────────────────────────────────────

const name = process.argv[2];

if (!name) {
  console.error("❌  Please provide a migration name.");
  console.error("    Usage: npm run create-migration -- <migration_name>");
  process.exit(1);
}

if (!/^[a-z0-9_]+$/i.test(name)) {
  console.error("❌  Migration name may only contain letters, numbers, and underscores.");
  process.exit(1);
}

// ─── Timestamp ────────────────────────────────────────────────────────────────

function timestamp(): string {
  const now = new Date();
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");

  const Y = now.getFullYear();
  const M = pad(now.getMonth() + 1);
  const D = pad(now.getDate());
  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());

  return `${Y}${M}${D}_${h}${m}${s}`;
}

// ─── Template ─────────────────────────────────────────────────────────────────

const template = `import type { Kysely } from "kysely";

/**
 * Migration: ${name}
 * Created:   ${new Date().toISOString()}
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  // TODO: implement migration
  await db.schema
    // .createTable("example")
    // .addColumn("id", "text", (col) => col.primaryKey())
    // ...
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  // TODO: implement rollback
  // await db.schema.dropTable("example").execute();
}
`;

// ─── Write ────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, "../migrations");
const filename = `${timestamp()}_${name}.ts`;
const outPath = path.join(migrationsDir, filename);

await fs.mkdir(migrationsDir, { recursive: true });
await fs.writeFile(outPath, template, "utf-8");

console.log(`✅  Created migration: migrations/${filename}`);
