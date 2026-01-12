import { db, generateId } from "../db";
import type { CommunityType } from "../db/tables/enums";

export interface UserCommunity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  is_verified: boolean;
  type: string;
  tier: string;
  role: string;
  joined_at: Date;
  member_count: number;
}

export interface CreateCommunityInput {
  name: string;
  slug: string;
  description: string;
  type: CommunityType;
  logo_url?: string | null;
  cover_url?: string | null;
  url?: string | null;
  location?: string | null;
}

export interface CreateCommunityRuleInput {
  title: string;
  description?: string;
  sort_order: number;
}

export async function createCommunity(
  input: CreateCommunityInput,
  userId: string,
  rules?: CreateCommunityRuleInput[]
) {
  const communityId = generateId();

  const result = await db.transaction().execute(async (trx) => {
    await trx
      .insertInto("communities")
      .values({
        id: communityId,
        name: input.name,
        slug: input.slug,
        description: input.description,
        type: input.type,
        tier: "free",
        logo_url: input.logo_url || null,
        cover_url: input.cover_url || null,
        url: input.url || null,
        location: input.location || null
      })
      .execute();

    await trx
      .insertInto("community_members")
      .values({
        id: generateId(),
        community_id: communityId,
        user_id: userId,
        role: "owner"
      })
      .execute();

    await trx
      .insertInto("channels")
      .values({
        id: generateId(),
        community_id: communityId,
        name: "General",
        slug: "general",
        description: "General discussion channel",
        is_private: false,
        sort_order: 0
      })
      .execute();

    if (rules && rules.length > 0) {
      await trx
        .insertInto("community_rules")
        .values(
          rules.map((rule) => ({
            id: generateId(),
            community_id: communityId,
            title: rule.title,
            description: rule.description || null,
            sort_order: rule.sort_order
          }))
        )
        .execute();
    }

    await trx
      .updateTable("users")
      .set((eb) => ({
        total_communities: eb("total_communities", "+", 1)
      }))
      .where("id", "=", userId)
      .execute();

    return await findCommunityById(communityId);
  });

  return result;
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const existing = await db
    .selectFrom("communities")
    .select("id")
    .where("slug", "=", slug)
    .executeTakeFirst();

  return !existing;
}

export async function findUserCommunities(userId: string): Promise<UserCommunity[]> {
  const communities = await db
    .selectFrom("community_members")
    .innerJoin("communities", "communities.id", "community_members.community_id")
    .select([
      "communities.id",
      "communities.name",
      "communities.slug",
      "communities.description",
      "communities.logo_url",
      "communities.cover_url",
      "communities.is_verified",
      "communities.type",
      "communities.tier",
      "community_members.role",
      "community_members.joined_at"
    ])
    .where("community_members.user_id", "=", userId)
    .orderBy("community_members.joined_at", "desc")
    .execute();

  const communityIds = communities.map((c) => c.id);

  if (communityIds.length === 0) {
    return [];
  }

  const memberCounts = await db
    .selectFrom("community_members")
    .select(["community_id", db.fn.count<number>("id").as("count")])
    .where("community_id", "in", communityIds)
    .groupBy("community_id")
    .execute();

  const countMap = new Map(memberCounts.map((m) => [m.community_id, Number(m.count)]));

  return communities.map((community) => ({
    ...community,
    member_count: countMap.get(community.id) || 0
  }));
}

export async function findCommunityBySlug(slug: string) {
  return await db.selectFrom("communities").selectAll().where("slug", "=", slug).executeTakeFirst();
}

export async function findCommunityById(id: string) {
  return await db.selectFrom("communities").selectAll().where("id", "=", id).executeTakeFirst();
}

export async function isCommunityMember(communityId: string, userId: string): Promise<boolean> {
  const member = await db
    .selectFrom("community_members")
    .select("id")
    .where("community_id", "=", communityId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  return !!member;
}

export async function getCommunityMember(communityId: string, userId: string) {
  return await db
    .selectFrom("community_members")
    .selectAll()
    .where("community_id", "=", communityId)
    .where("user_id", "=", userId)
    .executeTakeFirst();
}
