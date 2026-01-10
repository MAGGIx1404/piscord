import { ColumnType, Generated } from "kysely";
import { MemberRole } from "./enums";

export const tableName = "community_members";

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: Generated<MemberRole>;
  nickname: string | null;
  joined_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: CommunityMember };
