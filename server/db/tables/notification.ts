import { ColumnType, Generated } from "kysely";
import { NotificationType } from "./enums";

export const tableName = "notifications";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  reference_type: string | null;
  reference_id: string | null;
  actor_id: string | null;
  is_read: Generated<boolean>;
  read_at: Date | null;
  created_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: Notification };
