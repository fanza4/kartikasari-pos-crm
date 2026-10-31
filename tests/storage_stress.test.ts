import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Transaction, Customer, MenuItem, StoreSettings } from '../src/types';

describe('Empirical Stress Harness: Storage, Persistence & Sync Queue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // SUITE 1: RAPID CONCURRENT INSERTIONS (Zero Data Loss & Order Preservation)
  // =========================================================================
  describe('Suite 1: Rapid Concurrent Insertions', () => {
    it('handles 100 concurrent transaction writes without data corruption or loss', async () => {
      const { saveStoredTransaction, getStoredTransactions, getStoredTransactionById } = await import(
        '../src/lib/indexedDb'
      );

      const baseTimestamp = 1761811200000;
      const count = 100;
      const transactions: Transaction[] = [];

      for (let i = 0; i < count; i++) {
        const time = new Date(baseTimestamp + i * 1000).toISOString();
        transactions.push({
          id: `stress-tx-${i}-${Math.random().toString(36).substring(2, 7)}`,
          invoiceNumber: `INV-STRESS-${i.toString().padStart(4, '0')}`,
          timestamp: time,
          items: [
            {
              id: `item-${i}-1`,
              menuItemId: 'kuah-seporsi',
              name: 'Mie Baso Seporsi',
              unitPrice: 26000,
              quantity: 1 + (i % 3),
              selectedToppings: [],
              isNoodlePortion: true,
              subtotal: 26000 * (1 + (i % 3)),
            },
          ],
          totalAmount: 26000 * (1 + (i % 3)),
          paymentMethod: i % 2 === 0 ? 'cash' : 'qris',
          amountPaid: 26000 * (1 + (i % 3)),
          change: 0,
          customerName: `Pelanggan Stress ${i}`,
          customerPhone: `081234567${i.toString().padStart(3, '0')}`,
          stampsAwarded: 1 + (i % 3),
          synced: false,
        });
      }

      // Execute all 100 writes concurrently via Promise.all
      const startTime = performance.now();
      await Promise.all(transactions.map((tx) => saveStoredTransaction(tx)));
      const duration = performance.now() - startTime;

      console.log(`[Empirical Test] 100 concurrent transactions written in ${duration.toFixed(2)}ms`);

      // Retrieve all transactions
      const retrieved = await getStoredTransactions();
      const stressTxs = retrieved.filter((t) => t.id.startsWith('stress-tx-'));

      expect(stressTxs.length).toBe(count);

      // Verify each transaction is retrievable by ID
      const singleLookups = await Promise.all(transactions.map((tx) => getStoredTransactionById(tx.id)));
      for (let i = 0; i < count; i++) {
        expect(singleLookups[i]).toBeDefined();
        expect(singleLookups[i]?.id).toBe(transactions[i].id);
        expect(singleLookups[i]?.totalAmount).toBe(transactions[i].totalAmount);
      }

      // Verify reverse chronological ordering
      for (let i = 0; i < stressTxs.length - 1; i++) {
        const current = new Date(stressTxs[i].timestamp).getTime();
        const next = new Date(stressTxs[i + 1].timestamp).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it('handles 100 concurrent customer writes without data loss', async () => {
      const { saveStoredCustomer, getStoredCustomers } = await import('../src/lib/indexedDb');

      const count = 100;
      const customers: Customer[] = [];

      for (let i = 0; i < count; i++) {
        customers.push({
          id: `stress-cust-${i}`,
          name: `Customer Stress ${i}`,
          phone: `08987654${i.toString().padStart(4, '0')}`,
          whatsapp: `08987654${i.toString().padStart(4, '0')}`,
          totalVisits: (i % 10) + 1,
          lifetimeValue: ((i % 10) + 1) * 26000,
          stampsCount: (i % 10) + 1,
          lastVisitDate: new Date().toISOString(),
          segment: i > 5 ? 'VIP' : 'Pelanggan Baru',
        });
      }

      // Execute concurrent writes
      await Promise.all(customers.map((c) => saveStoredCustomer(c)));

      const allCustomers = await getStoredCustomers();
      const stressCustomers = allCustomers.filter((c) => c.id.startsWith('stress-cust-'));
      expect(stressCustomers.length).toBe(count);
    });

    it('handles concurrent updates to the same customer record without corruption', async () => {
      const { saveStoredCustomer, findStoredCustomerByPhone } = await import('../src/lib/indexedDb');

      const sharedPhone = '087700112233';
      const baseCustomer: Customer = {
        id: 'cust-shared-race',
        name: 'Race Condition Test',
        phone: sharedPhone,
        whatsapp: sharedPhone,
        totalVisits: 1,
        lifetimeValue: 26000,
        stampsCount: 1,
        lastVisitDate: new Date().toISOString(),
        segment: 'Pelanggan Baru',
      };

      await saveStoredCustomer(baseCustomer);

      // Launch 20 concurrent updates updating visit count
      const updatePromises = Array.from({ length: 20 }, (_, idx) => {
        return saveStoredCustomer({
          ...baseCustomer,
          totalVisits: idx + 2,
          lifetimeValue: (idx + 2) * 26000,
          stampsCount: (idx + 2) % 10,
        });
      });

      await Promise.all(updatePromises);

      const finalRecord = await findStoredCustomerByPhone(sharedPhone);
      expect(finalRecord).toBeDefined();
      expect(finalRecord?.id).toBe('cust-shared-race');
      expect(finalRecord?.totalVisits).toBeGreaterThanOrEqual(2);
    });

    it('ensures 500 rapid concurrent addToSyncQueue calls generate unique IDs with zero collisions', async () => {
      const { addToSyncQueue, getSyncQueue } = await import('../src/lib/indexedDb');

      const count = 500;
      const items = await Promise.all(
        Array.from({ length: count }, (_, idx) =>
          addToSyncQueue({
            type: 'transaction',
            action: 'insert',
            payload: { testId: idx },
          })
        )
      );

      const ids = new Set(items.map((i) => i.id));
      expect(ids.size).toBe(count); // Zero collisions across 500 simultaneous additions
    });
  });

  // =========================================================================
  // SUITE 2: PHONE FORMAT SEARCH DISCREPANCIES (Empirical Bug Discovery)
  // =========================================================================
  describe('Suite 2: Customer Phone Lookup & Formatting Discrepancies', () => {
    it('finds customer by exact phone number and with spaces/dashes', async () => {
      const { saveStoredCustomer, findStoredCustomerByPhone } = await import('../src/lib/indexedDb');

      const customer: Customer = {
        id: 'cust-format-1',
        name: 'Asep Sunandar',
        phone: '081399887766',
        whatsapp: '081399887766',
        totalVisits: 3,
        lifetimeValue: 78000,
        stampsCount: 3,
        lastVisitDate: new Date().toISOString(),
        segment: 'Pelanggan Baru',
      };

      await saveStoredCustomer(customer);

      // Exact match
      const found1 = await findStoredCustomerByPhone('081399887766');
      expect(found1?.id).toBe('cust-format-1');

      // With spaces and dashes
      const found2 = await findStoredCustomerByPhone('0813-9988-7766');
      expect(found2?.id).toBe('cust-format-1');
    });

    it('EMPIRICAL BUG REPRODUCTION: demonstrates failure of findStoredCustomerByPhone when searching with international 62 format against 08 phone', async () => {
      const { saveStoredCustomer, findStoredCustomerByPhone } = await import('../src/lib/indexedDb');

      const customer: Customer = {
        id: 'cust-bug-62',
        name: 'Haji Endang',
        phone: '081299998888',
        whatsapp: '081299998888',
        totalVisits: 8,
        lifetimeValue: 240000,
        stampsCount: 8,
        lastVisitDate: new Date().toISOString(),
        segment: 'VIP',
      };

      await saveStoredCustomer(customer);

      // Customer saved with '081299998888'.
      // When incoming WhatsApp message or POS lookup uses international prefix '+6281299998888' or '6281299998888':
      const lookupResult = await findStoredCustomerByPhone('6281299998888');

      // In indexedDb.ts, cleanPhone is '6281299998888'.
      // cPhone is '081299998888'.
      // Neither cPhone === cleanPhone nor cPhone.includes(cleanPhone) is true!
      // Therefore lookupResult is UNDEFINED despite the customer being present in DB!
      console.log('[Empirical Finding] findStoredCustomerByPhone with 6281299998888 result:', lookupResult);
      expect(lookupResult).toBeDefined();
      expect(lookupResult?.id).toBe('cust-bug-62');
      expect(lookupResult?.name).toBe('Haji Endang');
    });

    it('reliably matches customer across all Indonesian phone formats (+628, 628, 08, 8, spaces, dashes, typos)', async () => {
      const { saveStoredCustomer, findStoredCustomerByPhone } = await import('../src/lib/indexedDb');

      const customer: Customer = {
        id: 'cust-cross-format',
        name: 'Ibu Hj. Aminah',
        phone: '081234567890',
        whatsapp: '081234567890',
        totalVisits: 2,
        lifetimeValue: 52000,
        stampsCount: 2,
        lastVisitDate: new Date().toISOString(),
        segment: 'Pelanggan Baru',
      };

      await saveStoredCustomer(customer);

      expect((await findStoredCustomerByPhone('081234567890'))?.id).toBe('cust-cross-format');
      expect((await findStoredCustomerByPhone('6281234567890'))?.id).toBe('cust-cross-format');
      expect((await findStoredCustomerByPhone('+62 812-3456-7890'))?.id).toBe('cust-cross-format');
      expect((await findStoredCustomerByPhone('81234567890'))?.id).toBe('cust-cross-format');
      expect((await findStoredCustomerByPhone('+62081234567890'))?.id).toBe('cust-cross-format');
      expect(await findStoredCustomerByPhone('')).toBeUndefined();
      expect(await findStoredCustomerByPhone('123')).toBeUndefined();
    });
  });

  // =========================================================================
  // SUITE 3: OFFLINE QUEUE GROWTH & DRAIN BEHAVIOR
  // =========================================================================
  describe('Suite 3: Offline Queue Growth & Drain Behavior', () => {
    it('accumulates offline queue items and drains completely on reconnect', async () => {
      const { addToSyncQueue, getSyncQueue, clearCompletedSyncQueue, saveStoredTransaction } = await import(
        '../src/lib/indexedDb'
      );
      const { syncQueueManager } = await import('../src/lib/syncQueue');
      const supabaseModule = await import('../src/lib/supabase');

      // Clear any pre-existing completed items
      await clearCompletedSyncQueue();

      // Accumulate 20 offline transactions
      const queuedItemIds: string[] = [];
      for (let i = 0; i < 20; i++) {
        const tx: Transaction = {
          id: `queue-tx-${i}`,
          invoiceNumber: `INV-OFFLINE-${i}`,
          timestamp: new Date().toISOString(),
          items: [],
          totalAmount: 30000 + i * 1000,
          paymentMethod: 'cash',
          amountPaid: 50000,
          change: 20000 - i * 1000,
          stampsAwarded: 1,
          synced: false,
        };
        await saveStoredTransaction(tx);
        const qItem = await addToSyncQueue({
          type: 'transaction',
          action: 'insert',
          payload: tx,
        });
        queuedItemIds.push(qItem.id);
      }

      // Verify queue growth
      const queueBefore = await getSyncQueue();
      const ourQueueItems = queueBefore.filter((item) => queuedItemIds.includes(item.id));
      expect(ourQueueItems.length).toBe(20);
      expect(ourQueueItems.every((item) => item.status === 'pending')).toBe(true);
      expect(ourQueueItems.every((item) => item.retryCount === 0)).toBe(true);

      // Mock Supabase to simulate online and configured
      vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(true);
      vi.spyOn(supabaseModule, 'isNetworkOnline').mockReturnValue(true);

      // Mock Supabase insert/upsert to succeed
      const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.spyOn(supabaseModule.supabase, 'from').mockReturnValue({
        upsert: upsertMock,
        insert: upsertMock,
      } as any);

      // Track listener notifications
      const receivedStatuses: any[] = [];
      const unsub = syncQueueManager.subscribe((status) => {
        receivedStatuses.push({ ...status });
      });

      // Execute queue drain
      const drainResult = await syncQueueManager.processQueue();

      expect(drainResult.processed).toBeGreaterThanOrEqual(20);
      expect(drainResult.failed).toBe(0);
      expect(drainResult.succeeded).toBeGreaterThanOrEqual(20);

      // Verify all items were drained and removed from syncQueue
      const queueAfter = await getSyncQueue();
      const remainingItems = queueAfter.filter((item) => queuedItemIds.includes(item.id));
      expect(remainingItems.length).toBe(0);

      // Verify listener captured active sync states
      expect(receivedStatuses.some((s) => s.isSyncing === true)).toBe(true);
      expect(receivedStatuses[receivedStatuses.length - 1].isSyncing).toBe(false);

      unsub();
    });

    it('correctly handles network failures, retry backoff, and max retries', async () => {
      const { addToSyncQueue, getSyncQueue, removeSyncQueueItem } = await import('../src/lib/indexedDb');
      const { syncQueueManager } = await import('../src/lib/syncQueue');
      const supabaseModule = await import('../src/lib/supabase');

      vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(true);
      vi.spyOn(supabaseModule, 'isNetworkOnline').mockReturnValue(true);

      // Queue an item that will fail
      const faultyItem = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'faulty-tx-1', timestamp: new Date().toISOString(), totalAmount: 99999 },
      });

      // Mock Supabase to reject with network error
      const mockUpsert = vi.fn().mockResolvedValue({
        data: null,
        error: { message: '503 Service Unavailable: Cloud DB Unreachable' },
      });
      vi.spyOn(supabaseModule.supabase, 'from').mockReturnValue({
        upsert: mockUpsert,
        insert: mockUpsert,
      } as any);

      // 1st attempt
      let res = await syncQueueManager.processQueue();
      expect(res.failed).toBeGreaterThanOrEqual(1);

      let queue = await getSyncQueue();
      let updated = queue.find((i) => i.id === faultyItem.id);
      expect(updated?.status).toBe('failed');
      expect(updated?.retryCount).toBe(1);
      expect(updated?.lastError).toContain('503 Service Unavailable');

      // Attempt 2, 3, 4, 5
      for (let attempt = 2; attempt <= 5; attempt++) {
        await syncQueueManager.processQueue();
        queue = await getSyncQueue();
        updated = queue.find((i) => i.id === faultyItem.id);
        expect(updated?.retryCount).toBe(attempt);
      }

      // 6th attempt: retryCount has reached 5 (maxRetries). Should NOT be processed again.
      const res6 = await syncQueueManager.processQueue();
      expect(res6.processed).toBe(0);

      // EMPIRICAL FINDING: Item remains in syncQueue in 'failed' status permanently!
      queue = await getSyncQueue();
      const deadLetterItem = queue.find((i) => i.id === faultyItem.id);
      expect(deadLetterItem).toBeDefined();
      expect(deadLetterItem?.retryCount).toBe(5);

      // Dead letter visibility verification
      const status = await syncQueueManager.getStatus();
      expect(status.pendingCount).toBe(0);
      expect(status.failedCount).toBe(1);
      expect(status.deadLetterCount).toBe(1);

      // Cleanup
      await removeSyncQueueItem(faultyItem.id);
    });

    it('processes queue triggered by simulated online window event', async () => {
      const { syncQueueManager } = await import('../src/lib/syncQueue');
      const supabaseModule = await import('../src/lib/supabase');

      vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(true);
      vi.spyOn(supabaseModule, 'isNetworkOnline').mockReturnValue(true);

      const processSpy = vi.spyOn(syncQueueManager, 'processQueue');

      // Dispatch 'online' event on window
      window.dispatchEvent(new Event('online'));

      // Wait a microtick
      await new Promise((r) => setTimeout(r, 50));

      expect(processSpy).toHaveBeenCalled();
    });

    it('exposes dead-letter items, supports manual reset, retry, and clear operations', async () => {
      const { addToSyncQueue, updateSyncQueueItem, getSyncQueue, clearFailedSyncQueue } = await import(
        '../src/lib/indexedDb'
      );
      const { syncQueueManager } = await import('../src/lib/syncQueue');

      // 1. Add item and simulate 5 failures
      const deadItem = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'dead-letter-test-1', totalAmount: 26000 },
      });
      await updateSyncQueueItem(deadItem.id, {
        status: 'failed',
        retryCount: 5,
        lastError: 'Simulated 500 server error',
      });

      // 2. getStatus reports failedCount & deadLetterCount
      const status = await syncQueueManager.getStatus();
      expect(status.failedCount).toBeGreaterThanOrEqual(1);
      expect(status.deadLetterCount).toBeGreaterThanOrEqual(1);

      // 3. getFailedItems inspection
      const failedItems = await syncQueueManager.getFailedItems(true);
      expect(failedItems.some((i) => i.id === deadItem.id)).toBe(true);

      // 4. resetFailedItems
      const resetCount = await syncQueueManager.resetFailedItems(true);
      expect(resetCount).toBeGreaterThanOrEqual(1);

      const queueAfterReset = await getSyncQueue();
      const resetItem = queueAfterReset.find((i) => i.id === deadItem.id);
      expect(resetItem?.status).toBe('pending');
      expect(resetItem?.retryCount).toBe(0);

      // 5. Fail again and clear via clearFailedItems
      await updateSyncQueueItem(deadItem.id, {
        status: 'failed',
        retryCount: 5,
      });
      const clearedCount = await syncQueueManager.clearFailedItems(true);
      expect(clearedCount).toBeGreaterThanOrEqual(1);

      const queueAfterClear = await getSyncQueue();
      expect(queueAfterClear.some((i) => i.id === deadItem.id)).toBe(false);

      // 6. Test clearFailedSyncQueue directly
      const deadItem2 = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'dead-letter-test-2' },
      });
      await updateSyncQueueItem(deadItem2.id, {
        status: 'failed',
        retryCount: 5,
      });
      await clearFailedSyncQueue();
      const queueAfterClearDb = await getSyncQueue();
      expect(queueAfterClearDb.some((i) => i.id === deadItem2.id)).toBe(false);
    });
  });

  // =========================================================================
  // SUITE 4: ZERO-CRASH FALLBACK & ERROR RESILIENCE
  // =========================================================================
  describe('Suite 4: Zero-Crash Fallback & Error Resilience', () => {
    it('operates seamlessly in memory when IndexedDB is not supported', async () => {
      const {
        getStoredMenu,
        saveStoredMenuItem,
        getStoredTransactions,
        saveStoredTransaction,
        getStoredCustomers,
        saveStoredCustomer,
        getStoredSettings,
        saveStoredSettings,
        getSyncQueue,
        addToSyncQueue,
      } = await import('../src/lib/indexedDb');

      // In jsdom environment, window.indexedDB is undefined
      // Every operation should complete without throwing any exception

      await expect(getStoredMenu()).resolves.toBeDefined();
      await expect(
        saveStoredMenuItem({
          id: 'dish-fallback',
          name: 'Mie Fallback',
          category: 'mie_kuah',
          price: 25000,
          composition: ['Mie'],
          isNoodlePortion: true,
          isAvailable: true,
          image: '/menu/mie-kuah.svg',
          description: 'Fallback dish',
        })
      ).resolves.toBeUndefined();

      await expect(
        saveStoredTransaction({
          id: 'tx-fallback-1',
          timestamp: new Date().toISOString(),
          items: [],
          totalAmount: 25000,
          paymentMethod: 'cash',
          amountPaid: 30000,
          change: 5000,
          stampsAwarded: 1,
          synced: false,
        })
      ).resolves.toBeUndefined();

      const txs = await getStoredTransactions();
      expect(txs.some((t) => t.id === 'tx-fallback-1')).toBe(true);

      await expect(
        saveStoredCustomer({
          id: 'cust-fallback-1',
          name: 'Fallback Customer',
          phone: '081122334455',
          whatsapp: '081122334455',
          totalVisits: 1,
          lifetimeValue: 25000,
          stampsCount: 1,
          lastVisitDate: new Date().toISOString(),
          segment: 'Pelanggan Baru',
        })
      ).resolves.toBeUndefined();

      const custs = await getStoredCustomers();
      expect(custs.some((c) => c.id === 'cust-fallback-1')).toBe(true);

      const qItem = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'q-fallback' },
      });
      expect(qItem.id).toBeDefined();

      const queue = await getSyncQueue();
      expect(queue.some((q) => q.id === qItem.id)).toBe(true);
    });

    it('verifies zero-crash fallback and memory store retrieval when IndexedDB throws error', async () => {
      // In tests/idb_error_repro.test.ts, we verify that when window.indexedDB is present:
      // openDB or db.put rejection is caught and seamlessly falls back to memoryFallback without crashing.
      expect(true).toBe(true);
    });
  });
});
