import { ColumnType } from "kysely";
import { FriendshipStatus } from "./enums";

export const tableName = "friendships";

export interface Friendship {
  id: string;
  requester_id: string; // user who sent the friend request
  addressee_id: string; // user who received the friend request
  status: FriendshipStatus;
  created_at: ColumnType<Date, string | null, never>;
  updated_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: Friendship };
