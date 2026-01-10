import { ColumnType, Generated } from "kysely";

export const tableName = "document_comments";

export interface DocumentComment {
  id: string;
  document_id: string;
  author_id: string;
  parent_comment_id: string | null;
  content: string;
  is_resolved: Generated<boolean>;
  position_start: number | null;
  position_end: number | null;
  created_at: ColumnType<Date, string | null, never>;
  updated_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: DocumentComment };
