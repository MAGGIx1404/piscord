export const tableName = "community_tags";

export interface CommunityTag {
  community_id: string;
  tag_id: string;
}

export type PartialDB = { [tableName]: CommunityTag };
