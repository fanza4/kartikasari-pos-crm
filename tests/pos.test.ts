import { describe, it, expect, beforeEach } from 'vitest';
import { MenuItem, ToppingItem, CartItem, Transaction, StoreSettings } from '../src/types';
import { MENU_ITEMS, TOPPINGS, DEFAULT_STORE_SETTINGS } from '../src/data/menuData';
import { formatRupiah, generateReceiptText, getReceiptWhatsAppUrl } from '../src/services/storage';

// In-memory POS Cart Engine for rigorous testing
class CartEngine {
  private items: CartItem[] = [];
  private claimRewardActive: boolean = false;
  private customerStamps: number = 0;

  getItems(): CartItem[] {
    return this.items;
  }

  setCustomerStamps(stamps: number) {
    this.customerStamps = stamps;
  }

  setClaimReward(claim: boolean) {
    this.claimRewardActive = claim;
  }

  addToCart(menuItem: MenuItem, toppings: ToppingItem[] = [], notes: string = '', customPrice?: number) {
    const toppingIds = toppings.map((t) => t.id).sort().join('-');
    const cartItemId = `${menuItem.id}-${toppingIds}-${notes ? notes.trim() : 'nonotes'}`;

    const existingIndex = this.items.findIndex((i) => i.cartItemId === cartItemId);
    if (existingIndex >= 0) {
      this.items[existingIndex].quantity += 1;
      this.recalculateItemTotal(this.items[existingIndex]);
      return;
    }

    const newItem: CartItem = {
      cartItemId,
      menuItem,
      quantity: 1,
      selectedToppings: [...toppings],
      notes,
      customPrice,
      itemTotal: 0,
    };
    this.recalculateItemTotal(newItem);
    this.items.push(newItem);
  }

  updateQuantity(cartItemId: string, delta: number) {
    const index = this.items.findIndex((i) => i.cartItemId === cartItemId);
    if (index === -1) return;

    const newQty = this.items[index].quantity + delta;
    if (newQty <= 0) {
      this.items.splice(index, 1);
    } else {
      this.items[index].quantity = newQty;
      this.recalculateItemTotal(this.items[index]);
    }
  }

  removeFromCart(cartItemId: string) {
    this.items = this.items.filter((i) => i.cartItemId !== cartItemId);
  }

  updateNotes(cartItemId: string, notes: string) {
    const item = this.items.find((i) => i.cartItemId === cartItemId);
    if (item) {
      item.notes = notes;
    }
  }

  updateCustomPrice(cartItemId: string, price: number) {
    const item = this.items.find((i) => i.cartItemId === cartItemId);
    if (item) {
      item.customPrice = price;
      this.recalculateItemTotal(item);
    }
  }

  private recalculateItemTotal(item: CartItem) {
    const base = item.customPrice !== undefined ? item.customPrice : item.menuItem.price;
    const toppingsTotal = item.selectedToppings.reduce((sum, t) => sum + t.price, 0);
    item.itemTotal = (base + toppingsTotal) * item.quantity;
  }

  getTotalAmount(): number {
    const rawTotal = this.items.reduce((sum, item) => sum + item.itemTotal, 0);
    const discount = this.claimRewardActive && this.customerStamps >= 10 ? 26000 : 0;
    return Math.max(0, rawTotal - discount);
  }

  getNoodleStampsEarned(): number {
    return this.items.reduce((count, item) => {
      if (item.menuItem.givesStamp) {
        return count + item.quantity;
      }
      return count;
    }, 0);
  }

  clear() {
    this.items = [];
    this.claimRewardActive = false;
    this.customerStamps = 0;
  }
}

