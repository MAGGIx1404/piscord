import { ColumnType, Generated } from "kysely";
import { CommunityTier, CommunityType } from "./enums";

export const tableName = "communities";

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  is_verified: Generated<boolean>;
  type: CommunityType;
  tier: CommunityTier;
  url: string | null;
  location: string | null;
  created_at: ColumnType<Date, string | null, never>;
  updated_at: ColumnType<Date, string | null, never>;
}

export type PartialDB = { [tableName]: Community };
