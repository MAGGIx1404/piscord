import { ColumnType, Generated } from "kysely";

export const tableName = "community_invites";

export interface CommunityInvite {
  id: string;
  community_id: string;
  code: string;
  created_by: string;
  max_uses: number | null;
  current_uses: Generated<number>;
  expires_at: Date | null;
  created_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: CommunityInvite };
