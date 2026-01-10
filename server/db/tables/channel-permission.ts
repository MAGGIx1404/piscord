import { ColumnType, Generated } from "kysely";

export const tableName = "channel_permissions";

export interface ChannelPermission {
  id: string;
  channel_id: string;
  user_id: string;
  can_view: Generated<boolean>;
  can_send: Generated<boolean>;
  can_manage: Generated<boolean>;
  granted_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: ChannelPermission };
