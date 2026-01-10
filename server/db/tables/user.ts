import { ColumnType, Generated, Insertable, Updateable } from "kysely";
import type { UserStatus } from "./enums";

export const tableName = "users";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  about: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string | null;
  birthdate: string | null;
  url: string | null;
  is_premium: Generated<boolean>;
  status: Generated<UserStatus>;
  status_message: string | null;
  is_active: Generated<boolean>;
  email_verified: Generated<boolean>;
  email_verified_at: ColumnType<Date, string | null, string | null>;
  last_seen_at: ColumnType<Date, string | null, string | null>;
  total_friends: Generated<number>;
  total_messages: Generated<number>;
  total_communities: Generated<number>;
  created_at: ColumnType<Date, string | null, never>;
  updated_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: User };
export type CreateUser = Insertable<User>;
export type UpdateUser = Updateable<User>;
