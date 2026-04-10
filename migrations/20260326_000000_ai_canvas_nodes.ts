import type { Kysely } from "kysely";
import { sql } from "kysely";

/**
 * Migration: AI canvas nodes for workspace
 * Created:   2026-03-26
 *
 * Adds tables for AI node-based canvas: ai_nodes, node_messages,
 * prompt_runs, and prompt_run_results.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  // ─── ai_nodes ───────────────────────────────────────────────────────────
  await db.schema
    .createTable("ai_nodes")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(db.fn("gen_random_uuid")))
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspaces.id").onDelete("cascade")
    )
    .addColumn("model", "text", (col) => col.notNull())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("position_x", "real", (col) => col.notNull().defaultTo(0))
    .addColumn("position_y", "real", (col) => col.notNull().defaultTo(0))
    .addColumn("config", "jsonb", (col) => col.notNull().defaultTo("{}"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(db.fn("now")))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(db.fn("now")))
    .execute();

  await sql`
    CREATE OR REPLACE TRIGGER ai_nodes_updated_at
      BEFORE UPDATE ON ai_nodes
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);

  await db.schema
    .createIndex("idx_ai_nodes_workspace")
    .on("ai_nodes")
    .column("workspace_id")
    .execute();

  // ─── node_messages ──────────────────────────────────────────────────────
  await db.schema
    .createTable("node_messages")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(db.fn("gen_random_uuid")))
    .addColumn("node_id", "text", (col) =>
      col.notNull().references("ai_nodes.id").onDelete("cascade")
    )
    .addColumn("role", "text", (col) => col.notNull())
    .addColumn("content", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(db.fn("now")))
    .execute();

  await db.schema
    .createIndex("idx_node_messages_node")
    .on("node_messages")
    .column("node_id")
    .execute();

  // ─── prompt_runs ────────────────────────────────────────────────────────
  await db.schema
    .createTable("prompt_runs")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(db.fn("gen_random_uuid")))
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspaces.id").onDelete("cascade")
    )
    .addColumn("prompt", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull().defaultTo("pending"))
    .addColumn("created_by", "text", (col) =>
      col.notNull().references("users.id").onDelete("set null")
    )
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(db.fn("now")))
    .execute();

  await db.schema
    .createIndex("idx_prompt_runs_workspace")
    .on("prompt_runs")
    .column("workspace_id")
    .execute();

  // ─── prompt_run_results ─────────────────────────────────────────────────
  await db.schema
    .createTable("prompt_run_results")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(db.fn("gen_random_uuid")))
    .addColumn("prompt_run_id", "text", (col) =>
      col.notNull().references("prompt_runs.id").onDelete("cascade")
    )
    .addColumn("node_id", "text", (col) =>
      col.notNull().references("ai_nodes.id").onDelete("cascade")
    )
    .addColumn("response", "text")
    .addColumn("status", "text", (col) => col.notNull().defaultTo("pending"))
    .addColumn("latency_ms", "integer")
    .addColumn("error", "text")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(db.fn("now")))
    .execute();

  await db.schema
    .createIndex("idx_prompt_run_results_run")
    .on("prompt_run_results")
    .column("prompt_run_id")
    .execute();

  await db.schema
    .createIndex("idx_prompt_run_results_node")
    .on("prompt_run_results")
    .column("node_id")
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("prompt_run_results").ifExists().execute();
  await db.schema.dropTable("prompt_runs").ifExists().execute();
  await db.schema.dropTable("node_messages").ifExists().execute();
  await db.schema.dropTable("ai_nodes").ifExists().execute();
}
