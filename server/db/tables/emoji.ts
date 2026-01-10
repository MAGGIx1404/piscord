import { ColumnType } from "kysely";

export const tableName = "emojis";

export interface Emoji {
  id: string;
  community_id: string | null;
  name: string;
  code: string;
  image_url: string | null;
  unicode: string | null;
  created_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: Emoji };
