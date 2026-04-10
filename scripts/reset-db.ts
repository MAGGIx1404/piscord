import "dotenv/config";
import { sql } from "kysely";
import { db } from "../server/db/index.js";

async function main() {
  console.log("Resetting database — removing all data...\n");

  await sql`
    TRUNCATE TABLE
      workspace_memories,
      prompt_run_results,
      prompt_runs,
      node_messages,
      ai_nodes,
      dm_messages,
      dm_conversations,
      friend_requests,
      reactions,
      message_attachments,
      messages,
      notifications,
      community_join_requests,
      member_roles,
      workspaces,
      channels,
      community_members,
      roles,
      communities,
      refresh_sessions,
      users
    RESTART IDENTITY CASCADE
  `.execute(db);

  console.log("All tables truncated. Database is clean.\n");
}

main()
  .catch((err) => {
    console.error("Reset failed:", err);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
