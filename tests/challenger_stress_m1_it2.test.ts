import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  normalizePhone,
  findStoredCustomerByPhone,
  saveStoredCustomer,
  getStoredCustomers,
  saveStoredTransaction,
  getStoredTransactions,
  getStoredTransactionById,
  saveStoredMenuItem,
  getStoredMenu,
  saveStoredSettings,
  getStoredSettings,
  addToSyncQueue,
  getSyncQueue,
  updateSyncQueueItem,
  removeSyncQueueItem,
  clearCompletedSyncQueue,
  clearFailedSyncQueue,
  initIndexedDB,
} from '../src/lib/indexedDb';
import { Customer, Transaction, MenuItem, StoreSettings } from '../src/types';

describe('Adversarial Challenger Suite: Zero-Crash IDB & Phone Normalization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // SECTION 1: Phone Normalization Exhaustive Equivalence & Collision Testing
  // =========================================================================
  describe('Adversarial Phone Normalization & Search Integrity', () => {
    const rawNumber = '81298765432';
    const canonical = '6281298765432';

    const testFormats = [
      { name: 'Standard national 08...', input: '081298765432', expected: canonical },
      { name: 'Direct international 628...', input: '6281298765432', expected: canonical },
      { name: 'E.164 plus prefix +628...', input: '+6281298765432', expected: canonical },
      { name: 'Formatted with spaces +62 812 9876 5432', input: '+62 812 9876 5432', expected: canonical },
      { name: 'Formatted with hyphens 0812-9876-5432', input: '0812-9876-5432', expected: canonical },
      { name: 'Formatted with parens (0812) 9876-5432', input: '(0812) 9876-5432', expected: canonical },
      { name: 'Short prefix 8...', input: '81298765432', expected: canonical },
      { name: 'Redundant zero typo +6208...', input: '+62081298765432', expected: canonical },
      { name: 'Redundant zero typo without plus 6208...', input: '62081298765432', expected: canonical },
      { name: 'Whitespace padding', input: '   081298765432   ', expected: canonical },
    ];

    testFormats.forEach(({ name, input, expected }) => {
      it(`normalizePhone correctly maps: ${name} (${input}) -> ${expected}`, () => {
        expect(normalizePhone(input)).toBe(expected);
      });
    });

    it('handles edge case inputs gracefully without throwing', () => {
      expect(normalizePhone('')).toBe('');
      expect(normalizePhone(null as any)).toBe('');
      expect(normalizePhone(undefined as any)).toBe('');
      expect(normalizePhone('abc!@#$')).toBe('');
      expect(normalizePhone('0')).toBe('62');
    });

    it('cross-verifies bidirectional lookup: stored under one format, queried under all other formats', async () => {
      // Store customer with local 08 format
      const customerA: Customer = {
        id: 'cust-bidirectional-08',
        name: 'Pak Budi Hartono',
        phone: '081298765432',
        whatsapp: '081298765432',
        totalVisits: 5,
        lifetimeValue: 150000,
        stampsCount: 5,
        lastVisitDate: new Date().toISOString(),
        segment: 'Pelanggan Baru',
      };
      await saveStoredCustomer(customerA);

      for (const { input } of testFormats) {
        const found = await findStoredCustomerByPhone(input);
        expect(found, `Failed to find customer when querying with format: "${input}"`).toBeDefined();
        expect(found?.id).toBe(customerA.id);
      }

      // Store another customer with international +62 format
      const customerB: Customer = {
        id: 'cust-bidirectional-plus62',
        name: 'Ibu Ratna Sari',
        phone: '+62 878-1122-3344',
        whatsapp: '+62 878-1122-3344',
        totalVisits: 12,
        lifetimeValue: 450000,
        stampsCount: 2,
        lastVisitDate: new Date().toISOString(),
        segment: 'VIP',
      };
      await saveStoredCustomer(customerB);

      expect((await findStoredCustomerByPhone('087811223344'))?.id).toBe(customerB.id);
      expect((await findStoredCustomerByPhone('6287811223344'))?.id).toBe(customerB.id);
      expect((await findStoredCustomerByPhone('87811223344'))?.id).toBe(customerB.id);
      expect((await findStoredCustomerByPhone('+62087811223344'))?.id).toBe(customerB.id);
    });

    it('rejects false positives: different numbers with similar digits do NOT cross-match', async () => {
      const cust1: Customer = {
        id: 'cust-diff-1',
        name: 'Customer 1',
        phone: '081211112222',
        whatsapp: '081211112222',
        totalVisits: 1,
        lifetimeValue: 20000,
        stampsCount: 1,
        lastVisitDate: new Date().toISOString(),
        segment: 'Pelanggan Baru',
      };
      const cust2: Customer = {
        id: 'cust-diff-2',
        name: 'Customer 2',
        phone: '081211112223', // Last digit differs
        whatsapp: '081211112223',
        totalVisits: 2,
        lifetimeValue: 40000,
        stampsCount: 2,
        lastVisitDate: new Date().toISOString(),
        segment: 'Pelanggan Baru',
      };

      await saveStoredCustomer(cust1);
      await saveStoredCustomer(cust2);

      const res1 = await findStoredCustomerByPhone('081211112222');
      expect(res1?.id).toBe(cust1.id);

      const res2 = await findStoredCustomerByPhone('081211112223');
      expect(res2?.id).toBe(cust2.id);

      const resNotFound = await findStoredCustomerByPhone('081211112224');
      expect(resNotFound).toBeUndefined();
    });

    it('guards against trivial short queries (< 4 digits) to prevent accidental mass-matching', async () => {
      expect(await findStoredCustomerByPhone('08')).toBeUndefined();
      expect(await findStoredCustomerByPhone('62')).toBeUndefined();
      expect(await findStoredCustomerByPhone('8')).toBeUndefined();
      expect(await findStoredCustomerByPhone('')).toBeUndefined();
    });
  });

  // =========================================================================
  // SECTION 2: Simulated IDB Failures & Memory Fallback Stress
  // =========================================================================
  describe('Simulated IDB Exceptions & Zero-Crash Resilience', () => {
    it('handles simulated openDB rejection across ALL store operations without uncaught exceptions', async () => {
      // Isolate module with openDB rejected
      vi.resetModules();
      (window as any).indexedDB = {};

      vi.doMock('idb', () => ({
        openDB: vi.fn().mockRejectedValue(new Error('QuotaExceededError: All disk quota consumed')),
      }));

      const idb = await import('../src/lib/indexedDb');

      // 1. initIndexedDB does not throw
      await expect(idb.initIndexedDB()).resolves.toBeUndefined();

      // 2. Menu operations
      const testItem: MenuItem = {
        id: 'adversarial-menu-1',
        name: 'Mie Baso Uji Crash',
        category: 'mie_kuah',
        price: 26000,
        composition: ['Mie', 'Baso Urat'],
        isNoodlePortion: true,
        isAvailable: true,
        image: '/menu/kuah.svg',
        description: 'Test dish',
      };
      await expect(idb.saveStoredMenuItem(testItem)).resolves.toBeUndefined();
      const menu = await idb.getStoredMenu();
      expect(menu.some((m) => m.id === testItem.id)).toBe(true);

      // 3. Transaction operations - saves cleanly to memory fallback
      const testTx: Transaction = {
        id: 'adversarial-tx-crash-1',
        timestamp: new Date().toISOString(),
        items: [],
        totalAmount: 52000,
        paymentMethod: 'cash',
        amountPaid: 60000,
        change: 8000,
        stampsAwarded: 2,
        synced: false,
      };
      await expect(idb.saveStoredTransaction(testTx)).resolves.toBeUndefined();
      const txs = await idb.getStoredTransactions();
      expect(txs.some((t) => t.id === testTx.id)).toBe(true);

      const singleTx = await idb.getStoredTransactionById(testTx.id);
      expect(singleTx).toBeDefined();
      expect(singleTx?.id).toBe(testTx.id);

      // 4. Customer operations
      const testCust: Customer = {
        id: 'adversarial-cust-crash-1',
        name: 'Adversarial Customer',
        phone: '081299990001',
        whatsapp: '081299990001',
        totalVisits: 1,
        lifetimeValue: 52000,
        stampsCount: 2,
        lastVisitDate: new Date().toISOString(),
        segment: 'Pelanggan Baru',
      };
      await expect(idb.saveStoredCustomer(testCust)).resolves.toBeUndefined();
      const foundCust = await idb.findStoredCustomerByPhone('+62 812-9999-0001');
      expect(foundCust).toBeDefined();
      expect(foundCust?.id).toBe(testCust.id);

      // 5. Settings operations
      const settings = await idb.getStoredSettings();
      expect(settings).toBeDefined();
      await expect(idb.saveStoredSettings(settings)).resolves.toBeUndefined();

      // 6. SyncQueue operations
      const qItem = await idb.addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { txId: testTx.id },
      });
      expect(qItem).toBeDefined();
      expect(qItem.id).toBeDefined();

      const queue = await idb.getSyncQueue();
      expect(queue.some((q) => q.id === qItem.id)).toBe(true);

      await expect(idb.updateSyncQueueItem(qItem.id, { status: 'failed', retryCount: 5 })).resolves.toBeUndefined();
      await expect(idb.clearFailedSyncQueue()).resolves.toBeUndefined();

      const queueAfterClear = await idb.getSyncQueue();
      expect(queueAfterClear.some((q) => q.id === qItem.id)).toBe(false);

      delete (window as any).indexedDB;
    });

    it('handles simulated runtime db.put rejection and preserves data in memory fallback', async () => {
      vi.resetModules();
      (window as any).indexedDB = {};

      const mockPut = vi.fn().mockRejectedValue(new Error('DataError: Transaction aborted due to disk write failure'));
      const mockGetAll = vi.fn().mockResolvedValue([]);
      const mockGet = vi.fn().mockResolvedValue(null);

      const mockDb = {
        objectStoreNames: { contains: () => true },
        count: vi.fn().mockResolvedValue(10), // Non-zero count skips auto-seeding
        put: mockPut,
        get: mockGet,
        getAll: mockGetAll,
      };

      vi.doMock('idb', () => ({
        openDB: vi.fn().mockResolvedValue(mockDb),
      }));

      const idb = await import('../src/lib/indexedDb');

      const tx: Transaction = {
        id: 'tx-put-reject-99',
        timestamp: new Date().toISOString(),
        items: [],
        totalAmount: 35000,
        paymentMethod: 'qris',
        amountPaid: 35000,
        change: 0,
        stampsAwarded: 1,
        synced: false,
      };

      // saveStoredTransaction should catch the db.put rejection and route to memory
      await expect(idb.saveStoredTransaction(tx)).resolves.toBeUndefined();

      // Must be retrievable
      const retrieved = await idb.getStoredTransactions();
      expect(retrieved.some((t) => t.id === 'tx-put-reject-99')).toBe(true);

      const single = await idb.getStoredTransactionById('tx-put-reject-99');
      expect(single).toBeDefined();
      expect(single?.id).toBe('tx-put-reject-99');

      // Customer put rejection when IDB already has seeded/existing customers
      mockGetAll.mockResolvedValue([
        {
          id: 'cust-seeded-1',
          name: 'Seeded Customer',
          phone: '08111112222',
          whatsapp: '08111112222',
          totalVisits: 1,
          lifetimeValue: 20000,
          stampsCount: 1,
          lastVisitDate: new Date().toISOString(),
          segment: 'Pelanggan Baru',
        },
      ]);

      const cust: Customer = {
        id: 'cust-put-reject-99',
        name: 'Put Failure Customer',
        phone: '08155556666',
        whatsapp: '08155556666',
        totalVisits: 1,
        lifetimeValue: 35000,
        stampsCount: 1,
        lastVisitDate: new Date().toISOString(),
        segment: 'Pelanggan Baru',
      };
      await expect(idb.saveStoredCustomer(cust)).resolves.toBeUndefined();

      const found = await idb.findStoredCustomerByPhone('+62 815 555 6666');
      expect(found).toBeDefined();
      expect(found?.id).toBe('cust-put-reject-99');

      delete (window as any).indexedDB;
    });

    it('merges existing IDB records with memory fallback records without data loss or duplicate keys', async () => {
      vi.resetModules();
      (window as any).indexedDB = {};

      const existingIdbTx: Transaction = {
        id: 'idb-tx-existing-1',
        timestamp: '2026-10-30T01:00:00.000Z',
        items: [],
        totalAmount: 26000,
        paymentMethod: 'cash',
        amountPaid: 30000,
        change: 4000,
        stampsAwarded: 1,
        synced: true,
      };

      const mockDb = {
        objectStoreNames: { contains: () => true },
        count: vi.fn().mockResolvedValue(1),
        put: vi.fn().mockImplementation((store, val) => {
          if (val.id === 'tx-fail-quota') {
            return Promise.reject(new Error('QuotaExceededError'));
          }
          return Promise.resolve();
        }),
        get: vi.fn().mockImplementation((store, id) => {
          if (id === existingIdbTx.id) return Promise.resolve(existingIdbTx);
          return Promise.resolve(null);
        }),
        getAll: vi.fn().mockResolvedValue([existingIdbTx]),
      };

      vi.doMock('idb', () => ({
        openDB: vi.fn().mockResolvedValue(mockDb),
      }));

      const idb = await import('../src/lib/indexedDb');

      // Save a transaction that causes quota error and lands in memory
      const memoryTx: Transaction = {
        id: 'tx-fail-quota',
        timestamp: '2026-10-30T02:00:00.000Z', // later time
        items: [],
        totalAmount: 48000,
        paymentMethod: 'cash',
        amountPaid: 50000,
        change: 2000,
        stampsAwarded: 1,
        synced: false,
      };

      await idb.saveStoredTransaction(memoryTx);

      // getStoredTransactions must return BOTH existing IDB transaction and memory fallback transaction
      const allTxs = await idb.getStoredTransactions();
      expect(allTxs.length).toBe(2);
      expect(allTxs.some((t) => t.id === existingIdbTx.id)).toBe(true);
      expect(allTxs.some((t) => t.id === memoryTx.id)).toBe(true);

      // Verify reverse chronological sort (memoryTx was at 02:00, idbTx was at 01:00)
      expect(allTxs[0].id).toBe(memoryTx.id);
      expect(allTxs[1].id).toBe(existingIdbTx.id);

      delete (window as any).indexedDB;
    });
  });
});
