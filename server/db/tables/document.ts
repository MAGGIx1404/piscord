import { ColumnType, Generated } from "kysely";

export const tableName = "documents";

export interface Document {
  id: string;
  folder_id: string;
  title: string;
  content: string | null;
  is_public: Generated<boolean>;
  total_collaborators: Generated<number>;
  total_views: Generated<number>;
  total_comments: Generated<number>;
  total_words: Generated<number>;
  created_by: string;
  created_at: ColumnType<Date, string | null, never>;
  updated_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: Document };
