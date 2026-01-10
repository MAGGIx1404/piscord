import { ColumnType, Generated } from "kysely";

export const tableName = "document_collaborators";

export interface DocumentCollaborator {
  id: string;
  document_id: string;
  user_id: string;
  can_edit: Generated<boolean>;
  added_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: DocumentCollaborator };
