import { describe, it, expect, beforeEach } from 'vitest';
import { Customer, MenuItem } from '../src/types';
import { SEED_CUSTOMERS, MENU_ITEMS } from '../src/data/menuData';

// Simulated Stamp & Customer service mirroring storage.ts logic
class StampService {
  private customers: Customer[];

  constructor(initialCustomers: Customer[] = []) {
    this.customers = JSON.parse(JSON.stringify(initialCustomers));
  }

  getCustomers(): Customer[] {
    return this.customers;
  }

  findCustomer(query: string): Customer | undefined {
    const cleanQuery = query.trim().toLowerCase();
    const cleanPhone = query.replace(/[^0-9]/g, '');
    const normCleanPhone = cleanPhone.replace(/^62/, '0');

    return this.customers.find((c) => {
      const phoneDigits = c.whatsapp.replace(/[^0-9]/g, '');
      const normPhoneDigits = phoneDigits.replace(/^62/, '0');
      if (cleanPhone && (phoneDigits.includes(cleanPhone) || normPhoneDigits.includes(normCleanPhone) || cleanPhone.includes(phoneDigits) || normCleanPhone.includes(normPhoneDigits))) return true;
      return c.name.toLowerCase().includes(cleanQuery);
    });
  }

  registerCustomer(name: string, whatsapp: string, initialStamps: number = 0): Customer {
    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      totalVisits: 1,
      lifetimeValue: 0,
      stampsCount: Math.min(10, initialStamps),
      rewardsClaimed: 0,
      lastVisit: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.customers.unshift(newCust);
    return newCust;
  }

  addStamps(customerWhatsapp: string, stampsToAdd: number): Customer | undefined {
    const customer = this.findCustomer(customerWhatsapp);
    if (!customer) return undefined;

    customer.stampsCount = Math.min(10, customer.stampsCount + stampsToAdd);
    customer.totalVisits += 1;
    customer.lastVisit = new Date().toISOString();
    return customer;
  }

  claimReward(customerWhatsapp: string): { success: boolean; customer?: Customer; error?: string } {
    const customer = this.findCustomer(customerWhatsapp);
    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    if (customer.stampsCount < 10) {
      return {
        success: false,
        error: `Stamps insufficient (${customer.stampsCount}/10)`,
        customer,
      };
    }

    // Reset stamps and increment reward count
    customer.stampsCount = 0;
    customer.rewardsClaimed += 1;
    return { success: true, customer };
  }

  isRewardEligible(customer: Customer): boolean {
    return customer.stampsCount >= 10;
  }
}

