export type PeriodFilter = 'today' | '7d' | '30d';

export interface ExecutiveSummaryMetrics {
  todayRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
}

export interface PaymentReconciliation {
  cashTotal: number;
  cashCount: number;
  cashPercentage: number;
  qrisTotal: number;
  qrisCount: number;
  qrisPercentage: number;
  grandTotal: number;
}

export interface ParetoMenuItem {
  id: string;
  name: string;
  quantitySold: number;
  revenue: number;
  percentageOfRevenue: number;
  cumulativePercentage: number;
  isTop80: boolean;
}

export interface IngredientProjection {
  ingredient: string;
  estimatedQuantity: number;
  unit: string;
  basis: string;
}
