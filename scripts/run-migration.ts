/**
 * scripts/run-migration.ts
 *
 * Runs all pending Kysely migrations in the migrations/ folder.
 *
 * Usage:
 *   npm run db:migrate
 *   npm run db:migrate -- --down        # rolls back the last migration
 *   npm run db:migrate -- --down --all  # rolls back all applied migrations
 */

import "dotenv/config";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Kysely, PostgresDialect, Migrator, type Migration } from "kysely";
import { Pool } from "pg";
import type { Database } from "../server/db/tables/index.js";

// ─── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDown = args.includes("--down");
const isDownAll = isDown && args.includes("--all");

// ─── DB connection ────────────────────────────────────────────────────────────

const { DB_NAME, DB_HOST, DB_USER, DB_PORT, DB_PASSWORD, DB_MAX_POOL_SIZE } = process.env;

if (!DB_NAME || !DB_HOST || !DB_USER || !DB_PORT || !DB_PASSWORD) {
  console.error(
    "❌  Missing required DB environment variables (DB_NAME, DB_HOST, DB_USER, DB_PORT, DB_PASSWORD)"
  );
  process.exit(1);
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: DB_NAME,
      host: DB_HOST,
      user: DB_USER,
      port: Number(DB_PORT),
      password: DB_PASSWORD,
      max: Number(DB_MAX_POOL_SIZE ?? "5")
    })
  })
});

// ─── Migrator ─────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, "../migrations");

class WindowsSafeFileMigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const files = await fs.readdir(migrationsDir);

    for (const fileName of files) {
      if (
        !fileName.endsWith(".js") &&
        !(fileName.endsWith(".ts") && !fileName.endsWith(".d.ts")) &&
        !fileName.endsWith(".mjs") &&
        !(fileName.endsWith(".mts") && !fileName.endsWith(".d.mts"))
      ) {
        continue;
      }

      const fullPath = path.join(migrationsDir, fileName);
      const migrationModule = await import(pathToFileURL(fullPath).href);
      const migrationKey = fileName.substring(0, fileName.lastIndexOf("."));

      if (isMigration(migrationModule?.default)) {
        migrations[migrationKey] = migrationModule.default;
      } else if (isMigration(migrationModule)) {
        migrations[migrationKey] = migrationModule;
      }
    }

    return migrations;
  }
}

/**
 * Determine whether a value is a `Migration` by checking for the migration shape.
 *
 * @param value - The value to test for the `Migration` shape
 * @returns `true` if `value` has the properties required of a `Migration` (e.g., an `up` field), `false` otherwise.
 */
function isMigration(value: unknown): value is Migration {
  return typeof value === "object" && value !== null && "up" in value;
}

const migrator = new Migrator({
  db,
  provider: new WindowsSafeFileMigrationProvider()
});

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  let results: Awaited<ReturnType<typeof migrator.migrateToLatest>>["results"];
  let error: unknown;

  if (isDownAll) {
    console.log("⏪  Rolling back ALL migrations…");
    ({ results, error } = await migrator.migrateDown());
    // Keep rolling back until nothing left
    while (results?.length) {
      ({ results, error } = await migrator.migrateDown());
    }
  } else if (isDown) {
    console.log("⏪  Rolling back last migration…");
    ({ results, error } = await migrator.migrateDown());
  } else {
    console.log("⏩  Running pending migrations…");
    ({ results, error } = await migrator.migrateToLatest());
  }

  results?.forEach((r) => {
    const direction = r.direction === "Up" ? "⬆" : "⬇";
    const status = r.status === "Success" ? "✅" : "❌";
    console.log(`  ${status} ${direction}  ${r.migrationName}`);
  });

  if (!results?.length) {
    console.log("  ℹ️  No migrations to run.");
  }

  if (error) {
    console.error("\n❌  Migration failed:", error);
    await db.destroy();
    process.exit(1);
  }

  console.log("\n✅  Done.");
  await db.destroy();
}

main();
