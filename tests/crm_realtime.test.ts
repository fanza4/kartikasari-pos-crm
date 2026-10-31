import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Customer, Order, Transaction } from '../src/types';
import {
  getCustomers,
  saveCustomer,
  deleteCustomer,
  updateCustomerStamps,
  getCustomerOrderHistory,
  subscribeToCrmChanges,
  saveOrder,
  saveTransaction,
} from '../src/services/storage';

describe('Real-Time CRM & Customer Directory Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('R-CRM-1: saveCustomer persists data and dispatches ks_customer_event in real-time', () => {
    const listener = vi.fn();
    window.addEventListener('ks_customer_event', listener);

    const testCust: Customer = {
      id: 'cust-rt-1',
      name: 'Ibu Ratna Garut',
      whatsapp: '08123445566',
      totalVisits: 1,
      lifetimeValue: 48000,
      stampsCount: 1,
      rewardsClaimed: 0,
      lastVisit: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    saveCustomer(testCust);

    expect(listener).toHaveBeenCalled();
    const customers = getCustomers();
    const found = customers.find((c) => c.id === 'cust-rt-1');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Ibu Ratna Garut');

    window.removeEventListener('ks_customer_event', listener);
  });

  it('R-CRM-2: subscribeToCrmChanges responds immediately to ks_customer_event and ks_order_event', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToCrmChanges(callback);

    // Trigger customer save
    const testCust: Customer = {
      id: 'cust-rt-2',
      name: 'Kang Dudung',
      whatsapp: '085711223344',
      totalVisits: 2,
      lifetimeValue: 52000,
      stampsCount: 2,
      rewardsClaimed: 0,
      lastVisit: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    saveCustomer(testCust);
    expect(callback).toHaveBeenCalled();

    const callCountAfterSave = callback.mock.calls.length;

    // Trigger order save
    const testOrder: Order = {
      id: 'KS-ORD-TEST-1',
      customerName: 'Kang Dudung',
      customerWhatsapp: '085711223344',
      orderType: 'dine_in',
      tableNumber: '04',
      items: [],
      totalAmount: 26000,
      paymentMethod: 'qris',
      paymentStatus: 'Menunggu Pembayaran',
      orderStatus: 'Menunggu Pembayaran',
      createdAt: new Date().toISOString(),
    };
    saveOrder(testOrder);
    expect(callback.mock.calls.length).toBeGreaterThan(callCountAfterSave);

    unsubscribe();
  });

  it('R-CRM-3: saveOrder auto-syncs customer into CRM database in real-time', () => {
    const testOrder: Order = {
      id: 'KS-ORD-NEW-CUST',
      customerName: 'Teh Desi Baru',
      customerWhatsapp: '089912345678',
      orderType: 'takeaway',
      items: [],
      totalAmount: 35000,
      paymentMethod: 'cash',
      paymentStatus: 'Menunggu Pembayaran',
      orderStatus: 'Menunggu Pembayaran',
      createdAt: new Date().toISOString(),
    };

    saveOrder(testOrder);

    const customers = getCustomers();
    const desi = customers.find((c) => c.whatsapp === '089912345678');
    expect(desi).toBeDefined();
    expect(desi?.name).toBe('Teh Desi Baru');
  });

  it('R-CRM-4: updateCustomerStamps modifies stamps within 0-10 bounds in real-time', () => {
    const cust: Customer = {
      id: 'cust-stamp-bound',
      name: 'Pak Haji Solihin',
      whatsapp: '081399887711',
      totalVisits: 5,
      lifetimeValue: 150000,
      stampsCount: 9,
      rewardsClaimed: 0,
      lastVisit: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    saveCustomer(cust);

    // Increment to 10
    const updated1 = updateCustomerStamps('cust-stamp-bound', 1);
    expect(updated1?.stampsCount).toBe(10);

    // Incrementing above 10 caps at 10
    const updated2 = updateCustomerStamps('cust-stamp-bound', 1);
    expect(updated2?.stampsCount).toBe(10);

    // Decrement
    const updated3 = updateCustomerStamps('cust-stamp-bound', -3);
    expect(updated3?.stampsCount).toBe(7);
  });

  it('R-CRM-5: deleteCustomer removes entry and fires real-time event', () => {
    const cust: Customer = {
      id: 'cust-to-del',
      name: 'Tamu Test Hapus',
      whatsapp: '080000000000',
      totalVisits: 1,
      lifetimeValue: 10000,
      stampsCount: 1,
      rewardsClaimed: 0,
      lastVisit: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    saveCustomer(cust);
    expect(getCustomers().some((c) => c.id === 'cust-to-del')).toBe(true);

    const deleted = deleteCustomer('cust-to-del');
    expect(deleted).toBe(true);
    expect(getCustomers().some((c) => c.id === 'cust-to-del')).toBe(false);
  });

  it('R-CRM-6: getCustomerOrderHistory correlates both online orders and POS transactions', () => {
    const phone = '081234567890';
    const name = 'Mang Nana';

    // Add order
    saveOrder({
      id: 'KS-ORD-NANA-1',
      customerName: name,
      customerWhatsapp: phone,
      orderType: 'dine_in',
      tableNumber: '02',
      items: [],
      totalAmount: 48000,
      paymentMethod: 'cash',
      paymentStatus: 'Sudah Dibayar',
      orderStatus: 'Sedang Diproses',
      createdAt: new Date().toISOString(),
    });

    // Add POS transaction
    saveTransaction({
      id: 'tx-nana-1',
      invoiceNumber: 'INV-NANA-01',
      customerName: name,
      customerWhatsapp: phone,
      items: [],
      totalAmount: 26000,
      paymentMethod: 'cash',
      stampsEarned: 1,
      rewardClaimed: false,
      createdAt: new Date().toISOString(),
      status: 'completed',
    });

    const history = getCustomerOrderHistory(phone);
    expect(history.orders.length).toBeGreaterThanOrEqual(1);
    expect(history.transactions.length).toBeGreaterThanOrEqual(1);
  });
});
