import { ColumnType } from "kysely";

export const tableName = "message_reactions";

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji_id: string;
  created_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: MessageReaction };
