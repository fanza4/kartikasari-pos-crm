import { describe, it, expect } from 'vitest';
import { MENU_ITEMS, TOPPINGS } from '../data/menuData';
import {
  formatRupiah,
  getCustomerSegment,
  generateReceiptText,
  getPromoWhatsAppUrl,
  getStoreSettings
} from '../services/storage';
import { Customer, Transaction, CartItem } from '../types';

describe('Mie Baso Kartika Sari POS & CRM System Tests', () => {

  describe('1. Master Data Menu & Pricing Verification', () => {
    it('should have exact pricing for Mie Baso Seporsi (Rp 26.000)', () => {
      const kuah = MENU_ITEMS.find((m) => m.id === 'kuah-seporsi');
      const yaminManis = MENU_ITEMS.find((m) => m.id === 'yamin-manis-seporsi');
      const yaminAsin = MENU_ITEMS.find((m) => m.id === 'yamin-asin-seporsi');

      expect(kuah?.price).toBe(26000);
      expect(yaminManis?.price).toBe(26000);
      expect(yaminAsin?.price).toBe(26000);
    });

    it('should have exact pricing for Setengah Porsi (Rp 20.000)', () => {
      const kuah = MENU_ITEMS.find((m) => m.id === 'kuah-setengah');
      const yaminManis = MENU_ITEMS.find((m) => m.id === 'yamin-manis-setengah');
      const yaminAsin = MENU_ITEMS.find((m) => m.id === 'yamin-asin-setengah');

      expect(kuah?.price).toBe(20000);
      expect(yaminManis?.price).toBe(20000);
      expect(yaminAsin?.price).toBe(20000);
    });

    it('should verify Komplit Kuah/Yamin Manis is Rp 48.000, while Yamin Asin Komplit is special Rp 40.000', () => {
      const kuahKomplit = MENU_ITEMS.find((m) => m.id === 'kuah-komplit');
      const yaminManisKomplit = MENU_ITEMS.find((m) => m.id === 'yamin-manis-komplit');
      const yaminAsinKomplit = MENU_ITEMS.find((m) => m.id === 'yamin-asin-komplit');

      expect(kuahKomplit?.price).toBe(48000);
      expect(yaminManisKomplit?.price).toBe(48000);
      expect(yaminAsinKomplit?.price).toBe(40000); // Special rule Rp 40.000
    });

    it('should verify Half Portion Variations (Tambah Baso 35k, Tambah Siomay 29k, Tambah Tahu 29k)', () => {
      const tambahBaso = MENU_ITEMS.find((m) => m.id === 'kuah-setengah-baso');
      const tambahSiomay = MENU_ITEMS.find((m) => m.id === 'kuah-setengah-siomay');
      const tambahTahu = MENU_ITEMS.find((m) => m.id === 'kuah-setengah-tahu');

      expect(tambahBaso?.price).toBe(35000);
      expect(tambahSiomay?.price).toBe(29000);
      expect(tambahTahu?.price).toBe(29000);
    });

    it('should verify Add-on Toppings (Baso Urat 10k, others 5k)', () => {
      expect(TOPPINGS.length).toBe(5);
      const urat = TOPPINGS.find((t) => t.id === 'top-baso-urat');
      expect(urat?.price).toBe(10000);
      TOPPINGS.filter((t) => t.id !== 'top-baso-urat').forEach((top) => {
        expect(top.price).toBe(5000);
      });
    });

    it('should verify Beverages prices (Teh Botol 6k, Es Jeruk 15k, Air Putih 6k)', () => {
      const teh = MENU_ITEMS.find((m) => m.id === 'minuman-teh-botol');
      const jeruk = MENU_ITEMS.find((m) => m.id === 'minuman-es-jeruk');
      const air = MENU_ITEMS.find((m) => m.id === 'minuman-air-putih');

      expect(teh?.price).toBe(6000);
      expect(jeruk?.price).toBe(15000);
      expect(air?.price).toBe(6000);
    });
  });

  describe('2. Currency Formatter', () => {
    it('should format numbers to Indonesian Rupiah properly', () => {
      const formatted = formatRupiah(26000);
      expect(formatted).toContain('26.000');
    });
  });

  describe('3. Customer CRM Auto-Segmentation Rules', () => {
    it('should label customers with > 5 visits as VIP', () => {
      const vipCustomer: Customer = {
        id: 'c-vip',
        name: 'Pak Budi',
        whatsapp: '0812345678',
        totalVisits: 6,
        lifetimeValue: 250000,
        stampsCount: 6,
        rewardsClaimed: 0,
        lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      expect(getCustomerSegment(vipCustomer)).toBe('vip');
    });

    it('should label 1st time customers as new (Pelanggan Baru)', () => {
      const newCustomer: Customer = {
        id: 'c-new',
        name: 'Siti',
        whatsapp: '0819876543',
        totalVisits: 1,
        lifetimeValue: 26000,
        stampsCount: 1,
        rewardsClaimed: 0,
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      expect(getCustomerSegment(newCustomer)).toBe('new');
    });

    it('should label customers with no visit > 30 days as at_risk', () => {
      const atRiskCustomer: Customer = {
        id: 'c-risk',
        name: 'Dedi',
        whatsapp: '0811223344',
        totalVisits: 4,
        lifetimeValue: 160000,
        stampsCount: 4,
        rewardsClaimed: 0,
        lastVisit: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
        createdAt: new Date().toISOString(),
      };
      expect(getCustomerSegment(atRiskCustomer)).toBe('at_risk');
    });
  });

  describe('4. POS Cashier & Receipt Generation', () => {
    it('should generate formatted e-receipt text correctly', () => {
      const settings = getStoreSettings();
      const mockCartItem: CartItem = {
        cartItemId: 'item-1',
        menuItem: MENU_ITEMS[0], // Kuah Seporsi 26k
        quantity: 2,
        selectedToppings: [TOPPINGS[0]], // Babat 5k
        itemTotal: (26000 + 5000) * 2, // 62.000
        notes: 'pedas sedang',
      };

      const mockTx: Transaction = {
        id: 'tx-123',
        invoiceNumber: 'KS-123456',
        customerName: 'Kang Anton',
        customerWhatsapp: '081234567890',
        items: [mockCartItem],
        totalAmount: 62000,
        paymentMethod: 'cash',
        cashGiven: 100000,
        changeAmount: 38000,
        stampsEarned: 2,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };

      const receipt = generateReceiptText(mockTx, settings);
      expect(receipt).toContain('STRUK DIGITAL');
      expect(receipt).toContain('KS-123456');
      expect(receipt).toContain('Kang Anton');
      expect(receipt).toContain('Mie Kuah Seporsi');
      expect(receipt).toContain('Kembalian');
      expect(receipt).toContain('+2 stempel');
    });

    it('should generate personalized WhatsApp promo URL', () => {
      const customer: Customer = {
        id: 'c-promo',
        name: 'Teh Nuraeni',
        whatsapp: '081233445566',
        totalVisits: 3,
        lifetimeValue: 120000,
        stampsCount: 3,
        rewardsClaimed: 0,
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const url = getPromoWhatsAppUrl(customer);
      expect(url).toContain('wa.me/6281233445566');
      expect(url).toContain(encodeURIComponent('Teh Nuraeni'));
    });
  });

});
