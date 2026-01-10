import * as path from "path";
import { promises as fs } from "fs";
import { Migrator, FileMigrationProvider, sql, PostgresDialect, Kysely } from "kysely";
import dotenv from "dotenv";
import { Pool } from "pg";
import { Database } from "../server/db/tables";

dotenv.config();

const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PORT = process.env.DB_PORT;
const DB_PASSWORD = process.env.DB_PASSWORD;

if (!DB_NAME || !DB_HOST || !DB_USER || !DB_PORT || !DB_PASSWORD) {
  throw new Error("Database environment variables are not set");
}

const __filename = new URL("", import.meta.url).pathname;
const __dirname = path.dirname(__filename);

async function migrateToLatest() {
  const pool = new Pool({
    database: DB_NAME,
    host: DB_HOST,
    user: DB_USER,
    port: Number(DB_PORT),
    password: DB_PASSWORD
  });

  const dialect = new PostgresDialect({ pool });
  const db = new Kysely<Database>({ dialect });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "../", "server", "db", "migrations")
    })
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
