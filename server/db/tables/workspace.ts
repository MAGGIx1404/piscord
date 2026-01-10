import { ColumnType } from "kysely";

export const tableName = "workspaces";

export interface Workspace {
  id: string;
  community_id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  created_by: string;
  created_at: ColumnType<Date, string | null, never>;
  updated_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: Workspace };
