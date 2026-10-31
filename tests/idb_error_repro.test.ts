import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Empirical Verification: Zero-Crash Fallback when IndexedDB throws errors', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('verifies seamless memory fallback when openDB rejects with QuotaExceededError', async () => {
    // Define window.indexedDB so isIndexedDBSupported will be true
    (window as any).indexedDB = {};

    // Mock idb to simulate openDB rejecting
    vi.doMock('idb', () => ({
      openDB: vi.fn().mockRejectedValue(new Error('QuotaExceededError: The quota has been exceeded.')),
    }));

    const { saveStoredTransaction, getStoredTransactions, initIndexedDB } = await import('../src/lib/indexedDb');

    // Test 1: initIndexedDB does not crash
    let initError: any = null;
    try {
      await initIndexedDB();
    } catch (e) {
      initError = e;
    }

    // Test 2: saveStoredTransaction does not crash and saves to memory fallback
    let saveError: any = null;
    try {
      await saveStoredTransaction({
        id: 'fail-tx-1',
        timestamp: new Date().toISOString(),
        items: [],
        totalAmount: 10000,
        paymentMethod: 'cash',
        amountPaid: 10000,
        change: 0,
        stampsAwarded: 0,
        synced: false,
      });
    } catch (e) {
      saveError = e;
    }

    // Assert zero-crash: both operations caught the error and fell back gracefully
    expect(initError).toBeNull();
    expect(saveError).toBeNull();

    // Verify transaction was saved to memory fallback and is retrievable
    const txs = await getStoredTransactions();
    expect(txs.some((t) => t.id === 'fail-tx-1')).toBe(true);

    // Clean up
    delete (window as any).indexedDB;
  });

  it('verifies seamless memory fallback when db.put rejects with QuotaExceededError', async () => {
    (window as any).indexedDB = {};

    const mockPut = vi.fn().mockRejectedValue(new Error('QuotaExceededError: Disk Full'));
    const mockDb = {
      objectStoreNames: { contains: () => true },
      count: vi.fn().mockResolvedValue(10),
      put: mockPut,
      get: vi.fn().mockResolvedValue(null),
      getAll: vi.fn().mockResolvedValue([]),
    };

    vi.doMock('idb', () => ({
      openDB: vi.fn().mockResolvedValue(mockDb),
    }));

    const { saveStoredTransaction, getStoredTransactions, getStoredTransactionById } = await import(
      '../src/lib/indexedDb'
    );

    let putError: any = null;
    try {
      await saveStoredTransaction({
        id: 'fail-tx-2',
        timestamp: new Date().toISOString(),
        items: [],
        totalAmount: 10000,
        paymentMethod: 'cash',
        amountPaid: 10000,
        change: 0,
        stampsAwarded: 0,
        synced: false,
      });
    } catch (e) {
      putError = e;
    }

    // Assert zero-crash: put rejection was caught and transaction fell back to memory
    expect(putError).toBeNull();

    // Verify retrievable by ID and in all transactions
    const single = await getStoredTransactionById('fail-tx-2');
    expect(single).toBeDefined();
    expect(single?.id).toBe('fail-tx-2');

    const txs = await getStoredTransactions();
    expect(txs.some((t) => t.id === 'fail-tx-2')).toBe(true);

    delete (window as any).indexedDB;
  });
});
