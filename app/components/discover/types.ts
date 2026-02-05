export interface Community {
  id: string;
  name: string;
  description: string;
  totalUsers: number;
  posterImage: string;
  iconImage: string;
  type: string;
  requiresApproval?: boolean;
}
