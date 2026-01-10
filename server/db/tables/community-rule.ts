import { ColumnType, Generated } from "kysely";

export const tableName = "community_rules";

export interface CommunityRule {
  id: string;
  community_id: string;
  title: string;
  description: string | null;
  sort_order: Generated<number>;
  created_at: ColumnType<Date, string | null, never>;
  updated_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: CommunityRule };
