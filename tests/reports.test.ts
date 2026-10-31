import { describe, it, expect } from 'vitest';
import { Transaction } from '../src/types';
import { MENU_ITEMS } from '../src/data/menuData';

// Reporting Analytics Engine
export class AnalyticsEngine {
  private transactions: Transaction[];

  constructor(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  filterByPeriod(period: 'today' | '7days' | '30days', refTime: number = Date.now()): Transaction[] {
    return this.transactions.filter((tx) => {
      const txTime = new Date(tx.createdAt).getTime();
      if (period === 'today') {
        const todayStart = new Date(refTime).setHours(0, 0, 0, 0);
        return txTime >= todayStart;
      }
      if (period === '7days') {
        return txTime >= refTime - 7 * 24 * 60 * 60 * 1000;
      }
      if (period === '30days') {
        return txTime >= refTime - 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
  }

  computeMetrics(txs: Transaction[]) {
    const totalRevenue = txs.reduce((sum, tx) => sum + tx.totalAmount, 0);
    const totalCount = txs.length;
    const aov = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

    const cashTx = txs.filter((tx) => tx.paymentMethod === 'cash');
    const qrisTx = txs.filter((tx) => tx.paymentMethod === 'qris');

    const cashTotal = cashTx.reduce((sum, tx) => sum + tx.totalAmount, 0);
    const qrisTotal = qrisTx.reduce((sum, tx) => sum + tx.totalAmount, 0);

    const cashPercentage = totalRevenue > 0 ? Math.round((cashTotal / totalRevenue) * 100) : 0;
    const qrisPercentage = totalRevenue > 0 ? 100 - cashPercentage : 0;

    return {
      totalRevenue,
      totalCount,
      aov,
      cashTotal,
      cashCount: cashTx.length,
      cashPercentage,
      qrisTotal,
      qrisCount: qrisTx.length,
      qrisPercentage,
    };
  }

  computePareto(txs: Transaction[], topN: number = 5) {
    const itemMap: { [name: string]: { count: number; revenue: number } } = {};

    txs.forEach((tx) => {
      tx.items.forEach((item) => {
        const name = item.menuItem.name;
        if (!itemMap[name]) {
          itemMap[name] = { count: 0, revenue: 0 };
        }
        itemMap[name].count += item.quantity;
        itemMap[name].revenue += item.itemTotal;
      });
    });

    return Object.entries(itemMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN);
  }
}

describe('R6: Reports, Financial Reconciliation & Analytics', () => {
  const now = Date.now();
  const seporsiKuah = MENU_ITEMS.find((i) => i.id === 'kuah-seporsi')!; // 26k
  const komplitAsin = MENU_ITEMS.find((i) => i.id === 'yamin-asin-komplit')!; // 40k
  const esJeruk = MENU_ITEMS.find((i) => i.id === 'minuman-es-jeruk')!; // 10k

  const sampleTransactions: Transaction[] = [
    // Today, Cash (26k + 10k = 36k)
    {
      id: 'tx-1',
      invoiceNumber: 'KS-001',
      totalAmount: 36000,
      paymentMethod: 'cash',
      stampsEarned: 1,
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(), // 30 mins ago
      status: 'completed',
      items: [
        {
          cartItemId: 'c1',
          menuItem: seporsiKuah,
          quantity: 1,
          selectedToppings: [],
          itemTotal: 26000,
        },
        {
          cartItemId: 'c2',
          menuItem: esJeruk,
          quantity: 1,
          selectedToppings: [],
          itemTotal: 10000,
        },
      ],
    },
    // Today, QRIS (40k)
    {
      id: 'tx-2',
      invoiceNumber: 'KS-002',
      totalAmount: 40000,
      paymentMethod: 'qris',
      stampsEarned: 1,
      createdAt: new Date(now - 1000 * 60 * 60).toISOString(), // 1 hour ago
      status: 'completed',
      items: [
        {
          cartItemId: 'c3',
          menuItem: komplitAsin,
          quantity: 1,
          selectedToppings: [],
          itemTotal: 40000,
        },
      ],
    },
    // 3 days ago, Cash (26k * 2 = 52k)
    {
      id: 'tx-3',
      invoiceNumber: 'KS-003',
      totalAmount: 52000,
      paymentMethod: 'cash',
      stampsEarned: 2,
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      items: [
        {
          cartItemId: 'c4',
          menuItem: seporsiKuah,
          quantity: 2,
          selectedToppings: [],
          itemTotal: 52000,
        },
      ],
    },
    // 20 days ago, QRIS (40k)
    {
      id: 'tx-4',
      invoiceNumber: 'KS-004',
      totalAmount: 40000,
      paymentMethod: 'qris',
      stampsEarned: 1,
      createdAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      items: [
        {
          cartItemId: 'c5',
          menuItem: komplitAsin,
          quantity: 1,
          selectedToppings: [],
          itemTotal: 40000,
        },
      ],
    },
    // 45 days ago (older than 30 days)
    {
      id: 'tx-5',
      invoiceNumber: 'KS-005',
      totalAmount: 100000,
      paymentMethod: 'cash',
      stampsEarned: 3,
      createdAt: new Date(now - 45 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      items: [],
    },
  ];

  const engine = new AnalyticsEngine(sampleTransactions);

  // ==========================================
  // TIER 1: FEATURE COVERAGE (>=5 tests)
  // ==========================================
  describe('Tier 1: Feature Coverage (Nominal Requirements)', () => {
    it("T1.1: calculates Today's summary metrics accurately (Revenue, Count, AOV)", () => {
      const todayTxs = engine.filterByPeriod('today', now);
      expect(todayTxs.length).toBe(2);

      const metrics = engine.computeMetrics(todayTxs);
      // 36.000 + 40.000 = 76.000
      expect(metrics.totalRevenue).toBe(76000);
      expect(metrics.totalCount).toBe(2);
      // AOV: 76.000 / 2 = 38.000
      expect(metrics.aov).toBe(38000);
    });

    it('T1.2: calculates Cash vs QRIS daily reconciliation values and split percentages', () => {
      const todayTxs = engine.filterByPeriod('today', now);
      const metrics = engine.computeMetrics(todayTxs);

      expect(metrics.cashTotal).toBe(36000);
      expect(metrics.cashCount).toBe(1);

      expect(metrics.qrisTotal).toBe(40000);
      expect(metrics.qrisCount).toBe(1);

      // Percentage sum must be 100%
      expect(metrics.cashPercentage + metrics.qrisPercentage).toBe(100);
      // 36000 / 76000 = 47.36% -> 47%
      expect(metrics.cashPercentage).toBe(47);
      expect(metrics.qrisPercentage).toBe(53);
    });

    it('T1.3: builds Pareto chart ranking top-selling menu items by portion volume', () => {
      const last7Days = engine.filterByPeriod('7days', now);
      const pareto = engine.computePareto(last7Days);

      expect(pareto.length).toBeGreaterThan(0);
      // Top seller in last 7 days: Mie Kuah Seporsi (1 from tx-1 + 2 from tx-3 = 3)
      expect(pareto[0].name).toBe('Mie Kuah Seporsi');
      expect(pareto[0].count).toBe(3);
      expect(pareto[0].revenue).toBe(26000 + 52000);
    });

    it('T1.4: period filter for "7days" captures all events within 7 days and excludes older', () => {
      const last7Days = engine.filterByPeriod('7days', now);
      // Includes tx-1 (today), tx-2 (today), tx-3 (3 days ago) = 3 txs
      expect(last7Days.length).toBe(3);
      const totalRev7d = last7Days.reduce((s, t) => s + t.totalAmount, 0);
      expect(totalRev7d).toBe(36000 + 40000 + 52000);
    });

    it('T1.5: period filter for "30days" captures events within 30 days and excludes 45-day tx', () => {
      const last30Days = engine.filterByPeriod('30days', now);
      // Includes tx-1, tx-2, tx-3, tx-4 = 4 txs (excludes tx-5 which is 45 days old)
      expect(last30Days.length).toBe(4);
      expect(last30Days.some((t) => t.id === 'tx-5')).toBe(false);
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 tests)
  // ==========================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('T2.1: handles zero transactions gracefully without division by zero', () => {
      const metrics = engine.computeMetrics([]);
      expect(metrics.totalRevenue).toBe(0);
      expect(metrics.totalCount).toBe(0);
      expect(metrics.aov).toBe(0);
      expect(metrics.cashPercentage).toBe(0);
      expect(metrics.qrisPercentage).toBe(0);
    });

    it('T2.2: handles 100% Cash sales (0 QRIS) with exact 100% / 0% split', () => {
      const allCashTx: Transaction[] = [
        {
          id: 'tx-c1',
          invoiceNumber: 'KS-C1',
          totalAmount: 50000,
          paymentMethod: 'cash',
          stampsEarned: 1,
          createdAt: new Date().toISOString(),
          status: 'completed',
          items: [],
        },
      ];
      const metrics = engine.computeMetrics(allCashTx);
      expect(metrics.cashPercentage).toBe(100);
      expect(metrics.qrisPercentage).toBe(0);
    });

    it('T2.3: handles 100% QRIS sales (0 Cash) with exact 0% / 100% split', () => {
      const allQrisTx: Transaction[] = [
        {
          id: 'tx-q1',
          invoiceNumber: 'KS-Q1',
          totalAmount: 60000,
          paymentMethod: 'qris',
          stampsEarned: 1,
          createdAt: new Date().toISOString(),
          status: 'completed',
          items: [],
        },
      ];
      const metrics = engine.computeMetrics(allQrisTx);
      expect(metrics.cashPercentage).toBe(0);
      expect(metrics.qrisPercentage).toBe(100);
    });

    it('T2.4: computePareto limits output to requested top N items', () => {
      const paretoTop1 = engine.computePareto(sampleTransactions, 1);
      expect(paretoTop1.length).toBe(1);
    });

    it('T2.5: handles empty items array inside transactions safely in Pareto', () => {
      const emptyItemTx: Transaction = {
        id: 'tx-empty-items',
        invoiceNumber: 'KS-EMP',
        totalAmount: 10000,
        paymentMethod: 'cash',
        stampsEarned: 0,
        createdAt: new Date().toISOString(),
        status: 'completed',
        items: [],
      };
      const pareto = engine.computePareto([emptyItemTx]);
      expect(pareto).toEqual([]);
    });
  });

  // ==========================================
  // TIER 3: CROSS-FEATURE INTERACTIONS
  // ==========================================
  describe('Tier 3: Cross-Feature Interactions', () => {
    it('T3.1: New transaction dynamically recalculates all executive summary indicators', () => {
      const initialMetrics = engine.computeMetrics(engine.filterByPeriod('today', now));

      // Append new today transaction (Rp 48.000 Cash)
      const newTx: Transaction = {
        id: 'tx-dyn',
        invoiceNumber: 'KS-DYN',
        totalAmount: 48000,
        paymentMethod: 'cash',
        stampsEarned: 1,
        createdAt: new Date().toISOString(),
        status: 'completed',
        items: [],
      };

      const updatedTxs = [...engine.filterByPeriod('today', now), newTx];
      const updatedMetrics = engine.computeMetrics(updatedTxs);

      expect(updatedMetrics.totalRevenue).toBe(initialMetrics.totalRevenue + 48000);
      expect(updatedMetrics.totalCount).toBe(initialMetrics.totalCount + 1);
      expect(updatedMetrics.cashTotal).toBe(initialMetrics.cashTotal + 48000);
    });
  });

  // ==========================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // ==========================================
  describe('Tier 4: Real-World Scenarios', () => {
    it('T4.1: End-of-Day Store Reconciliation Scenario', () => {
      // Cashier shift close:
      // 1. Total revenue for today is inspected
      const todayTxs = engine.filterByPeriod('today', now);
      const metrics = engine.computeMetrics(todayTxs);

      // 2. Physical cash drawer count is checked against metrics.cashTotal
      const cashInDrawerCounted = 36000;
      expect(cashInDrawerCounted).toBe(metrics.cashTotal);

      // 3. QRIS merchant settlement report is checked against metrics.qrisTotal
      const qrisSettledReported = 40000;
      expect(qrisSettledReported).toBe(metrics.qrisTotal);

      // 4. Verification that cash + qris equals total revenue
      expect(metrics.cashTotal + metrics.qrisTotal).toBe(metrics.totalRevenue);
    });
  });
});
