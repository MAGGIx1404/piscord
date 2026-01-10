import { ColumnType } from "kysely";

export const tableName = "document_views";

export interface DocumentView {
  id: string;
  document_id: string;
  user_id: string | null;
  ip_address: string | null;
  viewed_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: DocumentView };
