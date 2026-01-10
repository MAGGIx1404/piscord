import { ColumnType } from "kysely";

export const tableName = "audit_logs";

export interface AuditLog {
  id: string;
  community_id: string | null;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: AuditLog };
