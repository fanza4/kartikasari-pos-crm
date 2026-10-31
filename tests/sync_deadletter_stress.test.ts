import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Transaction, Customer, SyncQueueItem, SyncStatus } from '../src/types';
import { getSyncQueue, removeSyncQueueItem, clearFailedSyncQueue } from '../src/lib/indexedDb';

// Helper to ensure clean slate for every stress test
const purgeEntireSyncQueue = async () => {
  const queue = await getSyncQueue();
  for (const item of queue) {
    await removeSyncQueueItem(item.id);
  }
};

describe('Challenger 2: SyncQueue Dead-Letter Visibility and Recovery Stress Test', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await purgeEntireSyncQueue();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await purgeEntireSyncQueue();
  });

  // =========================================================================
  // CRITERIA 1: DEAD-LETTER VISIBILITY (Max Retries = 5)
  // =========================================================================
  describe('Criteria 1: Dead-Letter Visibility under Repeated Failures', () => {
    it('empirically verifies items with retryCount >= 5 transition from pendingCount to failedCount/deadLetterCount and never disappear into 0 pending', async () => {
      const { addToSyncQueue, getSyncQueue } = await import('../src/lib/indexedDb');
      const { syncQueueManager } = await import('../src/lib/syncQueue');
      const supabaseModule = await import('../src/lib/supabase');

      // Configure online and Supabase
      vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(true);
      vi.spyOn(supabaseModule, 'isNetworkOnline').mockReturnValue(true);

      // Create 5 transactions
      const queuedIds: string[] = [];
      for (let i = 0; i < 5; i++) {
        const item = await addToSyncQueue({
          type: 'transaction',
          action: 'insert',
          payload: { id: `tx-deadletter-${i}`, totalAmount: 26000 * (i + 1) },
        });
        queuedIds.push(item.id);
      }

      // Initial status: all 5 are pending
      let status = await syncQueueManager.getStatus();
      expect(status.pendingCount).toBe(5);
      expect(status.failedCount).toBe(0);
      expect(status.deadLetterCount).toBe(0);
      expect(status.totalQueued).toBe(5);

      // Mock Supabase to fail with 500 error
      const mockUpsert = vi.fn().mockResolvedValue({
        data: null,
        error: { message: '500 Internal Server Error: Database Deadlock' },
      });
      vi.spyOn(supabaseModule.supabase, 'from').mockReturnValue({
        upsert: mockUpsert,
        insert: mockUpsert,
      } as any);

      // Run 4 sync attempts: items fail but retryCount < 5, so still counted as pending
      for (let attempt = 1; attempt <= 4; attempt++) {
        const res = await syncQueueManager.processQueue();
        expect(res.processed).toBe(5);
        expect(res.failed).toBe(5);

        status = await syncQueueManager.getStatus();
        // retryCount < 5: still considered pending (will be retried)
        expect(status.pendingCount).toBe(5);
        expect(status.failedCount).toBe(0);
        expect(status.deadLetterCount).toBe(0);
      }

      // 5th attempt: retryCount reaches 5 (maxRetries)
      const res5 = await syncQueueManager.processQueue();
      expect(res5.processed).toBe(5);
      expect(res5.failed).toBe(5);

      // CRITICAL CHECK: Items must NOT disappear into 0 pending with 0 failed!
      status = await syncQueueManager.getStatus();
      expect(status.pendingCount).toBe(0);
      expect(status.failedCount).toBe(5);
      expect(status.deadLetterCount).toBe(5);
      expect(status.totalQueued).toBe(5);

      // Verify the items are physically in the queue with retryCount = 5
      const queue = await getSyncQueue();
      const ourItems = queue.filter((i) => queuedIds.includes(i.id));
      expect(ourItems.length).toBe(5);
      for (const item of ourItems) {
        expect(item.status).toBe('failed');
        expect(item.retryCount).toBe(5);
        expect(item.lastError).toContain('500 Internal Server Error');
      }

      // 6th attempt: processQueue should skip all items exceeding maxRetries
      const res6 = await syncQueueManager.processQueue();
      expect(res6.processed).toBe(0);
      expect(res6.failed).toBe(0);
      expect(res6.succeeded).toBe(0);

      // getFailedItems(true) should return exactly our 5 dead-letter items
      const deadLetterItems = await syncQueueManager.getFailedItems(true);
      const matchedDeadLetters = deadLetterItems.filter((i) => queuedIds.includes(i.id));
      expect(matchedDeadLetters.length).toBe(5);
    });

    it('empirically verifies mixed queue counts: distinguishing transient failures (<5) vs dead-letter failures (>=5) vs pending', async () => {
      const { addToSyncQueue, updateSyncQueueItem } = await import('../src/lib/indexedDb');
      const { syncQueueManager } = await import('../src/lib/syncQueue');

      // 1. Pending item (retryCount 0)
      const pendingItem = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'tx-mix-pending' },
      });

      // 2. Transient failed item (retryCount 2)
      const transientItem = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'tx-mix-transient' },
      });
      await updateSyncQueueItem(transientItem.id, {
        status: 'failed',
        retryCount: 2,
        lastError: 'Temporary network glitch',
      });

      // 3. Dead letter item (retryCount 5)
      const deadItem1 = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'tx-mix-dead-1' },
      });
      await updateSyncQueueItem(deadItem1.id, {
        status: 'failed',
        retryCount: 5,
        lastError: 'Permanent failure',
      });

      // 4. Dead letter item (retryCount 7, exceeded)
      const deadItem2 = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'tx-mix-dead-2' },
      });
      await updateSyncQueueItem(deadItem2.id, {
        status: 'failed',
        retryCount: 7,
        lastError: 'Permanent schema error',
      });

      const status = await syncQueueManager.getStatus();
      // pendingCount should include pendingItem (1) + transientItem (1) = 2
      expect(status.pendingCount).toBe(2);
      // failedCount / deadLetterCount should include deadItem1 + deadItem2 = 2
      expect(status.failedCount).toBe(2);
      expect(status.deadLetterCount).toBe(2);
      expect(status.totalQueued).toBe(4);

      // Inspection verification
      const allFailed = await syncQueueManager.getFailedItems(false);
      expect(allFailed.length).toBe(3); // transientItem, deadItem1, deadItem2

      const deadOnly = await syncQueueManager.getFailedItems(true);
      expect(deadOnly.length).toBe(2); // deadItem1, deadItem2
    });
  });

  // =========================================================================
  // CRITERIA 2: RECOVERY VIA resetFailedItems() AND retryFailedItems()
  // =========================================================================
  describe('Criteria 2: Recovery via resetFailedItems() and retryFailedItems()', () => {
    it('empirically verifies resetFailedItems() restores dead-letter items to pending with retryCount=0', async () => {
      const { addToSyncQueue, updateSyncQueueItem, getSyncQueue } = await import('../src/lib/indexedDb');
      const { syncQueueManager } = await import('../src/lib/syncQueue');

      // Create 3 dead-letter items
      const deadIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const item = await addToSyncQueue({
          type: 'transaction',
          action: 'insert',
          payload: { id: `tx-reset-${i}` },
        });
        await updateSyncQueueItem(item.id, {
          status: 'failed',
          retryCount: 5,
          lastError: 'Network drop',
        });
        deadIds.push(item.id);
      }

      // Verify dead letter status
      let status = await syncQueueManager.getStatus();
      expect(status.pendingCount).toBe(0);
      expect(status.failedCount).toBe(3);
      expect(status.deadLetterCount).toBe(3);

      // Subscribe to verify listener notification
      let listenerNotified = false;
      let notifiedStatus: SyncStatus | null = null;
      const unsub = syncQueueManager.subscribe((s) => {
        listenerNotified = true;
        notifiedStatus = s;
      });

      // Reset dead letter items
      const resetCount = await syncQueueManager.resetFailedItems(true);
      expect(resetCount).toBe(3);

      // Check storage state
      const queue = await getSyncQueue();
      const resetItems = queue.filter((i) => deadIds.includes(i.id));
      expect(resetItems.length).toBe(3);
      for (const item of resetItems) {
        expect(item.status).toBe('pending');
        expect(item.retryCount).toBe(0);
      }

      // Check status reflection
      status = await syncQueueManager.getStatus();
      expect(status.pendingCount).toBe(3);
      expect(status.failedCount).toBe(0);
      expect(status.deadLetterCount).toBe(0);

      // Verify listener was notified
      expect(listenerNotified).toBe(true);
      expect(notifiedStatus?.pendingCount).toBe(3);
      expect(notifiedStatus?.failedCount).toBe(0);

      unsub();
    });

    it('empirically verifies retryFailedItems() resets items, triggers processQueue(), and achieves successful sync and transaction status update', async () => {
      const {
        addToSyncQueue,
        updateSyncQueueItem,
        saveStoredTransaction,
        getStoredTransactionById,
        getSyncQueue,
      } = await import('../src/lib/indexedDb');
      const { syncQueueManager } = await import('../src/lib/syncQueue');
      const supabaseModule = await import('../src/lib/supabase');

      // Configure network & Supabase
      vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(true);
      vi.spyOn(supabaseModule, 'isNetworkOnline').mockReturnValue(true);

      // Create stored local transaction
      const txId = 'tx-retry-full-recovery';
      const tx: Transaction = {
        id: txId,
        invoiceNumber: 'INV-RETRY-001',
        timestamp: new Date().toISOString(),
        items: [
          {
            id: 'item-1',
            menuItemId: 'kuah-seporsi',
            name: 'Mie Baso Seporsi',
            unitPrice: 26000,
            quantity: 1,
            selectedToppings: [],
            isNoodlePortion: true,
            subtotal: 26000,
          },
        ],
        totalAmount: 26000,
        paymentMethod: 'cash',
        amountPaid: 30000,
        change: 4000,
        stampsAwarded: 1,
        synced: false,
      };
      await saveStoredTransaction(tx);

      // Queue and fail it 5 times
      const queueItem = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: tx,
      });
      await updateSyncQueueItem(queueItem.id, {
        status: 'failed',
        retryCount: 5,
        lastError: 'Connection timed out',
      });

      // Verify before state: 1 dead-letter, local transaction not synced
      let status = await syncQueueManager.getStatus();
      expect(status.failedCount).toBe(1);
      expect(status.pendingCount).toBe(0);

      const localBefore = await getStoredTransactionById(txId);
      expect(localBefore?.synced).toBe(false);

      // Now mock Supabase to succeed
      const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.spyOn(supabaseModule.supabase, 'from').mockReturnValue({
        upsert: upsertMock,
        insert: upsertMock,
      } as any);

      // Execute retryFailedItems()
      const result = await syncQueueManager.retryFailedItems();

      // Verify return result
      expect(result.resetCount).toBe(1);
      expect(result.processed).toBe(1);
      expect(result.succeeded).toBe(1);
      expect(result.failed).toBe(0);

      // Verify item removed from queue
      const queueAfter = await getSyncQueue();
      expect(queueAfter.some((i) => i.id === queueItem.id)).toBe(false);

      // Verify local transaction marked synced = true
      const localAfter = await getStoredTransactionById(txId);
      expect(localAfter?.synced).toBe(true);

      // Verify final sync status
      status = await syncQueueManager.getStatus();
      expect(status.pendingCount).toBe(0);
      expect(status.failedCount).toBe(0);
      expect(status.deadLetterCount).toBe(0);
      expect(status.totalQueued).toBe(0);
    });

    it('empirically verifies retryFailedItems() handles re-entrancy protection and returns early when isSyncing=true', async () => {
      const { syncQueueManager } = await import('../src/lib/syncQueue');

      // Access private isSyncing via any cast to simulate an active sync
      (syncQueueManager as any).isSyncing = true;

      const result = await syncQueueManager.retryFailedItems();
      expect(result).toEqual({ resetCount: 0, processed: 0, succeeded: 0, failed: 0 });

      // Reset isSyncing back
      (syncQueueManager as any).isSyncing = false;
    });

    it('empirically verifies retryFailedItems() returns early with zero counts when no failed items exist', async () => {
      const { syncQueueManager } = await import('../src/lib/syncQueue');

      const result = await syncQueueManager.retryFailedItems();
      expect(result).toEqual({ resetCount: 0, processed: 0, succeeded: 0, failed: 0 });
    });
  });

  // =========================================================================
  // CRITERIA 3: PURGE VIA clearFailedItems() AND clearFailedSyncQueue()
  // =========================================================================
  describe('Criteria 3: Purge via clearFailedItems() and clearFailedSyncQueue()', () => {
    it('empirically verifies clearFailedItems(true) purges ONLY dead-letter items while preserving pending and transient failures', async () => {
      const { addToSyncQueue, updateSyncQueueItem, getSyncQueue } = await import('../src/lib/indexedDb');
      const { syncQueueManager } = await import('../src/lib/syncQueue');

      // Item 1: Pending (retryCount 0)
      const pending = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'preserve-pending' },
      });

      // Item 2: Transient failed (retryCount 2)
      const transient = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'preserve-transient' },
      });
      await updateSyncQueueItem(transient.id, {
        status: 'failed',
        retryCount: 2,
      });

      // Item 3: Dead letter (retryCount 5)
      const dead1 = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'purge-dead-1' },
      });
      await updateSyncQueueItem(dead1.id, {
        status: 'failed',
        retryCount: 5,
      });

      // Item 4: Dead letter (retryCount 6)
      const dead2 = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'purge-dead-2' },
      });
      await updateSyncQueueItem(dead2.id, {
        status: 'failed',
        retryCount: 6,
      });

      // Execute clearFailedItems(deadLetterOnly = true)
      const purgedCount = await syncQueueManager.clearFailedItems(true);
      expect(purgedCount).toBe(2);

      // Verify queue contents: dead1 and dead2 are gone, pending and transient remain!
      const queue = await getSyncQueue();
      const remainingIds = queue.map((i) => i.id);

      expect(remainingIds).toContain(pending.id);
      expect(remainingIds).toContain(transient.id);
      expect(remainingIds).not.toContain(dead1.id);
      expect(remainingIds).not.toContain(dead2.id);

      // Verify status: 0 dead-letter, 2 pending
      const status = await syncQueueManager.getStatus();
      expect(status.deadLetterCount).toBe(0);
      expect(status.failedCount).toBe(0);
      expect(status.pendingCount).toBe(2);
    });

    it('empirically verifies clearFailedItems(false) purges ALL failed items regardless of retryCount', async () => {
      const { addToSyncQueue, updateSyncQueueItem, getSyncQueue } = await import('../src/lib/indexedDb');
      const { syncQueueManager } = await import('../src/lib/syncQueue');

      const pending = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'keep-pending' },
      });

      const failed1 = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'failed-low-retry' },
      });
      await updateSyncQueueItem(failed1.id, {
        status: 'failed',
        retryCount: 1,
      });

      const failed2 = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'failed-high-retry' },
      });
      await updateSyncQueueItem(failed2.id, {
        status: 'failed',
        retryCount: 5,
      });

      const purged = await syncQueueManager.clearFailedItems(false);
      expect(purged).toBe(2);

      const queue = await getSyncQueue();
      expect(queue.some((i) => i.id === pending.id)).toBe(true);
      expect(queue.some((i) => i.id === failed1.id)).toBe(false);
      expect(queue.some((i) => i.id === failed2.id)).toBe(false);
    });

    it('empirically verifies clearFailedSyncQueue() directly purges failed items in both IDB and memoryFallback store', async () => {
      const { addToSyncQueue, updateSyncQueueItem, getSyncQueue, clearFailedSyncQueue } = await import(
        '../src/lib/indexedDb'
      );
      const { syncQueueManager } = await import('../src/lib/syncQueue');

      const dead = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'direct-idb-purge-target' },
      });
      await updateSyncQueueItem(dead.id, {
        status: 'failed',
        retryCount: 5,
      });

      // Call low-level clearFailedSyncQueue()
      await clearFailedSyncQueue();

      const queue = await getSyncQueue();
      expect(queue.some((i) => i.id === dead.id)).toBe(false);

      const status = await syncQueueManager.getStatus();
      expect(status.deadLetterCount).toBe(0);
    });
  });

  // =========================================================================
  // CRITERIA 4: HIGH-CONCURRENCY, RACE CONDITIONS & LISTENER RESILIENCE
  // =========================================================================
  describe('Criteria 4: Concurrency, Race Conditions & Listener Resilience', () => {
    it('handles 50 concurrent failed items being simultaneously reset or cleared without corruption', async () => {
      const { addToSyncQueue, updateSyncQueueItem } = await import('../src/lib/indexedDb');
      const { syncQueueManager } = await import('../src/lib/syncQueue');

      // Concurrently add 50 items and set them to failed
      const items = await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          addToSyncQueue({
            type: 'transaction',
            action: 'insert',
            payload: { id: `concurrent-fail-${i}` },
          })
        )
      );

      await Promise.all(
        items.map((item) =>
          updateSyncQueueItem(item.id, {
            status: 'failed',
            retryCount: 5,
          })
        )
      );

      let status = await syncQueueManager.getStatus();
      expect(status.failedCount).toBe(50);
      expect(status.deadLetterCount).toBe(50);
      expect(status.pendingCount).toBe(0);

      // Concurrent resetFailedItems calls
      const resetResults = await Promise.all([
        syncQueueManager.resetFailedItems(true),
        syncQueueManager.resetFailedItems(true),
      ]);

      // Together they should have reset the items, and status should now show 50 pending, 0 dead-letter
      status = await syncQueueManager.getStatus();
      expect(status.pendingCount).toBe(50);
      expect(status.deadLetterCount).toBe(0);
      expect(status.failedCount).toBe(0);

      // Set 50 items back to failed
      await Promise.all(
        items.map((item) =>
          updateSyncQueueItem(item.id, {
            status: 'failed',
            retryCount: 5,
          })
        )
      );

      // Concurrent clearFailedItems calls
      const clearResults = await Promise.all([
        syncQueueManager.clearFailedItems(true),
        syncQueueManager.clearFailedItems(true),
      ]);

      const totalPurged = clearResults[0] + clearResults[1];
      expect(totalPurged).toBeGreaterThanOrEqual(50);

      status = await syncQueueManager.getStatus();
      expect(status.deadLetterCount).toBe(0);
      expect(status.totalQueued).toBe(0);
    });

    it('ensures notifyListeners isolates listener errors so that one bad subscriber does not crash others', async () => {
      const { addToSyncQueue, updateSyncQueueItem } = await import('../src/lib/indexedDb');
      const { syncQueueManager } = await import('../src/lib/syncQueue');

      // We test that notifyListeners() wraps each listener in try/catch.
      // Note: subscribe() calls listener once synchronously via getStatus().then(),
      // so we make the mock throw only after the initial subscription invocation.
      let callCount = 0;
      const buggyListener = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount > 1) {
          throw new Error('Fatal UI listener crash during broadcast!');
        }
      });
      const validListener = vi.fn();

      const unsub1 = syncQueueManager.subscribe(buggyListener);
      const unsub2 = syncQueueManager.subscribe(validListener);

      // Wait microtick for initial getStatus() callback
      await new Promise((r) => setTimeout(r, 20));

      const dead = await addToSyncQueue({
        type: 'transaction',
        action: 'insert',
        payload: { id: 'listener-test-tx' },
      });
      await updateSyncQueueItem(dead.id, {
        status: 'failed',
        retryCount: 5,
      });

      // resetFailedItems notifies listeners; should NOT throw despite buggy listener throwing
      await expect(syncQueueManager.resetFailedItems(true)).resolves.toBe(1);

      // Valid listener should still have been called
      expect(validListener).toHaveBeenCalled();

      // clearFailedItems should also succeed without throwing
      await updateSyncQueueItem(dead.id, {
        status: 'failed',
        retryCount: 5,
      });
      await expect(syncQueueManager.clearFailedItems(true)).resolves.toBe(1);

      unsub1();
      unsub2();
    });
  });
});
