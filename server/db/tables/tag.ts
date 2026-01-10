import { ColumnType } from "kysely";

export const tableName = "tags";

export interface Tag {
  id: string;
  name: string;
  created_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: Tag };