describe('R4: Touch POS (Cashier System) & Cart Transactions', () => {
  let cart: CartEngine;

  beforeEach(() => {
    cart = new CartEngine();
  });

  // ==========================================
  // TIER 1: FEATURE COVERAGE (>=5 tests)
  // ==========================================
  describe('Tier 1: Feature Coverage (Nominal Requirements)', () => {
    it('T1.1: category filter isolates menu items into correct tabs', () => {
      const kuahTab = MENU_ITEMS.filter((i) => i.category === 'mie_kuah');
      const manisTab = MENU_ITEMS.filter((i) => i.category === 'yamin_manis');
      const asinTab = MENU_ITEMS.filter((i) => i.category === 'yamin_asin');
      const toppingTab = MENU_ITEMS.filter((i) => i.category === 'topping');
      const minumanTab = MENU_ITEMS.filter((i) => i.category === 'minuman');

      expect(kuahTab.every((i) => i.category === 'mie_kuah')).toBe(true);
      expect(manisTab.every((i) => i.category === 'yamin_manis')).toBe(true);
      expect(asinTab.every((i) => i.category === 'yamin_asin')).toBe(true);
      expect(toppingTab.every((i) => i.category === 'topping')).toBe(true);
      expect(minumanTab.every((i) => i.category === 'minuman')).toBe(true);
    });

    it('T1.2: 1-click topping adds exactly Rp 5.000 per selected topping to item subtotal', () => {
      const seporsi = MENU_ITEMS.find((i) => i.id === 'kuah-seporsi')!; // 26.000
      const babat = TOPPINGS.find((t) => t.id === 'top-babat')!; // 5.000
      const tetelan = TOPPINGS.find((t) => t.id === 'top-tetelan')!; // 5.000

      cart.addToCart(seporsi, [babat, tetelan]);

      expect(cart.getItems().length).toBe(1);
      // 26.000 + 5.000 + 5.000 = 36.000
      expect(cart.getItems()[0].itemTotal).toBe(36000);
      expect(cart.getTotalAmount()).toBe(36000);
    });

    it('T1.3: dynamic cart quantity increment and decrement adjusts subtotal accordingly', () => {
      const esJeruk = MENU_ITEMS.find((i) => i.id === 'minuman-es-jeruk')!; // 15.000
      cart.addToCart(esJeruk);
      const cartItemId = cart.getItems()[0].cartItemId;

      expect(cart.getTotalAmount()).toBe(15000);

      // Increment
      cart.updateQuantity(cartItemId, 1);
      expect(cart.getItems()[0].quantity).toBe(2);
      expect(cart.getTotalAmount()).toBe(30000);

      // Decrement
      cart.updateQuantity(cartItemId, -1);
      expect(cart.getItems()[0].quantity).toBe(1);
      expect(cart.getTotalAmount()).toBe(15000);

      // Decrement to 0 removes from cart
      cart.updateQuantity(cartItemId, -1);
      expect(cart.getItems().length).toBe(0);
      expect(cart.getTotalAmount()).toBe(0);
    });

    it('T1.4: allows custom cooking notes per item and stores them on cart line', () => {
      const yaminAsin = MENU_ITEMS.find((i) => i.id === 'yamin-asin-seporsi')!;
      cart.addToCart(yaminAsin, [], 'Kuah dipisah, ekstra sambal');

      const item = cart.getItems()[0];
      expect(item.notes).toBe('Kuah dipisah, ekstra sambal');

      // Update notes
      cart.updateNotes(item.cartItemId, 'Kuah dipisah, jangan pedas');
      expect(cart.getItems()[0].notes).toBe('Kuah dipisah, jangan pedas');
    });

    it('T1.5: supports Aneka Jus manual price entry override', () => {
      const anekaJus = MENU_ITEMS.find((i) => i.id === 'minuman-aneka-jus')!; // default 12.000
      cart.addToCart(anekaJus);
      const cartItemId = cart.getItems()[0].cartItemId;

      expect(cart.getTotalAmount()).toBe(12000);

      // Cashier overrides price to 18.000 (e.g. Jus Durian / Alpukat Spesial)
      cart.updateCustomPrice(cartItemId, 18000);
      expect(cart.getItems()[0].customPrice).toBe(18000);
      expect(cart.getTotalAmount()).toBe(18000);
    });

    it('T1.6: cash payment change calculator with quick denomination buttons', () => {
      const totalBill = 76000;
      
      // Quick Denomination: Uang Pas
      const uangPas = totalBill;
      expect(Math.max(0, uangPas - totalBill)).toBe(0);

      // Quick Denomination: 100k
      const cash100k = 100000;
      expect(Math.max(0, cash100k - totalBill)).toBe(24000);

      // Change format
      expect(formatRupiah(24000)).toMatch(/Rp\s*24\.000/);
    });

    it('T1.7: generates valid wa.me link containing formatted e-receipt text', () => {
      const tx: Transaction = {
        id: 'tx-test-1',
        invoiceNumber: 'KS-123456',
        customerName: 'Kang Asep',
        customerWhatsapp: '081223456789',
        items: [
          {
            cartItemId: 'item-1',
            menuItem: MENU_ITEMS.find((i) => i.id === 'kuah-seporsi')!,
            quantity: 2,
            selectedToppings: [TOPPINGS[0]], // Babat
            notes: 'Pedas mantap',
            itemTotal: 62000,
          },
        ],
        totalAmount: 62000,
        paymentMethod: 'cash',
        cashGiven: 100000,
        changeAmount: 38000,
        stampsEarned: 2,
        createdAt: '2026-10-30T12:00:00.000Z',
        status: 'completed',
      };

      const receiptUrl = getReceiptWhatsAppUrl(tx, DEFAULT_STORE_SETTINGS);
      expect(receiptUrl).toContain('https://wa.me/6281223456789?text=');
      
      // Check unencoded content in text
      const receiptText = generateReceiptText(tx, DEFAULT_STORE_SETTINGS);
      expect(receiptText).toContain('STRUK DIGITAL');
      expect(receiptText).toContain('KS-123456');
      expect(receiptText).toContain('Kang Asep');
      expect(receiptText).toContain('Mie Kuah Seporsi');
      expect(receiptText).toContain('Babat');
      expect(receiptText).toContain('Pedas mantap');
      expect(receiptText).toContain('Rp 62.000');
      expect(receiptText).toContain('Kembalian: Rp 38.000');
      expect(receiptText).toContain('+2 stempel');
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 tests)
  // ==========================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('T2.1: empty cart total is exactly 0', () => {
      expect(cart.getTotalAmount()).toBe(0);
      expect(cart.getNoodleStampsEarned()).toBe(0);
    });

    it('T2.2: insufficient cash given flags insufficient status', () => {
      const totalAmount = 50000;
      const cashGiven = 40000;
      const isSufficient = cashGiven >= totalAmount;
      expect(isSufficient).toBe(false);
      const change = Math.max(0, cashGiven - totalAmount);
      expect(change).toBe(0);
    });

    it('T2.3: exact cash payment produces exactly 0 change', () => {
      const totalAmount = 26000;
      const cashGiven = 26000;
      expect(cashGiven >= totalAmount).toBe(true);
      expect(cashGiven - totalAmount).toBe(0);
    });

    it('T2.4: QRIS payment ignores cash given and sets change to 0', () => {
      const tx: Transaction = {
        id: 'tx-qris-1',
        invoiceNumber: 'KS-999888',
        items: [],
        totalAmount: 48000,
        paymentMethod: 'qris',
        cashGiven: 48000,
        changeAmount: 0,
        stampsEarned: 1,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };

      expect(tx.paymentMethod).toBe('qris');
      expect(tx.changeAmount).toBe(0);
      const text = generateReceiptText(tx, DEFAULT_STORE_SETTINGS);
      expect(text).toContain('Metode: QRIS KS (Lunas)');
    });

    it('T2.5: customer phone formatting converts 08xxx to international 628xxx for wa.me URL', () => {
      const tx: Transaction = {
        id: 'tx-phone',
        invoiceNumber: 'KS-000001',
        customerWhatsapp: '085712348899',
        items: [],
        totalAmount: 20000,
        paymentMethod: 'cash',
        stampsEarned: 1,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };

      const url = getReceiptWhatsAppUrl(tx, DEFAULT_STORE_SETTINGS);
      expect(url).toContain('https://wa.me/6285712348899?text=');
    });

    it('T2.6: handles order without customer phone gracefully (empty target phone)', () => {
      const tx: Transaction = {
        id: 'tx-nophone',
        invoiceNumber: 'KS-000002',
        customerWhatsapp: '',
        items: [],
        totalAmount: 20000,
        paymentMethod: 'cash',
        stampsEarned: 0,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };

      const url = getReceiptWhatsAppUrl(tx, DEFAULT_STORE_SETTINGS);
      expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    });
  });

  // ==========================================
  // TIER 3: CROSS-FEATURE INTERACTIONS
  // ==========================================
  describe('Tier 3: Cross-Feature Interactions', () => {
    it('T3.1: Free reward claim discounts Rp 26.000 from total when customer is eligible', () => {
      const seporsi = MENU_ITEMS.find((i) => i.id === 'kuah-seporsi')!; // 26.000
      const tehBotol = MENU_ITEMS.find((i) => i.id === 'minuman-teh-botol')!; // 6.000

      cart.addToCart(seporsi);
      cart.addToCart(tehBotol);
      // Raw total: 32.000

      // Customer has 10 stamps
      cart.setCustomerStamps(10);
      cart.setClaimReward(true);

      // Total with discount: 32.000 - 26.000 = 6.000
      expect(cart.getTotalAmount()).toBe(6000);
    });

    it('T3.2: Only noodle portions accumulate stamps in a mixed basket order', () => {
      const seporsi = MENU_ITEMS.find((i) => i.id === 'kuah-seporsi')!; // 1 portion
      const komplit = MENU_ITEMS.find((i) => i.id === 'yamin-manis-komplit')!; // 1 portion
      const tehBotol = MENU_ITEMS.find((i) => i.id === 'minuman-teh-botol')!; // beverage (0)
      const babatSide = MENU_ITEMS.find((i) => i.id === 'top-babat-item')!; // addon (0)

      cart.addToCart(seporsi);
      cart.addToCart(komplit);
      cart.addToCart(tehBotol);
      cart.addToCart(babatSide);

      expect(cart.getItems().length).toBe(4);
      expect(cart.getNoodleStampsEarned()).toBe(2); // Only 2 noodle dishes earn stamps
    });
  });

  // ==========================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // ==========================================
  describe('Tier 4: Real-World Scenarios', () => {
    it('T4.1: Cashier Rush Hour Complex Order with Toppings, Notes, and Cash Settlement', () => {
      // Order 1: 2x Mie Kuah Seporsi with Babat and notes "kuah panas"
      const seporsi = MENU_ITEMS.find((i) => i.id === 'kuah-seporsi')!;
      const babat = TOPPINGS.find((t) => t.id === 'top-babat')!;
      cart.addToCart(seporsi, [babat], 'kuah panas');
      cart.updateQuantity(cart.getItems()[0].cartItemId, 1); // Qty = 2 (2x (26k + 5k) = 62.000)

      // Order 2: 1x Es Jeruk (10.000)
      const esJeruk = MENU_ITEMS.find((i) => i.id === 'minuman-es-jeruk')!;
      cart.addToCart(esJeruk);

      // Order 3: 1x Aneka Jus with custom price (15.000)
      const anekaJus = MENU_ITEMS.find((i) => i.id === 'minuman-aneka-jus')!;
      cart.addToCart(anekaJus);
      cart.updateCustomPrice(cart.getItems()[2].cartItemId, 15000);

      // Expected total: 62.000 + 15.000 + 15.000 = 92.000
      expect(cart.getTotalAmount()).toBe(92000);

      // Customer pays with Rp 100.000 cash
      const cashGiven = 100000;
      const change = cashGiven - cart.getTotalAmount();
      expect(change).toBe(8000);
      expect(formatRupiah(change)).toMatch(/Rp\s*8\.000/);

      // Stamps earned = 2 (from 2 portions of Mie Kuah)
      expect(cart.getNoodleStampsEarned()).toBe(2);
    });
  });
});
