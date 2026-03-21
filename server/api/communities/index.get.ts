import { getDiscoverableCommunities } from "../../services/communityService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);

  const query = getQuery(event);
  const search = query.search ? String(query.search) : undefined;
  const category = query.category ? String(query.category) : undefined;
  const limit = query.limit ? Math.min(Number(query.limit), 100) : 24;
  const offset = query.offset ? Number(query.offset) : 0;

  const result = await getDiscoverableCommunities(userId, {
    search,
    category,
    limit,
    offset
  });

  return result;
});
