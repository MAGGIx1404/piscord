import { getPendingRequests } from "../../../services/friendService";

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const requests = await getPendingRequests(userId);
  return requests;
});
