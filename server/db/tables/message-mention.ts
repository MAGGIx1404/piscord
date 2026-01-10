import { ColumnType } from "kysely";

export const tableName = "message_mentions";

export interface MessageMention {
  id: string;
  message_id: string;
  mentioned_user_id: string;
  created_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: MessageMention };
