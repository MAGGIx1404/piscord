import type { InternalApi } from "nitropack";

export type MeResponse = InternalApi["/api/user/me"]["get"];
export type UserCommunitiesResponse = InternalApi["/api/user/communities"]["get"];
