import { ColumnType } from "kysely";

export const tableName = "badges";

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  color: string | null;
  created_at: ColumnType<Date, string | null, null>;
}

export type PartialDB = { [tableName]: Badge };
