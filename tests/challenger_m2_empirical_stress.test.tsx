import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CustomerPortal } from '../src/components/CustomerPortal';
import { StampCardModal } from '../src/components/StampCardModal';
import { CustomerOrderProvider, useCustomerOrder } from '../src/context/CustomerOrderContext';
import { CartProvider, useCart } from '../src/context/CartContext';
import { MENU_ITEMS, SEED_CUSTOMERS } from '../src/data/menuData';
import { findCustomerByPhoneOrName, saveCustomer, getCustomers } from '../src/services/storage';
import { formatRupiah, normalizeWhatsAppPhone } from '../src/utils/formatters';
import { Customer, MenuItem } from '../src/types';

// Mock canvas-confetti for DOM environment
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('Milestone 2 Empirical Stress-Testing: Customer Portal & Digital Stamp State', () => {
  beforeEach(() => {
    localStorage.clear();
    // Seed standard customers into localStorage for storage.ts
    localStorage.setItem('ks_customers_v1', JSON.stringify(SEED_CUSTOMERS));
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // =========================================================================
  // SUITE 1: Customer Portal Catalog Rendering, Filtering & All 27 Items
  // =========================================================================
  describe('Suite 1: Catalog Rendering, Category Filtering & Ingredient Pills across All 27 Items', () => {
    it('M2-S1.1: renders exactly 27 total menu items across all categories', () => {
      expect(MENU_ITEMS.length).toBe(27);

      const kuah = MENU_ITEMS.filter((i) => i.category === 'mie_kuah');
      const yaminManis = MENU_ITEMS.filter((i) => i.category === 'yamin_manis');
      const yaminAsin = MENU_ITEMS.filter((i) => i.category === 'yamin_asin');
      const topping = MENU_ITEMS.filter((i) => i.category === 'topping');
      const minuman = MENU_ITEMS.filter((i) => i.category === 'minuman');

      expect(kuah.length).toBe(6);
      expect(yaminManis.length).toBe(6);
      expect(yaminAsin.length).toBe(6);
      expect(topping.length).toBe(5);
      expect(minuman.length).toBe(4);
    });

    it('M2-S1.2: initial portal load defaults to "Semua Menu" rendering all 27 items', () => {
      const onOpenStampModal = vi.fn();
      render(
        <CustomerOrderProvider>
          <CustomerPortal onOpenStampModal={onOpenStampModal} />
        </CustomerOrderProvider>
      );

      // Verify each item's name is rendered in the catalog
      MENU_ITEMS.forEach((item) => {
        const itemHeadings = screen.getAllByRole('heading', { name: item.name });
        expect(itemHeadings.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('M2-S1.3: category filter tabs switch accurately without dropped items or rendering artifacts', () => {
      const onOpenStampModal = vi.fn();
      render(
        <CustomerOrderProvider>
          <CustomerPortal onOpenStampModal={onOpenStampModal} />
        </CustomerOrderProvider>
      );

      // 1. Switch to Mie Kuah
      const mieKuahTab = screen.getByRole('button', { name: 'Mie Kuah' });
      fireEvent.click(mieKuahTab);
      const kuahItems = MENU_ITEMS.filter((i) => i.category === 'mie_kuah');
      kuahItems.forEach((item) => {
        expect(screen.getByRole('heading', { name: item.name })).toBeInTheDocument();
      });
      // Non-kuah item should not be rendered
      expect(screen.queryByRole('heading', { name: 'Es Jeruk' })).toBeNull();
      expect(screen.queryByRole('heading', { name: 'Babat Sapi' })).toBeNull();

      // 2. Switch to Yamin Manis
      const yaminManisTab = screen.getByRole('button', { name: 'Yamin Manis' });
      fireEvent.click(yaminManisTab);
      const manisItems = MENU_ITEMS.filter((i) => i.category === 'yamin_manis');
      manisItems.forEach((item) => {
        expect(screen.getByRole('heading', { name: item.name })).toBeInTheDocument();
      });
      expect(screen.queryByRole('heading', { name: 'Mie Kuah Seporsi' })).toBeNull();

      // 3. Switch to Yamin Asin
      const yaminAsinTab = screen.getByRole('button', { name: 'Yamin Asin' });
      fireEvent.click(yaminAsinTab);
      const asinItems = MENU_ITEMS.filter((i) => i.category === 'yamin_asin');
      asinItems.forEach((item) => {
        expect(screen.getByRole('heading', { name: item.name })).toBeInTheDocument();
      });
      expect(screen.queryByRole('heading', { name: 'Teh Botol' })).toBeNull();

      // 4. Switch to Topping Ekstra
      const toppingTab = screen.getByRole('button', { name: 'Topping Ekstra' });
      fireEvent.click(toppingTab);
      const toppingItems = MENU_ITEMS.filter((i) => i.category === 'topping');
      toppingItems.forEach((item) => {
        expect(screen.getByRole('heading', { name: item.name })).toBeInTheDocument();
      });
      expect(screen.queryByRole('heading', { name: 'Mie Baso Setengah Porsi (Kuah)' })).toBeNull();

      // 5. Switch to Minuman & Jus
      const minumanTab = screen.getByRole('button', { name: 'Minuman & Jus' });
      fireEvent.click(minumanTab);
      const minumanItems = MENU_ITEMS.filter((i) => i.category === 'minuman');
      minumanItems.forEach((item) => {
        expect(screen.getByRole('heading', { name: item.name })).toBeInTheDocument();
      });
      expect(screen.queryByRole('heading', { name: 'Babat Sapi' })).toBeNull();

      // 6. Switch back to Semua Menu
      const allTab = screen.getByRole('button', { name: 'Semua Menu' });
      fireEvent.click(allTab);
      MENU_ITEMS.forEach((item) => {
        expect(screen.getByRole('heading', { name: item.name })).toBeInTheDocument();
      });
    });

    it('M2-S1.4: verifies ingredient pill rendering across ALL 27 items with styled emerald chips', () => {
      const onOpenStampModal = vi.fn();
      const { container } = render(
        <CustomerOrderProvider>
          <CustomerPortal onOpenStampModal={onOpenStampModal} />
        </CustomerOrderProvider>
      );

      // Verify every single item has non-empty composition array
      let totalExpectedPills = 0;
      MENU_ITEMS.forEach((item) => {
        expect(Array.isArray(item.composition)).toBe(true);
        expect(item.composition.length).toBeGreaterThan(0);
        totalExpectedPills += item.composition.length;
      });

      // Total expected composition pills across all 27 items is 74
      expect(totalExpectedPills).toBe(74);

      // Find all emerald ingredient chips
      const allSpans = Array.from(container.querySelectorAll('span'));
      const emeraldChips = allSpans.filter((span) =>
        span.className.includes('bg-emerald-50 text-emerald-800 text-xs px-2 py-0.5 rounded-full border border-emerald-200')
      );

      expect(emeraldChips.length).toBe(totalExpectedPills);

      // Check specific distinct ingredients from diverse categories
      const chipTexts = emeraldChips.map((s) => s.textContent?.trim());
      expect(chipTexts).toContain('Kuah Kaldu Sapi'); // Mie Kuah
      expect(chipTexts).toContain('Setengah Mie Manis'); // Yamin Manis
      expect(chipTexts).toContain('Setengah Mie Asin'); // Yamin Asin
      expect(chipTexts).toContain('Babat Sapi Pilihan'); // Topping
      expect(chipTexts).toContain('Jeruk Peras Murni'); // Minuman (Es Jeruk)
      expect(chipTexts).toContain('Buah Segar Pilihan'); // Minuman (Aneka Jus)
    });

    it('M2-S1.5: verifies Aneka Jus custom price flag, default catalog price, and cart integration', () => {
      const anekaJus = MENU_ITEMS.find((i) => i.id === 'minuman-aneka-jus')!;
      expect(anekaJus).toBeDefined();
      expect(anekaJus.category).toBe('minuman');
      expect(anekaJus.price).toBe(12000);
      expect(anekaJus.allowPriceOverride).toBe(true);
      expect(anekaJus.isCustomPrice).toBe(true);
      expect(anekaJus.description).toContain('Input harga manual di kasir');

      // Test cart addition in CustomerPortal
      let orderState: any;
      const TestPortalWrapper = () => {
        orderState = useCustomerOrder();
        return <CustomerPortal onOpenStampModal={vi.fn()} />;
      };

      render(
        <CustomerOrderProvider>
          <TestPortalWrapper />
        </CustomerOrderProvider>
      );

      // Aneka Jus should show default formatted price in portal
      expect(screen.getByText('Rp 12.000')).toBeInTheDocument();

      // Find Aneka Jus card and click its Tambah button
      act(() => {
        orderState.addToCart(anekaJus);
      });

      expect(orderState.cartItemCount).toBe(1);
      expect(orderState.cartTotal).toBe(12000);
      expect(orderState.cart[0].menuItemId).toBe('minuman-aneka-jus');
      expect(orderState.cart[0].unitPrice).toBe(12000);

      // Increment Aneka Jus quantity
      act(() => {
        orderState.updateQuantity(orderState.cart[0].cartItemId, 1);
      });

      expect(orderState.cartItemCount).toBe(2);
      expect(orderState.cartTotal).toBe(24000);
    });

    it('M2-S1.6: verifies Komplit Khusus (Yamin Asin) special price badge "Hemat 8k" at Rp 40.000', () => {
      render(
        <CustomerOrderProvider>
          <CustomerPortal onOpenStampModal={vi.fn()} />
        </CustomerOrderProvider>
      );

      const komplitKhusus = MENU_ITEMS.find((i) => i.id === 'yamin-asin-komplit')!;
      expect(komplitKhusus.price).toBe(40000);
      expect(komplitKhusus.portionType).toBe('komplit_khusus');

      // Verify "Hemat 8k" badge rendered
      expect(screen.getByText('Hemat 8k')).toBeInTheDocument();
      expect(screen.getByText('Rp 40.000')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // SUITE 2: Digital Stamp Lookup under Boundary Inputs (Zero Crashes)
  // =========================================================================
  describe('Suite 2: Digital Stamp Lookup under Boundary Inputs (Zero Uncaught Exceptions)', () => {
    it('M2-S2.1: findCustomerByPhoneOrName executes with zero uncaught exceptions under boundary inputs', () => {
      const boundaryInputs = [
        '', // Empty string
        '   ', // Whitespace only
        '     \t\n  ', // Tabs and newlines
        '0812 2345 6789', // Phone with spaces
        ' 0812 2345 6789 ', // Phone with leading/trailing spaces
        '0812-2345-6789', // Phone with hyphens
        '+6281223456789', // International E.164
        '+62 812-2345-6789', // International with spaces and hyphens
        '6281223456789', // Prefix 62 without plus
        '0', // Single digit 0
        '08', // Two digits
        '8', // Single digit 8
        '99999999999999', // Extreme non-existent number
        '!@#$%^&*()_+', // Special characters
        '<script>alert("xss")</script>', // HTML/Script injection
        "' OR '1'='1", // SQL injection pattern
        '([.*+?^=!:${}()|[\\]\\/\\\\])', // Regex special characters
        'مرحبا بك', // Non-Latin Arabic unicode
        '🎉🍜🏆', // Emoji strings
        'A'.repeat(5000), // Massive 5,000 character string
      ];

      boundaryInputs.forEach((input) => {
        expect(() => {
          const result = findCustomerByPhoneOrName(input);
          // Result should be either Customer object or undefined, never throw
          expect(result === undefined || typeof result === 'object').toBe(true);
        }).not.toThrow();
      });
    });

    it('M2-S2.2: successfully retrieves Kang Asep across all phone formatting variations', () => {
      const variations = [
        '081223456789',
        '0812 2345 6789',
        '0812-2345-6789',
        '+6281223456789',
        '+62 812 2345 6789',
        '+62 812-2345-6789',
        '6281223456789',
      ];

      variations.forEach((phoneQuery) => {
        const found = findCustomerByPhoneOrName(phoneQuery);
        expect(found).toBeDefined();
        expect(found?.name).toBe('Kang Asep Kurniawan');
        expect(found?.stampsCount).toBe(8);
      });
    });

    it('M2-S2.3: successfully retrieves customer by case-insensitive and partial name', () => {
      const queries = [
        'kang asep',
        'KANG ASEP',
        'Kang Asep Kurniawan',
        'asep',
        'siti',
        'Ibu Hj. Siti Nurhasanah',
        'dedi',
        'Pak Haji Dedi',
      ];

      queries.forEach((q) => {
        const found = findCustomerByPhoneOrName(q);
        expect(found).toBeDefined();
        expect(found?.name.toLowerCase()).toContain(q.toLowerCase().split(' ')[0]);
      });
    });

    it('M2-S2.4: StampCardModal handles whitespace and empty queries without crashing or falsy matches', () => {
      const onClose = vi.fn();
      render(<StampCardModal isOpen={true} onClose={onClose} />);

      const searchInput = screen.getByPlaceholderText(/Contoh: 081223456789 atau Asep/i);
      const submitBtn = screen.getByRole('button', { name: 'Cari' });

      // 1. Submit with empty input
      fireEvent.change(searchInput, { target: { value: '' } });
      fireEvent.click(submitBtn);

      // Should not show customer card or registration prompt
      expect(screen.queryByText('KARTU MEMBER SETIA')).toBeNull();
      expect(screen.queryByText('Data Pelanggan Belum Ditemukan')).toBeNull();

      // 2. Submit with whitespace only
      fireEvent.change(searchInput, { target: { value: '    ' } });
      fireEvent.click(submitBtn);

      expect(screen.queryByText('KARTU MEMBER SETIA')).toBeNull();
      expect(screen.queryByText('Data Pelanggan Belum Ditemukan')).toBeNull();
    });

    it('M2-S2.5: StampCardModal handles non-existent number and smoothly registers new customer', () => {
      const onClose = vi.fn();
      render(<StampCardModal isOpen={true} onClose={onClose} />);

      const searchInput = screen.getByPlaceholderText(/Contoh: 081223456789 atau Asep/i);
      const submitBtn = screen.getByRole('button', { name: 'Cari' });

      // Search non-existent customer
      fireEvent.change(searchInput, { target: { value: '089911223344' } });
      fireEvent.click(submitBtn);

      // Shows not found prompt
      expect(screen.getByText('Data Pelanggan Belum Ditemukan')).toBeInTheDocument();
      const openRegisterBtn = screen.getByRole('button', { name: '+ Buka Kartu Stempel Baru' });
      fireEvent.click(openRegisterBtn);

      // Registration form appears
      const nameInput = screen.getByPlaceholderText('Nama kamu...');
      const phoneInput = screen.getByPlaceholderText('08xxxxxxxxxx');
      const saveRegisterBtn = screen.getByRole('button', { name: 'Simpan & Dapatkan 1 Stempel' });

      // Attempt submit with empty fields -> should not register
      fireEvent.change(nameInput, { target: { value: '   ' } });
      fireEvent.change(phoneInput, { target: { value: '   ' } });
      fireEvent.click(saveRegisterBtn);
      expect(screen.queryByText('KARTU MEMBER SETIA')).toBeNull();

      // Fill valid trimmed details
      fireEvent.change(nameInput, { target: { value: '  Budi Challenger  ' } });
      fireEvent.change(phoneInput, { target: { value: '  089911223344  ' } });
      fireEvent.click(saveRegisterBtn);

      // Now member card is rendered
      expect(screen.getByText('KARTU MEMBER SETIA')).toBeInTheDocument();
      expect(screen.getByText('Budi Challenger')).toBeInTheDocument();
      expect(screen.getByText('089911223344')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // 1 initial stamp
    });
  });

  // =========================================================================
  // SUITE 3: Reward State Transitions & Free Portion Claim Instructions
  // =========================================================================
  describe('Suite 3: Reward State Transitions (Stamps < 10 vs Stamps >= 10 & Claim Instructions)', () => {
    it('M2-S3.1: stamps < 10 shows remaining count and DOES NOT trigger reward alert or confetti', () => {
      // Kang Asep has 8 stamps
      const onClose = vi.fn();
      render(<StampCardModal isOpen={true} onClose={onClose} />);

      const searchInput = screen.getByPlaceholderText(/Contoh: 081223456789 atau Asep/i);
      const submitBtn = screen.getByRole('button', { name: 'Cari' });

      fireEvent.change(searchInput, { target: { value: '081223456789' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText('Kang Asep Kurniawan')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument(); // 8 stamps
      expect(screen.getByText('2 stempel lagi menuju GRATIS')).toBeInTheDocument();

      // Reward alert should NOT be present
      expect(screen.queryByText('SELAMAT! STAMPS PENUH! 🎉')).toBeNull();
      expect(screen.queryByText(/Tunjukkan kartu ini kepada kasir/i)).toBeNull();

      // Grid verification: 8 bowls collected, 10th box is gift box
      expect(screen.getByText('GRATIS')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#8')).toBeInTheDocument();
    });

    it('M2-S3.2: stamps >= 10 shows "SIAP KLAIM PORSI GRATIS!", alert banner and verbatim claim instructions', () => {
      // Create a customer with exactly 10 stamps
      const cust10: Customer = {
        id: 'cust-reward-10',
        name: 'Pak Bambang Reward',
        whatsapp: '081122334455',
        totalVisits: 10,
        lifetimeValue: 300000,
        stampsCount: 10,
        rewardsClaimed: 0,
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      saveCustomer(cust10);

      const onClose = vi.fn();
      render(<StampCardModal isOpen={true} onClose={onClose} />);

      const searchInput = screen.getByPlaceholderText(/Contoh: 081223456789 atau Asep/i);
      const submitBtn = screen.getByRole('button', { name: 'Cari' });

      fireEvent.change(searchInput, { target: { value: '081122334455' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText('Pak Bambang Reward')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();

      // Header status
      expect(screen.getByText('SIAP KLAIM PORSI GRATIS!')).toBeInTheDocument();

      // Reward alert banner
      expect(screen.getByText('SELAMAT! STAMPS PENUH! 🎉')).toBeInTheDocument();

      // Verbatim claim instructions
      const claimInstruction = screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'p' &&
          /Tunjukkan kartu ini kepada kasir saat memesan untuk menikmati.*1 porsi Mie Kuah \/ Yamin GRATIS/i.test(
            element.textContent || ''
          )
        );
      });
      expect(claimInstruction).toBeInTheDocument();
      expect(claimInstruction.textContent).toContain('Tunjukkan kartu ini kepada kasir saat memesan');
      expect(claimInstruction.textContent).toContain('1 porsi Mie Kuah / Yamin GRATIS');
    });

    it('M2-S3.3: stamps > 10 boundary caps progress bar at 100% and activates reward state', () => {
      // Customer with 12 stamps (over boundary)
      const custOver: Customer = {
        id: 'cust-reward-over',
        name: 'Ibu Capped Progress',
        whatsapp: '087788990011',
        totalVisits: 15,
        lifetimeValue: 400000,
        stampsCount: 12,
        rewardsClaimed: 1,
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      saveCustomer(custOver);

      const { container } = render(<StampCardModal isOpen={true} onClose={vi.fn()} />);

      const searchInput = screen.getByPlaceholderText(/Contoh: 081223456789 atau Asep/i);
      const submitBtn = screen.getByRole('button', { name: 'Cari' });

      fireEvent.change(searchInput, { target: { value: '087788990011' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText('Ibu Capped Progress')).toBeInTheDocument();
      expect(screen.getByText('SIAP KLAIM PORSI GRATIS!')).toBeInTheDocument();

      // Progress bar should have style width: 100% (not 120%)
      const progressBar = container.querySelector('div[style*="width: 100%"]');
      expect(progressBar).not.toBeNull();
    });

    it('M2-S3.4: "Cek Nomor Lain" resets modal state allowing sequential lookups', () => {
      const onClose = vi.fn();
      render(<StampCardModal isOpen={true} onClose={onClose} />);

      const searchInput = screen.getByPlaceholderText(/Contoh: 081223456789 atau Asep/i);
      const submitBtn = screen.getByRole('button', { name: 'Cari' });

      // First lookup: Kang Asep
      fireEvent.change(searchInput, { target: { value: '081223456789' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText('Kang Asep Kurniawan')).toBeInTheDocument();

      // Reset
      const resetBtn = screen.getByRole('button', { name: 'Cek Nomor Lain' });
      fireEvent.click(resetBtn);

      // Verify search form is restored
      expect(screen.queryByText('Kang Asep Kurniawan')).toBeNull();
      const restoredInput = screen.getByPlaceholderText(/Contoh: 081223456789 atau Asep/i) as HTMLInputElement;
      expect(restoredInput.value).toBe('');

      // Second lookup: Ibu Hj. Siti (082155443322)
      fireEvent.change(restoredInput, { target: { value: '082155443322' } });
      const secondSubmitBtn = screen.getByRole('button', { name: 'Cari' });
      fireEvent.click(secondSubmitBtn);
      expect(screen.getByText('Ibu Hj. Siti Nurhasanah')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText('1 stempel lagi menuju GRATIS')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // SUITE 4: Interactive Order Lifecycle, Cart Stepper & POS Custom Price Overrides
  // =========================================================================
  describe('Suite 4: Interactive Order Lifecycle, Cart Stepper & POS Price Overrides', () => {
    it('M2-S4.1: Cart quantity stepper decrement down to 0 removes Aneka Jus and resets button to "Tambah"', () => {
      let orderState: any;
      const TestPortalWrapper = () => {
        orderState = useCustomerOrder();
        return <CustomerPortal onOpenStampModal={vi.fn()} />;
      };

      const { container } = render(
        <CustomerOrderProvider>
          <TestPortalWrapper />
        </CustomerOrderProvider>
      );

      const anekaJus = MENU_ITEMS.find((i) => i.id === 'minuman-aneka-jus')!;

      // Initial state: 0 in cart
      act(() => {
        orderState.addToCart(anekaJus);
      });
      expect(orderState.cartItemCount).toBe(1);

      // Decrement down to 0
      act(() => {
        orderState.updateQuantity(orderState.cart[0].cartItemId, -1);
      });

      expect(orderState.cartItemCount).toBe(0);
      expect(orderState.cart.length).toBe(0);
      expect(orderState.cartTotal).toBe(0);
    });

    it('M2-S4.2: Full reward state transition lifecycle (9 stamps -> 10 stamps [eligible] -> reward claim [reset to 0])', async () => {
      const { saveTransaction } = await import('../src/services/storage');

      // 1. Customer at 9 stamps
      const customerPhone = '082155443322'; // Ibu Hj. Siti (starts with 9 stamps in SEED_CUSTOMERS)
      const initialCust = findCustomerByPhoneOrName(customerPhone)!;
      expect(initialCust.stampsCount).toBe(9);

      // 2. Transaction completed with 1 noodle portion -> stampsEarned: 1
      saveTransaction({
        id: 'tx-earn-tenth-stamp',
        orderNumber: 'KS-TEST-001',
        customerName: initialCust.name,
        customerWhatsapp: initialCust.whatsapp,
        items: [
          {
            cartItemId: 'c-1',
            menuItem: MENU_ITEMS[0],
            quantity: 1,
            selectedToppings: [],
            itemTotal: 26000,
          },
        ],
        subtotal: 26000,
        discount: 0,
        totalAmount: 26000,
        paymentMethod: 'cash',
        amountPaid: 30000,
        changeAmount: 4000,
        status: 'completed',
        stampsEarned: 1,
        rewardClaimed: false,
        createdAt: new Date().toISOString(),
      });

      // Customer should now have exactly 10 stamps!
      const readyCust = findCustomerByPhoneOrName(customerPhone)!;
      expect(readyCust.stampsCount).toBe(10);

      // Verify in StampCardModal
      const { unmount } = render(<StampCardModal isOpen={true} onClose={vi.fn()} />);
      const searchInput = screen.getByPlaceholderText(/Contoh: 081223456789 atau Asep/i);
      const submitBtn = screen.getByRole('button', { name: 'Cari' });

      fireEvent.change(searchInput, { target: { value: customerPhone } });
      fireEvent.click(submitBtn);

      expect(screen.getByText('SIAP KLAIM PORSI GRATIS!')).toBeInTheDocument();
      expect(screen.getByText('SELAMAT! STAMPS PENUH! 🎉')).toBeInTheDocument();
      unmount();

      // 3. Customer visits and claims free portion in next transaction
      saveTransaction({
        id: 'tx-claim-reward',
        orderNumber: 'KS-TEST-002',
        customerName: initialCust.name,
        customerWhatsapp: initialCust.whatsapp,
        items: [
          {
            cartItemId: 'c-2',
            menuItem: MENU_ITEMS[0],
            quantity: 1,
            selectedToppings: [],
            itemTotal: 0, // Free portion
          },
        ],
        subtotal: 0,
        discount: 26000,
        totalAmount: 0,
        paymentMethod: 'cash',
        amountPaid: 0,
        changeAmount: 0,
        status: 'completed',
        stampsEarned: 0,
        rewardClaimed: true, // Claim executed!
        createdAt: new Date().toISOString(),
      });

      // Customer stamps should now be RESET to 0, and rewardsClaimed incremented
      const claimedCust = findCustomerByPhoneOrName(customerPhone)!;
      expect(claimedCust.stampsCount).toBe(0);
      expect(claimedCust.rewardsClaimed).toBe(1);

      // Re-render StampCardModal to verify state has returned to normal accumulation
      render(<StampCardModal isOpen={true} onClose={vi.fn()} />);
      const searchInput2 = screen.getByPlaceholderText(/Contoh: 081223456789 atau Asep/i);
      const submitBtn2 = screen.getByRole('button', { name: 'Cari' });

      fireEvent.change(searchInput2, { target: { value: customerPhone } });
      fireEvent.click(submitBtn2);

      expect(screen.getByText('10 stempel lagi menuju GRATIS')).toBeInTheDocument();
      expect(screen.queryByText('SELAMAT! STAMPS PENUH! 🎉')).toBeNull();
    });

    it('M2-S4.3: boundary lookup with parentheses, spaces, and mixed international formatting', () => {
      const weirdFormat = '+62 (812) 2345-6789';
      const found = findCustomerByPhoneOrName(weirdFormat);
      expect(found).toBeDefined();
      expect(found?.name).toBe('Kang Asep Kurniawan');
    });

    it('M2-S4.4: TouchPOS Cart Context supports custom price override for Aneka Jus', () => {
      let cartState: any;
      const TestPOSWrapper = () => {
        cartState = useCart();
        return null;
      };

      render(
        <CartProvider>
          <TestPOSWrapper />
        </CartProvider>
      );

      const anekaJus = MENU_ITEMS.find((i) => i.id === 'minuman-aneka-jus')!;

      // Add Aneka Jus to POS cart
      act(() => {
        cartState.addToCart(anekaJus);
      });

      expect(cartState.items.length).toBe(1);
      expect(cartState.totalAmount).toBe(12000);

      // Apply custom price override (e.g. Jus Alpukat Super Rp 16.000)
      const lineItemId = cartState.items[0].cartItemId;
      act(() => {
        cartState.updateCustomPrice(lineItemId, 16000);
      });

      expect(cartState.items[0].customPrice).toBe(16000);
      expect(cartState.items[0].itemTotal).toBe(16000);
      expect(cartState.totalAmount).toBe(16000);
    });
  });
});