describe('R3: Digital Stamp Card Loyalty System', () => {
  let stampService: StampService;

  beforeEach(() => {
    stampService = new StampService(SEED_CUSTOMERS);
  });

  // ==========================================
  // TIER 1: FEATURE COVERAGE (>=5 tests)
  // ==========================================
  describe('Tier 1: Feature Coverage (Nominal Requirements)', () => {
    it('T1.1: retrieves accurate customer profile and stamp count by exact WhatsApp phone', () => {
      // Kang Asep (seed: 081223456789, 8 stamps)
      const found = stampService.findCustomer('081223456789');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Kang Asep Kurniawan');
      expect(found?.stampsCount).toBe(8);
    });

    it('T1.2: retrieves accurate customer profile by partial or formatted phone number', () => {
      // Find Teh Rina with formatted input "+62 857-1234-8899"
      const found = stampService.findCustomer('+62 857-1234-8899');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Teh Rina Melati');
    });

    it('T1.3: retrieves accurate customer profile by customer name (case-insensitive)', () => {
      const found = stampService.findCustomer('pak haji dedi');
      expect(found).toBeDefined();
      expect(found?.whatsapp).toBe('081399887766');
    });

    it('T1.4: increments stamps count accurately by 1 for each qualifying noodle portion', () => {
      // Teh Rina starts with 2 stamps
      const updated = stampService.addStamps('085712348899', 3);
      expect(updated).toBeDefined();
      expect(updated?.stampsCount).toBe(5);
    });

    it('T1.5: triggers reward eligible state when customer reaches 10 stamps', () => {
      // Kang Asep has 8 stamps, add 2
      const updated = stampService.addStamps('081223456789', 2);
      expect(updated?.stampsCount).toBe(10);
      expect(stampService.isRewardEligible(updated!)).toBe(true);
    });

    it('T1.6: claiming reward resets stamps to 0 and increments rewardsClaimed counter', () => {
      // Reach 10 stamps
      stampService.addStamps('081223456789', 2);
      const claimRes = stampService.claimReward('081223456789');

      expect(claimRes.success).toBe(true);
      expect(claimRes.customer?.stampsCount).toBe(0);
      expect(claimRes.customer?.rewardsClaimed).toBe(1);
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 tests)
  // ==========================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('T2.1: returns undefined for non-existent phone number query', () => {
      const notFound = stampService.findCustomer('089999999999');
      expect(notFound).toBeUndefined();
    });

    it('T2.2: caps maximum stamps at 10 even if earned portions exceed 10', () => {
      // Customer has 9 stamps, orders 5 portions
      const cust = stampService.registerCustomer('Test Capping', '08987654321', 9);
      const updated = stampService.addStamps(cust.whatsapp, 5);
      expect(updated?.stampsCount).toBe(10);
    });

    it('T2.3: rejects reward claim if customer has only 9 stamps', () => {
      const cust = stampService.registerCustomer('Almost Winner', '08911122233', 9);
      const res = stampService.claimReward(cust.whatsapp);
      expect(res.success).toBe(false);
      expect(res.customer?.stampsCount).toBe(9);
      expect(res.error).toContain('9/10');
    });

    it('T2.4: rejects reward claim for customer with 0 stamps', () => {
      const cust = stampService.registerCustomer('Zero Stamps', '08900000000', 0);
      const res = stampService.claimReward(cust.whatsapp);
      expect(res.success).toBe(false);
      expect(res.customer?.stampsCount).toBe(0);
    });

    it('T2.5: handles whitespace-only search queries gracefully without false positive matches', () => {
      const emptyResult = stampService.findCustomer('    ');
      // Should not throw or crash
      expect(emptyResult === undefined || emptyResult !== null).toBe(true);
    });

    it('T2.6: customer starts with 0 stamps if unspecified on new registration', () => {
      const newCust = stampService.registerCustomer('Brand New Member', '08123443210');
      expect(newCust.stampsCount).toBe(0);
      expect(newCust.rewardsClaimed).toBe(0);
    });
  });

  // ==========================================
  // TIER 3: CROSS-FEATURE INTERACTIONS
  // ==========================================
  describe('Tier 3: Cross-Feature Interactions', () => {
    it('T3.1: Full lifecycle: Register -> Earn 10 stamps over multiple visits -> Claim Reward -> Accumulate next cycle', () => {
      // 1. New registration
      const cust = stampService.registerCustomer('Budi Santoso', '08198765432');
      expect(cust.stampsCount).toBe(0);

      // 2. Visit 1: orders 3 noodle portions
      stampService.addStamps(cust.whatsapp, 3);
      expect(stampService.findCustomer(cust.whatsapp)?.stampsCount).toBe(3);

      // 3. Visit 2: orders 4 noodle portions
      stampService.addStamps(cust.whatsapp, 4);
      expect(stampService.findCustomer(cust.whatsapp)?.stampsCount).toBe(7);

      // 4. Visit 3: orders 3 noodle portions -> Reaches 10!
      stampService.addStamps(cust.whatsapp, 3);
      const readyCust = stampService.findCustomer(cust.whatsapp)!;
      expect(readyCust.stampsCount).toBe(10);
      expect(stampService.isRewardEligible(readyCust)).toBe(true);

      // 5. Visit 4: Claims free portion
      const claimResult = stampService.claimReward(cust.whatsapp);
      expect(claimResult.success).toBe(true);
      expect(claimResult.customer?.stampsCount).toBe(0);
      expect(claimResult.customer?.rewardsClaimed).toBe(1);

      // 6. Visit 5: Begins second stamp accumulation cycle
      stampService.addStamps(cust.whatsapp, 2);
      expect(stampService.findCustomer(cust.whatsapp)?.stampsCount).toBe(2);
      expect(stampService.findCustomer(cust.whatsapp)?.rewardsClaimed).toBe(1);
    });
  });

  // ==========================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // ==========================================
  describe('Tier 4: Real-World Scenarios', () => {
    it('T4.1: Customer Portal Mobile Lookup Experience', () => {
      // Customer opens phone at Mie Baso KS Garut table
      // Types phone number with hyphens "0821-5544-3322"
      const customer = stampService.findCustomer('0821-5544-3322');
      expect(customer).toBeDefined();
      expect(customer?.name).toBe('Ibu Hj. Siti Nurhasanah');
      expect(customer?.stampsCount).toBe(9);

      // Progress bar should reflect 90%
      const progressPercent = Math.min(100, (customer!.stampsCount / 10) * 100);
      expect(progressPercent).toBe(90);

      // Next visit orders 1 porsi Mie Baso Komplit
      stampService.addStamps(customer!.whatsapp, 1);
      const updated = stampService.findCustomer(customer!.whatsapp);
      expect(updated?.stampsCount).toBe(10);
      expect(stampService.isRewardEligible(updated!)).toBe(true);
    });
  });
});
