import { ColumnType, Generated } from "kysely";

export const tableName = "messages";

export interface Message {
  id: string;
  channel_id: string;
  author_id: string;
  content: string;
  reply_to_id: string | null;
  is_pinned: Generated<boolean>;
  is_edited: Generated<boolean>;
  is_deleted: Generated<boolean>;
  pinned_by: string | null;
  pinned_at: Date | null;
  created_at: ColumnType<Date, string | null, never>;
  updated_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: Message };
