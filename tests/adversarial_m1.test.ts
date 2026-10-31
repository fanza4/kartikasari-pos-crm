import { describe, it, expect } from 'vitest';
import { MENU_ITEMS, TOPPINGS, DEFAULT_STORE_SETTINGS } from '../src/data/menu';
import { formatRupiah as formatRupiahUtils } from '../src/utils/formatters';
import { formatRupiah as formatRupiahStorage } from '../src/services/storage';

describe('Adversarial Stress Test: Master Data, Currency Formatting & Pricing (Milestone 1)', () => {
  // =========================================================================
  // SUITE 1: CURRENCY FORMATTING WITH EXTREME VALUES
  // =========================================================================
  describe('1. Currency Formatting Stress & Extreme Value Boundaries', () => {
    const formatters = [
      { name: 'src/utils/formatters.ts', fn: formatRupiahUtils },
      { name: 'src/services/storage.ts', fn: formatRupiahStorage },
    ];

    formatters.forEach(({ name, fn }) => {
      describe(`Implementation: ${name}`, () => {
        it('handles zero and positive/negative zero representations', () => {
          expect(fn(0)).toBe('Rp 0');
          expect(fn(+0)).toBe('Rp 0');
          expect(fn(-0)).toBe('Rp 0');
          expect(fn(0.0)).toBe('Rp 0');
        });

        it('handles sub-unit fractions and rounding boundaries', () => {
          // Math.round behavior verification
          expect(fn(0.1)).toBe('Rp 0');
          expect(fn(0.49)).toBe('Rp 0');
          expect(fn(0.5)).toBe('Rp 1');
          expect(fn(0.99)).toBe('Rp 1');
          expect(fn(26000.499)).toBe('Rp 26.000');
          expect(fn(26000.5)).toBe('Rp 26.001');
          expect(fn(26000.999)).toBe('Rp 26.001');
          expect(fn(48000.0)).toBe('Rp 48.000');
        });

        it('handles standard menu prices per R7 specification', () => {
          expect(fn(26000)).toBe('Rp 26.000'); // Seporsi
          expect(fn(20000)).toBe('Rp 20.000'); // Setengah
          expect(fn(48000)).toBe('Rp 48.000'); // Komplit Kuah/Manis
          expect(fn(40000)).toBe('Rp 40.000'); // Komplit Khusus Asin
          expect(fn(35000)).toBe('Rp 35.000'); // Setengah + Baso
          expect(fn(29000)).toBe('Rp 29.000'); // Setengah + Siomay/Tahu
          expect(fn(5000)).toBe('Rp 5.000');   // Toppings
          expect(fn(6000)).toBe('Rp 6.000');   // Teh Botol / Air Putih
          expect(fn(10000)).toBe('Rp 10.000'); // Es Jeruk
          expect(fn(12000)).toBe('Rp 12.000'); // Aneka Jus base
        });

        it('handles negative integers and negative fractional values', () => {
          expect(fn(-1)).toBe('Rp -1');
          expect(fn(-5000)).toBe('Rp -5.000');
          expect(fn(-26000)).toBe('Rp -26.000');
          expect(fn(-1000000)).toBe('Rp -1.000.000');
          expect(fn(-26000.4)).toBe('Rp -26.000');
        });

        it('handles millions, billions, trillions, and MAX_SAFE_INTEGER', () => {
          expect(fn(1_000_000)).toBe('Rp 1.000.000'); // 1 Juta
          expect(fn(10_000_000)).toBe('Rp 10.000.000'); // 10 Juta
          expect(fn(100_000_000)).toBe('Rp 100.000.000'); // 100 Juta
          expect(fn(1_000_000_000)).toBe('Rp 1.000.000.000'); // 1 Miliar
          expect(fn(15_750_250_000)).toBe('Rp 15.750.250.000'); // 15.75 Miliar
          expect(fn(999_999_999_999)).toBe('Rp 999.999.999.999'); // 999 Miliar
          expect(fn(Number.MAX_SAFE_INTEGER)).toBe('Rp 9.007.199.254.740.991');
        });

        it('handles nil, NaN, null, and undefined safely without throwing', () => {
          expect(fn(NaN)).toBe('Rp 0');
          // @ts-expect-error testing invalid inputs
          expect(fn(null)).toBe('Rp 0');
          // @ts-expect-error testing invalid inputs
          expect(fn(undefined)).toBe('Rp 0');
        });
      });
    });
  });

  // =========================================================================
  // SUITE 2: MENU ITEM LOOKUPS, CATEGORY FILTERING & INTEGRITY
  // =========================================================================
  describe('2. Menu Item Lookups & Category Filtering Integrity', () => {
    it('contains exact total of 27 pre-seeded menu items', () => {
      expect(MENU_ITEMS.length).toBe(27);
    });

    it('ensures all 27 menu item IDs are strictly unique', () => {
      const ids = MENU_ITEMS.map((item) => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(27);
    });

    it('validates category partitioning across all categories', () => {
      const kuahItems = MENU_ITEMS.filter((i) => i.category === 'mie_kuah');
      const manisItems = MENU_ITEMS.filter((i) => i.category === 'yamin_manis');
      const asinItems = MENU_ITEMS.filter((i) => i.category === 'yamin_asin');
      const toppingItems = MENU_ITEMS.filter((i) => i.category === 'topping');
      const minumanItems = MENU_ITEMS.filter((i) => i.category === 'minuman');

      expect(kuahItems.length).toBe(6);
      expect(manisItems.length).toBe(6);
      expect(asinItems.length).toBe(6);
      expect(toppingItems.length).toBe(5);
      expect(minumanItems.length).toBe(4);

      // Sum equals total
      expect(kuahItems.length + manisItems.length + asinItems.length + toppingItems.length + minumanItems.length).toBe(27);
    });

    it('confirms all items have required descriptive fields and non-zero positive prices', () => {
      MENU_ITEMS.forEach((item) => {
        expect(typeof item.id).toBe('string');
        expect(item.id.length).toBeGreaterThan(0);
        expect(typeof item.name).toBe('string');
        expect(item.name.length).toBeGreaterThan(0);
        expect(typeof item.price).toBe('number');
        expect(item.price).toBeGreaterThan(0);
        expect(Array.isArray(item.composition)).toBe(true);
        expect(item.composition.length).toBeGreaterThan(0);
        expect(typeof item.image).toBe('string');
        expect(item.image.length).toBeGreaterThan(0);
        expect(typeof item.description).toBe('string');
        expect(item.description.length).toBeGreaterThan(0);
        expect(typeof item.isAvailable).toBe('boolean');
      });
    });

    it('tests ID lookup harness: existing vs nonexistent lookups', () => {
      // Look up every existing item
      MENU_ITEMS.forEach((expectedItem) => {
        const found = MENU_ITEMS.find((item) => item.id === expectedItem.id);
        expect(found).toBeDefined();
        expect(found?.name).toBe(expectedItem.name);
      });

      // Look up adversarial non-existent IDs
      const nonExistentIds = ['', 'invalid-id-xyz', 'KUAH-SEPORSI', 'null', 'undefined', '__proto__'];
      nonExistentIds.forEach((id) => {
        const found = MENU_ITEMS.find((item) => item.id === id);
        expect(found).toBeUndefined();
      });
    });

    it('tests category filtering with adversarial/invalid inputs', () => {
      const invalidCategories = ['mie_goreng', 'bakso_aci', 'snack', '', 'undefined', '123'];
      invalidCategories.forEach((cat) => {
        const filtered = MENU_ITEMS.filter((i) => (i.category as string) === cat);
        expect(filtered.length).toBe(0);
      });
    });
  });

  // =========================================================================
  // SUITE 3: TOPPING PRICING SPECIFICATION
  // =========================================================================
  describe('3. Topping Pricing & Ala Carte Integrity', () => {
    const EXPECTED_TOPPING_NAMES = ['Babat', 'Tetelan', 'Baso Urat', 'Siomay', 'Tahu'];

    it('TOPPINGS array contains exactly 5 toppings, all priced at exactly Rp 5.000', () => {
      expect(TOPPINGS.length).toBe(5);

      TOPPINGS.forEach((t) => {
        expect(t.price).toBe(5000);
        expect(typeof t.id).toBe('string');
        expect(t.id.startsWith('top-')).toBe(true);
      });

      EXPECTED_TOPPING_NAMES.forEach((name) => {
        const match = TOPPINGS.find((t) => t.name.toLowerCase() === name.toLowerCase());
        expect(match).toBeDefined();
        expect(match?.price).toBe(5000);
      });
    });

    it('MENU_ITEMS category "topping" items match the 5 canonical toppings at Rp 5.000', () => {
      const catalogToppings = MENU_ITEMS.filter((i) => i.category === 'topping');
      expect(catalogToppings.length).toBe(5);

      catalogToppings.forEach((item) => {
        expect(item.price).toBe(5000);
        expect(item.isNoodlePortion).toBe(false);
        expect(item.givesStamp).toBe(false);
      });
    });
  });

  // =========================================================================
  // SUITE 4: SPECIAL YAMIN ASIN KOMPLIT PRICING RULE
  // =========================================================================
  describe('4. Special Yamin Asin Komplit Price Rule vs Kuah/Manis', () => {
    it('Mie Baso Komplit Khusus (Yamin Asin) is exactly Rp 40.000', () => {
      const asinKomplit = MENU_ITEMS.find((i) => i.id === 'yamin-asin-komplit');
      expect(asinKomplit).toBeDefined();
      expect(asinKomplit?.category).toBe('yamin_asin');
      expect(asinKomplit?.price).toBe(40000);
      expect(asinKomplit?.portionType).toBe('komplit_khusus');
      expect(asinKomplit?.name).toContain('Komplit Khusus');
    });

    it('Mie Baso Komplit for Mie Kuah and Yamin Manis are exactly Rp 48.000', () => {
      const kuahKomplit = MENU_ITEMS.find((i) => i.id === 'kuah-komplit');
      const manisKomplit = MENU_ITEMS.find((i) => i.id === 'yamin-manis-komplit');

      expect(kuahKomplit).toBeDefined();
      expect(kuahKomplit?.category).toBe('mie_kuah');
      expect(kuahKomplit?.price).toBe(48000);

      expect(manisKomplit).toBeDefined();
      expect(manisKomplit?.category).toBe('yamin_manis');
      expect(manisKomplit?.price).toBe(48000);
    });

    it('validates exact price differential: Yamin Asin Komplit is exactly Rp 8.000 cheaper', () => {
      const asinKomplit = MENU_ITEMS.find((i) => i.id === 'yamin-asin-komplit')!;
      const kuahKomplit = MENU_ITEMS.find((i) => i.id === 'kuah-komplit')!;
      const manisKomplit = MENU_ITEMS.find((i) => i.id === 'yamin-manis-komplit')!;

      expect(kuahKomplit.price - asinKomplit.price).toBe(8000);
      expect(manisKomplit.price - asinKomplit.price).toBe(8000);
    });

    it('confirms identical key components between Komplit dishes despite price difference', () => {
      const asin = MENU_ITEMS.find((i) => i.id === 'yamin-asin-komplit')!;
      const kuah = MENU_ITEMS.find((i) => i.id === 'kuah-komplit')!;
      const manis = MENU_ITEMS.find((i) => i.id === 'yamin-manis-komplit')!;

      // All komplit dishes must contain 1 Baso Urat, 3 Baso Kecil, Tahu, Siomay
      [asin, kuah, manis].forEach((item) => {
        const compStr = item.composition.join(', ');
        expect(compStr).toContain('1 Baso Urat');
        expect(compStr).toContain('3 Baso Kecil');
        expect(compStr).toContain('Tahu');
        expect(compStr).toContain('Siomay');
      });
    });
  });

  // =========================================================================
  // SUITE 5: NOODLE STAMP QUALIFICATION FLAGS
  // =========================================================================
  describe('5. Noodle Stamp Qualification Flags', () => {
    it('verifies EXACTLY 18 items qualify for stamps and all are noodle categories', () => {
      const stampQualifying = MENU_ITEMS.filter((item) => item.isNoodlePortion === true && item.givesStamp === true);
      expect(stampQualifying.length).toBe(18);

      stampQualifying.forEach((item) => {
        expect(['mie_kuah', 'yamin_manis', 'yamin_asin']).toContain(item.category);
      });
    });

    it('verifies EXACTLY 9 items do NOT qualify for stamps (toppings and beverages)', () => {
      const nonQualifying = MENU_ITEMS.filter((item) => !item.isNoodlePortion && !item.givesStamp);
      expect(nonQualifying.length).toBe(9);

      nonQualifying.forEach((item) => {
        expect(['topping', 'minuman']).toContain(item.category);
        expect(item.isNoodlePortion).toBe(false);
        expect(item.givesStamp).toBe(false);
      });
    });

    it('guards against any inconsistent stamp flags (isNoodlePortion != givesStamp)', () => {
      MENU_ITEMS.forEach((item) => {
        expect(item.isNoodlePortion).toBe(item.givesStamp);
      });
    });
  });

  // =========================================================================
  // SUITE 6: REALISTIC ADVERSARIAL ORDER SCENARIOS & PRICE ARITHMETIC
  // =========================================================================
  describe('6. Multi-Item Order Simulations & Pricing Arithmetic', () => {
    it('simulates large family banquet order with all toppings and drinks', () => {
      // 4x Mie Baso Seporsi (Kuah) @ 26.000 = 104.000 (4 stamps)
      // 3x Mie Baso Komplit Khusus (Yamin Asin) @ 40.000 = 120.000 (3 stamps)
      // 2x Mie Baso Komplit (Yamin Manis) @ 48.000 = 96.000 (2 stamps)
      // 5x Babat Topping @ 5.000 = 25.000 (0 stamps)
      // 5x Tetelan Topping @ 5.000 = 25.000 (0 stamps)
      // 4x Es Jeruk @ 10.000 = 40.000 (0 stamps)
      // 5x Teh Botol @ 6.000 = 30.000 (0 stamps)

      const pKuahSeporsi = MENU_ITEMS.find((i) => i.id === 'kuah-seporsi')!.price;
      const pAsinKomplit = MENU_ITEMS.find((i) => i.id === 'yamin-asin-komplit')!.price;
      const pManisKomplit = MENU_ITEMS.find((i) => i.id === 'yamin-manis-komplit')!.price;
      const pBabat = TOPPINGS.find((t) => t.id === 'top-babat')!.price;
      const pTetelan = TOPPINGS.find((t) => t.id === 'top-tetelan')!.price;
      const pEsJeruk = MENU_ITEMS.find((i) => i.id === 'minuman-es-jeruk')!.price;
      const pTehBotol = MENU_ITEMS.find((i) => i.id === 'minuman-teh-botol')!.price;

      const total =
        4 * pKuahSeporsi +
        3 * pAsinKomplit +
        2 * pManisKomplit +
        5 * pBabat +
        5 * pTetelan +
        4 * pEsJeruk +
        5 * pTehBotol;

      // 104.000 + 120.000 + 96.000 + 25.000 + 25.000 + 40.000 + 30.000 = 440.000
      expect(total).toBe(440000);
      expect(formatRupiahUtils(total)).toBe('Rp 440.000');
      expect(formatRupiahStorage(total)).toBe('Rp 440.000');

      const totalStamps = 4 * 1 + 3 * 1 + 2 * 1; // 9 stamps
      expect(totalStamps).toBe(9);
    });

    it('simulates maximum stress bulk quantity (e.g. 500 portions for catering event)', () => {
      const seporsiPrice = MENU_ITEMS.find((i) => i.id === 'kuah-seporsi')!.price;
      const qty = 500;
      const bulkTotal = seporsiPrice * qty; // 26.000 * 500 = 13.000.000

      expect(bulkTotal).toBe(13000000);
      expect(formatRupiahUtils(bulkTotal)).toBe('Rp 13.000.000');
      expect(formatRupiahStorage(bulkTotal)).toBe('Rp 13.000.000');
    });
  });
});
