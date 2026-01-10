import { ColumnType, Generated } from "kysely";

export const tableName = "folders";

export interface Folder {
  id: string;
  workspace_id: string;
  parent_folder_id: string | null;
  name: string;
  icon_url: string | null;
  sort_order: Generated<number>;
  created_by: string;
  created_at: ColumnType<Date, string | null, never>;
  updated_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: Folder };
