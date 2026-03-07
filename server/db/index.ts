import { Database } from "./tables";
import { PostgresDialect, Kysely } from "kysely";
import { Pool } from "pg";
import { createId } from "@paralleldrive/cuid2";

const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PORT = process.env.DB_PORT;
const DB_PASSWORD = process.env.DB_PASSWORD;
const MAX_POOL_SIZE = process.env.DB_MAX_POOL_SIZE || "10";

if (!DB_NAME || !DB_HOST || !DB_USER || !DB_PORT || !DB_PASSWORD) {
  throw new Error("Database environment variables are not set");
}

const pool = new Pool({
  database: DB_NAME,
  host: DB_HOST,
  user: DB_USER,
  port: Number(DB_PORT),
  password: DB_PASSWORD,
  max: Number(MAX_POOL_SIZE)
});

const dialect = new PostgresDialect({ pool });
export const db = new Kysely<Database>({ dialect });

export function generateId() {
  return createId();
}
