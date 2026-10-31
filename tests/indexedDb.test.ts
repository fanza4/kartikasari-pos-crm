import { describe, it, expect, beforeEach } from 'vitest';
import {
  initIndexedDB,
  getStoredMenu,
  saveStoredMenuItem,
  getStoredTransactions,
  saveStoredTransaction,
  getStoredTransactionById,
  getStoredCustomers,
  saveStoredCustomer,
  findStoredCustomerByPhone,
  getStoredSettings,
  saveStoredSettings,
  getSyncQueue,
  addToSyncQueue,
  updateSyncQueueItem,
  removeSyncQueueItem,
  clearCompletedSyncQueue,
} from '../src/lib/indexedDb';
import { Transaction, Customer, StoreSettings } from '../src/types';

describe('IndexedDB Persistence Layer', () => {
  beforeEach(async () => {
    await initIndexedDB();
  });

  it('initializes and returns menu items', async () => {
    const menu = await getStoredMenu();
    expect(menu.length).toBeGreaterThan(0);
    expect(menu.some((item) => item.id === 'kuah-seporsi')).toBe(true);
  });

  it('saves and updates menu item', async () => {
    const testItem = {
      id: 'test-mie-special',
      name: 'Mie Spesial Test',
      category: 'mie_kuah' as const,
      price: 32000,
      composition: ['Mie', 'Baso Test'],
      isNoodlePortion: true,
      isAvailable: true,
      image: '/menu/mie-kuah.svg',
      description: 'Test dish',
    };

    await saveStoredMenuItem(testItem);
    const menu = await getStoredMenu();
    const found = menu.find((i) => i.id === 'test-mie-special');
    expect(found).toBeDefined();
    expect(found?.price).toBe(32000);
  });

  it('persists and retrieves transactions in reverse chronological order', async () => {
    const tx1: Transaction = {
      id: 'tx-test-1',
      invoiceNumber: 'INV-001',
      timestamp: '2026-10-30T10:00:00.000Z',
      items: [],
      totalAmount: 26000,
      paymentMethod: 'cash',
      amountPaid: 30000,
      change: 4000,
      stampsAwarded: 1,
      synced: false,
    };

    const tx2: Transaction = {
      id: 'tx-test-2',
      invoiceNumber: 'INV-002',
      timestamp: '2026-10-30T11:00:00.000Z',
      items: [],
      totalAmount: 48000,
      paymentMethod: 'qris',
      amountPaid: 48000,
      change: 0,
      stampsAwarded: 1,
      synced: true,
    };

    await saveStoredTransaction(tx1);
    await saveStoredTransaction(tx2);

    const transactions = await getStoredTransactions();
    expect(transactions.length).toBeGreaterThanOrEqual(2);
    // tx2 is later, so it should appear before tx1
    const idx2 = transactions.findIndex((t) => t.id === 'tx-test-2');
    const idx1 = transactions.findIndex((t) => t.id === 'tx-test-1');
    expect(idx2).toBeLessThan(idx1);

    const single = await getStoredTransactionById('tx-test-1');
    expect(single?.totalAmount).toBe(26000);
  });

  it('persists and finds customer by phone number', async () => {
    const customer: Customer = {
      id: 'cust-test-123',
      name: 'Pak Budi Hartono',
      phone: '081987654321',
      whatsapp: '081987654321',
      totalVisits: 5,
      lifetimeValue: 150000,
      stampsCount: 5,
      lastVisitDate: new Date().toISOString(),
      segment: 'VIP',
    };

    await saveStoredCustomer(customer);
    const found = await findStoredCustomerByPhone('081987654321');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Pak Budi Hartono');
  });

  it('manages store settings', async () => {
    const current = await getStoredSettings();
    expect(current).toBeDefined();

    const updated: StoreSettings = {
      ...current,
      storeName: 'Mie Baso & Aneka Jus Kartika Sari (Updated)',
    };

    await saveStoredSettings(updated);
    const retrieved = await getStoredSettings();
    expect(retrieved.storeName).toBe('Mie Baso & Aneka Jus Kartika Sari (Updated)');
  });

  it('operates sync queue CRUD seamlessly', async () => {
    const queued = await addToSyncQueue({
      type: 'transaction',
      action: 'insert',
      payload: { id: 'sample-tx' },
    });

    expect(queued.id).toBeDefined();
    expect(queued.status).toBe('pending');
    expect(queued.retryCount).toBe(0);

    let queue = await getSyncQueue();
    expect(queue.some((i) => i.id === queued.id)).toBe(true);

    await updateSyncQueueItem(queued.id, { status: 'completed' });
    queue = await getSyncQueue();
    const updated = queue.find((i) => i.id === queued.id);
    expect(updated?.status).toBe('completed');

    await clearCompletedSyncQueue();
    queue = await getSyncQueue();
    expect(queue.some((i) => i.id === queued.id)).toBe(false);
  });
});
