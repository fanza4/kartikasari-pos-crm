import { describe, it, expect } from 'vitest';
import { syncQueueManager } from '../src/lib/syncQueue';
import { addToSyncQueue, clearCompletedSyncQueue } from '../src/lib/indexedDb';

describe('Sync Queue Manager', () => {
  it('reports current sync status and handles subscribers', async () => {
    let capturedStatus: any = null;
    const unsubscribe = syncQueueManager.subscribe((status) => {
      capturedStatus = status;
    });

    // Wait microtask for initial callback
    await new Promise((r) => setTimeout(r, 50));

    expect(capturedStatus).not.toBeNull();
    expect(typeof capturedStatus.isSyncing).toBe('boolean');
    expect(typeof capturedStatus.pendingCount).toBe('number');
    expect(typeof capturedStatus.isOnline).toBe('boolean');

    unsubscribe();
  });

  it('handles offline queue processing safely when offline or unconfigured', async () => {
    await addToSyncQueue({
      type: 'transaction',
      action: 'insert',
      payload: { id: 'offline-tx-test', totalAmount: 26000 },
    });

    const result = await syncQueueManager.processQueue();
    // Since Supabase is unconfigured (dummy url in test), it safely avoids crashing
    expect(result).toBeDefined();
    expect(typeof result.processed).toBe('number');

    await clearCompletedSyncQueue();
  });
});
