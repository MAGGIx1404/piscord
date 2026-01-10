import { ColumnType } from "kysely";

export const tableName = "user_badges";

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: ColumnType<Date, string | null, null>;
}

export type PartialDB = { [tableName]: UserBadge };
