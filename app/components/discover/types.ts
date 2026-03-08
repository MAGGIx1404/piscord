export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  totalUsers: number;
  posterImage: string | null;
  iconImage: string | null;
  type: string | null;
  requiresApproval?: boolean;
  isMember?: boolean;
  requireApproval?: boolean;
  isPendingRequest?: boolean;
}
