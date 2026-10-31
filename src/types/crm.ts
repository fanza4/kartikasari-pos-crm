export type CustomerSegment = 
  | 'VIP' 
  | 'Pelanggan Baru' 
  | 'At-Risk' 
  | 'Reguler'
  | 'vip' 
  | 'new' 
  | 'at_risk' 
  | 'regular';

export interface Customer {
  id: string;
  name: string;
  phone?: string; // E.g. '081234567890' or '6281234567890'
  whatsapp?: string; // synonym for phone
  totalVisits: number;
  lifetimeValue: number;
  stampsCount: number; // 0 to 10
  rewardsClaimed?: number;
  lastVisitDate?: string; // ISO date
  lastVisit?: string; // synonym
  segment?: CustomerSegment;
  createdAt?: string;
  lastOrderPaidTracked?: string[];
}
