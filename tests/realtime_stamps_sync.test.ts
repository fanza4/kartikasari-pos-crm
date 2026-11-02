import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveOrder,
  getOrders,
  findCustomerByPhoneOrName,
  getCustomers,
  saveCustomer,
  calculateOrderStamps,
} from '../src/services/storage';
import { mapRowToCustomer, mapCustomerToRow } from '../src/services/supabaseCustomers';
import { Order, Customer } from '../src/types';

describe('Real-time Stamp Loyalty & Order Sync Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('calculates noodle and bakso portions accurately for loyalty stamps', () => {
    const testOrder: Order = {
      id: 'KS-TEST-001',
      customerName: 'Muhammad Fanza Yuseftian',
      customerWhatsapp: '08998022630',
      orderType: 'dine_in',
      totalAmount: 52000,
      paymentMethod: 'cash',
      paymentStatus: 'Menunggu Pembayaran',
      orderStatus: 'Pesanan Baru',
      createdAt: new Date().toISOString(),
      items: [
        {
          cartItemId: 'kuah-seporsi-std',
          menuItemId: 'kuah-seporsi',
          name: 'Mie Kuah Seporsi',
          category: 'mie_kuah',
          unitPrice: 26000,
          quantity: 2,
          subtotal: 52000,
          givesStamp: true,
          selectedToppings: [],
        },
        {
          cartItemId: 'minuman-teh-botol-std',
          menuItemId: 'minuman-teh-botol',
          name: 'Teh Botol',
          category: 'minuman',
          unitPrice: 6000,
          quantity: 2,
          subtotal: 12000,
          givesStamp: false,
          selectedToppings: [],
        },
      ],
    };

    const stamps = calculateOrderStamps(testOrder);
    expect(stamps).toBe(2);
  });

  it('awards stamps immediately upon paid order and records tracking id', () => {
    const paidOrder: Order = {
      id: 'KS-TEST-PAID-01',
      customerName: 'Pelanggan Baru Uji Coba',
      customerWhatsapp: '081999888777',
      orderType: 'dine_in',
      totalAmount: 52000,
      paymentMethod: 'cash',
      paymentStatus: 'Sudah Dibayar',
      orderStatus: 'Sedang Diproses',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      items: [
        {
          cartItemId: 'kuah-seporsi-std',
          menuItemId: 'kuah-seporsi',
          name: 'Mie Kuah Seporsi',
          category: 'mie_kuah',
          unitPrice: 26000,
          quantity: 2,
          subtotal: 52000,
          givesStamp: true,
          selectedToppings: [],
        },
      ],
    };

    saveOrder(paidOrder);

    const cust = findCustomerByPhoneOrName('081999888777');
    expect(cust).toBeDefined();
    expect(cust?.name).toBe('Pelanggan Baru Uji Coba');
    expect(cust?.stampsCount).toBe(2);
    expect(cust?.stampsOrdersTracked).toContain('KS-TEST-PAID-01');

    // Saving again should NOT double-credit stamps
    saveOrder(paidOrder);
    const custAfterReSave = findCustomerByPhoneOrName('081999888777');
    expect(custAfterReSave?.stampsCount).toBe(2);
  });

  it('finds customer by name case-insensitively or phone in 08/62 formats', () => {
    const testCust: Customer = {
      id: 'cust-fanza-test',
      name: 'Muhammad Fanza Yuseftian',
      whatsapp: '08998022630',
      phone: '08998022630',
      totalVisits: 2,
      lifetimeValue: 52000,
      stampsCount: 2,
      rewardsClaimed: 0,
    };
    saveCustomer(testCust);

    // Search by full name
    expect(findCustomerByPhoneOrName('Muhammad Fanza Yuseftian')).toBeDefined();
    // Search by partial lower-case name
    expect(findCustomerByPhoneOrName('fanza')).toBeDefined();
    // Search by standard phone
    expect(findCustomerByPhoneOrName('08998022630')).toBeDefined();
    // Search by 62 prefix phone
    expect(findCustomerByPhoneOrName('628998022630')).toBeDefined();
  });

  it('correctly maps Supabase rows to Customer model and vice versa', () => {
    const row = {
      id: 'cust-cloud-1',
      name: 'Muhammad Fanza Yuseftian',
      phone: '08998022630',
      whatsapp: '08998022630',
      total_visits: 3,
      lifetime_value: 78000,
      stamps_count: 3,
      rewards_claimed: 0,
      last_visit: '2026-11-02T02:00:00.000Z',
      last_visit_date: '2026-11-02T02:00:00.000Z',
      segment: 'Pelanggan Baru',
      created_at: '2026-11-01T00:00:00.000Z',
    };

    const customer = mapRowToCustomer(row);
    expect(customer.id).toBe('cust-cloud-1');
    expect(customer.name).toBe('Muhammad Fanza Yuseftian');
    expect(customer.stampsCount).toBe(3);
    expect(customer.lifetimeValue).toBe(78000);

    const backToRow = mapCustomerToRow(customer);
    expect(backToRow.id).toBe('cust-cloud-1');
    expect(backToRow.stamps_count).toBe(3);
    expect(backToRow.total_visits).toBe(3);
  });
});
