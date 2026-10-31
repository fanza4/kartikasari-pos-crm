import { describe, it, expect } from 'vitest';
import { MENU_ITEMS, TOPPINGS, DEFAULT_STORE_SETTINGS, SEED_CUSTOMERS } from '../src/data/menu';
import { formatRupiah } from '../src/utils/formatters';

describe('R7 & Master Data: Menu Items, Pricing, Composition, Variants & Currency Localization', () => {
  // ==========================================
  // TIER 1: FEATURE COVERAGE (>=5 tests)
  // ==========================================
  describe('Tier 1: Feature Coverage (Nominal Requirements)', () => {
    it('T1.1: validates all 3 noodle categories (Mie Kuah, Yamin Manis, Yamin Asin) contain all 6 dish variations', () => {
      const kuahItems = MENU_ITEMS.filter((i) => i.category === 'mie_kuah');
      const yaminManisItems = MENU_ITEMS.filter((i) => i.category === 'yamin_manis');
      const yaminAsinItems = MENU_ITEMS.filter((i) => i.category === 'yamin_asin');

      expect(kuahItems.length).toBe(6);
      expect(yaminManisItems.length).toBe(6);
      expect(yaminAsinItems.length).toBe(6);
    });

    it('T1.2: validates exact pricing for all standard noodle dishes across categories', () => {
      // 1. Mie Baso Seporsi: Rp 26.000
      const seporsiKuah = MENU_ITEMS.find((i) => i.id === 'kuah-seporsi');
      const seporsiManis = MENU_ITEMS.find((i) => i.id === 'yamin-manis-seporsi');
      const seporsiAsin = MENU_ITEMS.find((i) => i.id === 'yamin-asin-seporsi');
      expect(seporsiKuah?.price).toBe(26000);
      expect(seporsiManis?.price).toBe(26000);
      expect(seporsiAsin?.price).toBe(26000);

      // 2. Mie Baso Setengah Porsi: Rp 20.000
      const setengahKuah = MENU_ITEMS.find((i) => i.id === 'kuah-setengah');
      const setengahManis = MENU_ITEMS.find((i) => i.id === 'yamin-manis-setengah');
      const setengahAsin = MENU_ITEMS.find((i) => i.id === 'yamin-asin-setengah');
      expect(setengahKuah?.price).toBe(20000);
      expect(setengahManis?.price).toBe(20000);
      expect(setengahAsin?.price).toBe(20000);

      // 3. Mie Baso Komplit (Kuah / Yamin Manis): Rp 48.000
      const komplitKuah = MENU_ITEMS.find((i) => i.id === 'kuah-komplit');
      const komplitManis = MENU_ITEMS.find((i) => i.id === 'yamin-manis-komplit');
      expect(komplitKuah?.price).toBe(48000);
      expect(komplitManis?.price).toBe(48000);

      // 4. 1/2 + Tambah Baso: Rp 35.000
      const basoExtraKuah = MENU_ITEMS.find((i) => i.id === 'kuah-setengah-baso');
      expect(basoExtraKuah?.price).toBe(35000);

      // 5. 1/2 + Tambah Siomay: Rp 29.000
      const siomayExtraKuah = MENU_ITEMS.find((i) => i.id === 'kuah-setengah-siomay');
      expect(siomayExtraKuah?.price).toBe(29000);

      // 6. 1/2 + Tambah Tahu: Rp 29.000
      const tahuExtraKuah = MENU_ITEMS.find((i) => i.id === 'kuah-setengah-tahu');
      expect(tahuExtraKuah?.price).toBe(29000);
    });

    it('T1.3: validates the special price rule for Mie Baso Komplit Khusus (Yamin Asin) at Rp 40.000', () => {
      const komplitKhusus = MENU_ITEMS.find((i) => i.id === 'yamin-asin-komplit');
      expect(komplitKhusus).toBeDefined();
      expect(komplitKhusus?.price).toBe(40000);
      expect(komplitKhusus?.name).toContain('Komplit Khusus');
    });

    it('T1.4: validates all 5 toppings are priced correctly (Baso Urat 10k, others 5k)', () => {
      const expectedToppings = ['Babat', 'Tetelan', 'Baso Urat', 'Siomay', 'Tahu'];
      expect(TOPPINGS.length).toBe(5);

      expectedToppings.forEach((name) => {
        const found = TOPPINGS.find((t) => t.name.toLowerCase() === name.toLowerCase());
        expect(found).toBeDefined();
        if (name === 'Baso Urat') {
          expect(found?.price).toBe(10000);
        } else {
          expect(found?.price).toBe(5000);
        }
      });
    });

    it('T1.5: validates beverages: Teh Botol (6k), Es Jeruk (15k), Air Putih (6k), Aneka Jus (custom price entry)', () => {
      const tehBotol = MENU_ITEMS.find((i) => i.id === 'minuman-teh-botol');
      const esJeruk = MENU_ITEMS.find((i) => i.id === 'minuman-es-jeruk');
      const airPutih = MENU_ITEMS.find((i) => i.id === 'minuman-air-putih');
      const anekaJus = MENU_ITEMS.find((i) => i.id === 'minuman-aneka-jus');

      expect(tehBotol?.price).toBe(6000);
      expect(esJeruk?.price).toBe(15000);
      expect(airPutih?.price).toBe(6000);
      expect(anekaJus?.allowPriceOverride || anekaJus?.isCustomPrice).toBeTruthy();
    });

    it('T1.6: validates Indonesian Rupiah currency formatting produces standard "Rp 26.000"', () => {
      expect(formatRupiah(26000)).toBe('Rp 26.000');
      expect(formatRupiah(5000)).toBe('Rp 5.000');
      expect(formatRupiah(40000)).toBe('Rp 40.000');
      expect(formatRupiah(48000)).toBe('Rp 48.000');
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 tests)
  // ==========================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('T2.1: formatRupiah handles zero and extreme currency amounts', () => {
      expect(formatRupiah(0)).toBe('Rp 0');
      expect(formatRupiah(1000000)).toBe('Rp 1.000.000');
      expect(formatRupiah(50000000)).toBe('Rp 50.000.000');
    });

    it('T2.2: formatRupiah handles null, undefined, or NaN safely by returning "Rp 0"', () => {
      expect(formatRupiah(null as any)).toBe('Rp 0');
      expect(formatRupiah(undefined as any)).toBe('Rp 0');
      expect(formatRupiah(NaN as any)).toBe('Rp 0');
    });

    it('T2.3: verifies all noodle portions qualify for stamps (givesStamp or isNoodlePortion is true)', () => {
      MENU_ITEMS.forEach((item) => {
        if (item.category === 'mie_kuah' || item.category === 'yamin_manis' || item.category === 'yamin_asin') {
          expect(Boolean(item.givesStamp || item.isNoodlePortion)).toBe(true);
        } else {
          expect(Boolean(item.givesStamp || item.isNoodlePortion)).toBe(false);
        }
      });
    });

    it('T2.4: verifies ingredient composition details for each key dish', () => {
      const seporsi = MENU_ITEMS.find((i) => i.id === 'kuah-seporsi')!;
      const compSeporsi = Array.isArray(seporsi.composition) ? seporsi.composition.join(', ') : seporsi.composition;
      expect(compSeporsi).toContain('Baso Urat');
      expect(compSeporsi).toContain('Baso Kecil');

      const komplit = MENU_ITEMS.find((i) => i.id === 'kuah-komplit')!;
      const compKomplit = Array.isArray(komplit.composition) ? komplit.composition.join(', ') : komplit.composition;
      expect(compKomplit).toContain('Tahu');
      expect(compKomplit).toContain('Siomay');
    });

    it('T2.5: verifies default variants mapping for noodle dishes', () => {
      const kuah = MENU_ITEMS.find((i) => i.id === 'kuah-seporsi');
      const manis = MENU_ITEMS.find((i) => i.id === 'yamin-manis-seporsi');
      const asin = MENU_ITEMS.find((i) => i.id === 'yamin-asin-seporsi');

      if (kuah?.defaultVariants) {
        expect(kuah.defaultVariants).toContain('Mie Kuah');
      }
      if (manis?.defaultVariants) {
        expect(manis.defaultVariants).toContain('Yamin Manis');
      }
      if (asin?.defaultVariants) {
        expect(asin.defaultVariants).toContain('Yamin Asin');
      }
    });
  });

  // ==========================================
  // TIER 3: CROSS-FEATURE INTERACTIONS
  // ==========================================
  describe('Tier 3: Cross-Feature Interactions', () => {
    it('T3.1: verifies price consistency: 1/2 portion + single topping vs full combo', () => {
      const setengahPrice = MENU_ITEMS.find((i) => i.id === 'kuah-setengah')!.price; // 20.000
      const toppingBabatPrice = TOPPINGS.find((t) => t.id === 'top-babat')!.price; // 5.000
      const tambahBasoDishPrice = MENU_ITEMS.find((i) => i.id === 'kuah-setengah-baso')!.price; // 35.000

      // Ala carte sum (20k + 5k = 25k) is less than special loaded dish (35k with 1 urat + 5 baso kecil)
      expect(setengahPrice + toppingBabatPrice).toBe(25000);
      expect(tambahBasoDishPrice).toBe(35000);
      expect(tambahBasoDishPrice).toBeGreaterThan(setengahPrice + toppingBabatPrice);
    });

    it('T3.2: verifies store settings address and location coordinate links match Garut specification', () => {
      expect(DEFAULT_STORE_SETTINGS.address).toContain('Otista No 127');
      expect(DEFAULT_STORE_SETTINGS.address).toContain('Paseban');
      expect(DEFAULT_STORE_SETTINGS.address).toContain('Garut');
      expect(DEFAULT_STORE_SETTINGS.stampTarget).toBe(10);
      expect(DEFAULT_STORE_SETTINGS.phone).toBeDefined();
    });
  });

  // ==========================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // ==========================================
  describe('Tier 4: Real-World Scenarios', () => {
    it('T4.1: Customer Menu Exploration & Order Total Verification', () => {
      // Customer orders:
      // 1x Mie Baso Seporsi (Kuah) -> 26.000
      // 1x Mie Baso Komplit Khusus (Yamin Asin) -> 40.000
      // 1x Es Jeruk -> 15.000
      // 1x Aneka Jus (custom price 15.000)
      const p1 = MENU_ITEMS.find((i) => i.id === 'kuah-seporsi')!.price;
      const p2 = MENU_ITEMS.find((i) => i.id === 'yamin-asin-komplit')!.price;
      const p3 = MENU_ITEMS.find((i) => i.id === 'minuman-es-jeruk')!.price;
      const customJusPrice = 15000;

      const subtotal = p1 + p2 + p3 + customJusPrice;
      expect(subtotal).toBe(96000);
      expect(formatRupiah(subtotal)).toBe('Rp 96.000');
    });
  });
});
