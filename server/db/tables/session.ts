import { ColumnType, Insertable, Updateable } from "kysely";

export const tableName = "sessions";

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: ColumnType<Date, string | null, never>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: ColumnType<Date, string | null, never>;
  updated_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: Session };
export type CreateSession = Insertable<Session>;
export type UpdateSession = Updateable<Session>;
