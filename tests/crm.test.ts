import { describe, it, expect, beforeEach } from 'vitest';
import { Customer, CustomerSegment } from '../src/types';
import { SEED_CUSTOMERS } from '../src/data/menuData';
import { getCustomerSegment, getSegmentBadge, getPromoWhatsAppUrl } from '../src/services/storage';

describe('R5: CRM Customer Directory, Segmentation & 1-Click Promo', () => {
  let customers: Customer[];

  beforeEach(() => {
    customers = JSON.parse(JSON.stringify(SEED_CUSTOMERS));
  });

  // ==========================================
  // TIER 1: FEATURE COVERAGE (>=5 tests)
  // ==========================================
  describe('Tier 1: Feature Coverage (Nominal Requirements)', () => {
    it('T1.1: customer directory stores required fields (id, name, whatsapp, totalVisits, LTV, lastVisit)', () => {
      expect(customers.length).toBeGreaterThan(0);
      customers.forEach((c) => {
        expect(c.id).toBeDefined();
        expect(c.name).toBeDefined();
        expect(c.whatsapp).toBeDefined();
        expect(typeof c.totalVisits).toBe('number');
        expect(typeof c.lifetimeValue).toBe('number');
        expect(c.lastVisit).toBeDefined();
        expect(new Date(c.lastVisit).toString()).not.toBe('Invalid Date');
      });
    });

    it('T1.2: segments active customers with >5 visits as "vip" (VIP / Langganan Tetap)', () => {
      const vipCustomer: Customer = {
        id: 'c-vip',
        name: 'Kang VIP',
        whatsapp: '0811223344',
        totalVisits: 6,
        lifetimeValue: 300000,
        stampsCount: 6,
        rewardsClaimed: 0,
        lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        createdAt: new Date().toISOString(),
      };

      const segment = getCustomerSegment(vipCustomer);
      expect(segment).toBe('vip');

      const badge = getSegmentBadge(segment);
      expect(badge.label).toBe('VIP / Langganan Tetap');
      expect(badge.badge).toContain('VIP');
    });

    it('T1.3: segments customers on their 1st visit as "new" (Pelanggan Baru)', () => {
      const newCustomer: Customer = {
        id: 'c-new',
        name: 'Teh Baru',
        whatsapp: '0822334455',
        totalVisits: 1,
        lifetimeValue: 26000,
        stampsCount: 1,
        rewardsClaimed: 0,
        lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      const segment = getCustomerSegment(newCustomer);
      expect(segment).toBe('new');

      const badge = getSegmentBadge(segment);
      expect(badge.label).toBe('Pelanggan Baru');
    });

    it('T1.4: segments customers inactive >30 days as "at_risk" (At-Risk / Perlu Disapa)', () => {
      const atRiskCustomer: Customer = {
        id: 'c-risk',
        name: 'Pak Rindu',
        whatsapp: '0833445566',
        totalVisits: 3,
        lifetimeValue: 120000,
        stampsCount: 3,
        rewardsClaimed: 0,
        lastVisit: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
        createdAt: new Date().toISOString(),
      };

      const segment = getCustomerSegment(atRiskCustomer);
      expect(segment).toBe('at_risk');

      const badge = getSegmentBadge(segment);
      expect(badge.label).toBe('At-Risk / Perlu Disapa');
    });

    it('T1.5: filters directory by segmentation category and search term accurately', () => {
      // Filter by segment 'vip'
      const vips = customers.filter((c) => getCustomerSegment(c) === 'vip');
      expect(vips.length).toBeGreaterThan(0);
      vips.forEach((c) => {
        expect(c.totalVisits).toBeGreaterThan(5);
      });

      // Search by name "Asep"
      const query = 'asep';
      const searchResults = customers.filter(
        (c) => c.name.toLowerCase().includes(query) || c.whatsapp.includes(query)
      );
      expect(searchResults.length).toBe(1);
      expect(searchResults[0].name).toContain('Asep');
    });

    it('T1.6: generates 1-Click WhatsApp Promo with personalized template and formatted phone', () => {
      const customer: Customer = {
        id: 'c-promo',
        name: 'Asep Kurniawan',
        whatsapp: '081223456789',
        totalVisits: 8,
        lifetimeValue: 345000,
        stampsCount: 8,
        rewardsClaimed: 0,
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const customTemplate = 'Halo Kak {nama}! Ada promo gratis Es Jeruk untuk kunjungan minggu ini di Mie Baso Kartikasari Otista!';
      const promoUrl = getPromoWhatsAppUrl(customer, customTemplate);

      expect(promoUrl).toContain('https://wa.me/6281223456789?text=');
      // Decoded text must include customer name
      const decodedParam = decodeURIComponent(promoUrl.split('?text=')[1]);
      expect(decodedParam).toContain('Halo Kak Asep Kurniawan!');
      expect(decodedParam).toContain('gratis Es Jeruk');
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 tests)
  // ==========================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('T2.1: boundary visit count of exactly 5 is regular, 6 is VIP', () => {
      const fiveVisitsCust: Customer = {
        id: 'c-5',
        name: 'Five Visits',
        whatsapp: '08111111111',
        totalVisits: 5,
        lifetimeValue: 150000,
        stampsCount: 5,
        rewardsClaimed: 0,
        lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      const sixVisitsCust: Customer = {
        id: 'c-6',
        name: 'Six Visits',
        whatsapp: '08222222222',
        totalVisits: 6,
        lifetimeValue: 180000,
        stampsCount: 6,
        rewardsClaimed: 0,
        lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      expect(getCustomerSegment(fiveVisitsCust)).toBe('regular');
      expect(getCustomerSegment(sixVisitsCust)).toBe('vip');
    });

    it('T2.2: boundary inactive date of 29 days is regular, 31 days is at_risk', () => {
      const inactive29Days: Customer = {
        id: 'c-29d',
        name: '29 Days Inactive',
        whatsapp: '08333333333',
        totalVisits: 3,
        lifetimeValue: 100000,
        stampsCount: 3,
        rewardsClaimed: 0,
        lastVisit: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      const inactive31Days: Customer = {
        id: 'c-31d',
        name: '31 Days Inactive',
        whatsapp: '08444444444',
        totalVisits: 3,
        lifetimeValue: 100000,
        stampsCount: 3,
        rewardsClaimed: 0,
        lastVisit: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      expect(getCustomerSegment(inactive29Days)).toBe('regular');
      expect(getCustomerSegment(inactive31Days)).toBe('at_risk');
    });

    it('T2.3: VIP customer who becomes inactive >30 days is correctly prioritized as at_risk', () => {
      const inactiveVip: Customer = {
        id: 'c-invip',
        name: 'Pak Haji Dedi (Inactive VIP)',
        whatsapp: '081399887766',
        totalVisits: 12, // VIP visit count
        lifetimeValue: 620000,
        stampsCount: 4,
        rewardsClaimed: 1,
        lastVisit: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // >30 days inactive
        createdAt: new Date().toISOString(),
      };

      expect(getCustomerSegment(inactiveVip)).toBe('at_risk');
    });

    it('T2.4: phone number starting with +62 or 62 retains clean international prefix in WA promo', () => {
      const customer1: Customer = {
        id: 'c-int1',
        name: 'Test Intl',
        whatsapp: '+62 812-9988-7766',
        totalVisits: 1,
        lifetimeValue: 26000,
        stampsCount: 1,
        rewardsClaimed: 0,
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const url = getPromoWhatsAppUrl(customer1);
      expect(url).toContain('https://wa.me/6281299887766?text=');
    });

    it('T2.5: customer with special characters in name is safely escaped in WhatsApp URL', () => {
      const customerWithSpecialChars: Customer = {
        id: 'c-spec',
        name: 'M. Fikri & Rian (Garut)',
        whatsapp: '087788990011',
        totalVisits: 2,
        lifetimeValue: 52000,
        stampsCount: 2,
        rewardsClaimed: 0,
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const url = getPromoWhatsAppUrl(customerWithSpecialChars);
      expect(url).toBeDefined();
      const decodedParam = decodeURIComponent(url.split('?text=')[1]);
      expect(decodedParam).toContain('M. Fikri & Rian (Garut)');
    });
  });

  // ==========================================
  // TIER 3: CROSS-FEATURE INTERACTIONS
  // ==========================================
  describe('Tier 3: Cross-Feature Interactions', () => {
    it('T3.1: Transition from Pelanggan Baru -> Reguler -> VIP as visits accumulate', () => {
      const customer: Customer = {
        id: 'c-journey',
        name: 'Kang Perjalanan',
        whatsapp: '081555666777',
        totalVisits: 1,
        lifetimeValue: 26000,
        stampsCount: 1,
        rewardsClaimed: 0,
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // 1st visit: New
      expect(getCustomerSegment(customer)).toBe('new');

      // 2nd - 5th visits: Regular
      customer.totalVisits = 3;
      expect(getCustomerSegment(customer)).toBe('regular');
      customer.totalVisits = 5;
      expect(getCustomerSegment(customer)).toBe('regular');

      // 6th visit: VIP
      customer.totalVisits = 6;
      expect(getCustomerSegment(customer)).toBe('vip');
    });
  });

  // ==========================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // ==========================================
  describe('Tier 4: Real-World Scenarios', () => {
    it('T4.1: Store Manager Conducts Weekly Retention Promo Broadcast', () => {
      // 1. Store manager opens CRM directory
      // 2. Filters for all customers needing re-engagement (At-Risk)
      const atRiskCustomers = customers.filter((c) => getCustomerSegment(c) === 'at_risk');
      expect(atRiskCustomers.length).toBeGreaterThan(0);

      // 3. Generates personalized promo links for each at-risk customer
      atRiskCustomers.forEach((cust) => {
        const promoUrl = getPromoWhatsAppUrl(cust);
        expect(promoUrl).toMatch(/^https:\/\/wa\.me\/62\d+\?text=.+/);
        
        const decoded = decodeURIComponent(promoUrl);
        expect(decoded).toContain(cust.name);
        expect(decoded).toContain('Mie Baso');
        expect(decoded).toContain('Garut');
      });
    });
  });
});
