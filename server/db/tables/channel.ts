import { ColumnType, Generated } from "kysely";

export const tableName = "channels";

export interface Channel {
  id: string;
  community_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_private: Generated<boolean>;
  sort_order: Generated<number>;
  total_messages: Generated<number>;
  created_at: ColumnType<Date, string | null, never>;
  updated_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: Channel };
