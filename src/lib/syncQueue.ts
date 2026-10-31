import {
  getSyncQueue,
  updateSyncQueueItem,
  removeSyncQueueItem,
  saveStoredTransaction,
  getStoredTransactionById,
  clearFailedSyncQueue,
} from './indexedDb';
import { supabase, isSupabaseConfigured, isNetworkOnline } from './supabase';
import { Transaction, Customer, SyncStatus, SyncQueueItem } from '../types';

export type { SyncStatus, SyncQueueItem };

type SyncListener = (status: SyncStatus) => void;

class SyncQueueManager {
  private isSyncing = false;
  private lastSyncTime: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private maxRetries = 5;
  private initialized = false;

  constructor() {
    this.handleOnline = this.handleOnline.bind(this);
  }

  public init() {
    if (this.initialized) return;
    this.initialized = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', () => this.notifyListeners());
    }
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
    }
    this.listeners.clear();
    this.initialized = false;
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    // Send immediate initial status
    this.getStatus().then((status) => listener(status));
    return () => this.listeners.delete(listener);
  }

  private async notifyListeners() {
    const status = await this.getStatus();
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (e) {
        console.error('Error in sync listener:', e);
      }
    });
  }

  public async getStatus(): Promise<SyncStatus> {
    const queue = await getSyncQueue();
    const pendingCount = queue.filter(
      (item) => item.status === 'pending' || (item.status === 'failed' && item.retryCount < this.maxRetries)
    ).length;
    const failedCount = queue.filter(
      (item) => item.status === 'failed' && item.retryCount >= this.maxRetries
    ).length;
    const syncingCount = queue.filter((item) => item.status === 'syncing').length;

    return {
      isSyncing: this.isSyncing,
      pendingCount,
      failedCount,
      deadLetterCount: failedCount,
      syncingCount,
      totalQueued: queue.length,
      lastSyncTime: this.lastSyncTime,
      isOnline: isNetworkOnline(),
      isCloudConfigured: isSupabaseConfigured(),
    };
  }

  /**
   * Retrieves failed queue items for inspection.
   * @param deadLetterOnly If true, returns only items that reached max retries. Default false.
   */
  public async getFailedItems(deadLetterOnly = false): Promise<SyncQueueItem[]> {
    const queue = await getSyncQueue();
    return queue.filter((item) =>
      deadLetterOnly
        ? item.status === 'failed' && item.retryCount >= this.maxRetries
        : item.status === 'failed'
    );
  }

  /**
   * Resets failed queue items back to 'pending' with retryCount = 0.
   * @param deadLetterOnly If true, only resets items that reached max retries. Default false.
   * @returns Number of reset items
   */
  public async resetFailedItems(deadLetterOnly = false): Promise<number> {
    const queue = await getSyncQueue();
    const failedItems = queue.filter((item) =>
      deadLetterOnly
        ? item.status === 'failed' && item.retryCount >= this.maxRetries
        : item.status === 'failed'
    );

    for (const item of failedItems) {
      await updateSyncQueueItem(item.id, {
        status: 'pending',
        retryCount: 0,
      });
    }

    if (failedItems.length > 0) {
      await this.notifyListeners();
    }

    return failedItems.length;
  }

  /**
   * Resets failed items and triggers immediate queue synchronization.
   * Prevents re-entrancy if already syncing.
   */
  public async retryFailedItems(): Promise<{
    resetCount: number;
    processed: number;
    succeeded: number;
    failed: number;
  }> {
    if (this.isSyncing) {
      return { resetCount: 0, processed: 0, succeeded: 0, failed: 0 };
    }

    const resetCount = await this.resetFailedItems();
    if (resetCount === 0) {
      return { resetCount: 0, processed: 0, succeeded: 0, failed: 0 };
    }

    const processResult = await this.processQueue();
    return {
      resetCount,
      ...processResult,
    };
  }

  /**
   * Clears failed/dead-letter items from the sync queue.
   */
  public async clearFailedItems(deadLetterOnly = true): Promise<number> {
    const failedItems = await this.getFailedItems(deadLetterOnly);
    for (const item of failedItems) {
      await removeSyncQueueItem(item.id);
    }
    if (failedItems.length > 0) {
      await this.notifyListeners();
    }
    return failedItems.length;
  }

  private async handleOnline() {
    console.log('[SyncQueue] Network connectivity restored. Initiating automatic synchronization...');
    this.notifyListeners();
    await this.processQueue();
  }

  /**
   * Manually or automatically trigger processing of the offline sync queue.
   */
  public async processQueue(): Promise<{ processed: number; succeeded: number; failed: number }> {
    if (this.isSyncing) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    if (!isSupabaseConfigured() || !isNetworkOnline()) {
      await this.notifyListeners();
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    this.isSyncing = true;
    await this.notifyListeners();

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    try {
      const queue = await getSyncQueue();
      const itemsToProcess = queue.filter(
        (item) => item.status === 'pending' || (item.status === 'failed' && item.retryCount < this.maxRetries)
      );

      for (const item of itemsToProcess) {
        processed++;
        await updateSyncQueueItem(item.id, { status: 'syncing' });

        try {
          if (item.type === 'transaction') {
            const tx: Transaction = item.payload;
            const txTimestamp = tx.timestamp || tx.createdAt || new Date().toISOString();
            const { error } = await supabase.from('transactions').upsert([
              {
                id: tx.id,
                invoice_number: tx.invoiceNumber || tx.id,
                timestamp: txTimestamp,
                items: tx.items,
                total_amount: tx.totalAmount,
                payment_method: tx.paymentMethod,
                amount_paid: tx.amountPaid ?? tx.cashGiven ?? tx.totalAmount,
                cash_given: tx.cashGiven ?? tx.amountPaid ?? tx.totalAmount,
                change_amount: tx.change ?? tx.changeAmount ?? 0,
                customer_name: tx.customerName || null,
                customer_phone: tx.customerPhone || tx.customerWhatsapp || null,
                customer_whatsapp: tx.customerWhatsapp || tx.customerPhone || null,
                stamps_awarded: tx.stampsAwarded ?? tx.stampsEarned ?? 0,
                stamps_earned: tx.stampsEarned ?? tx.stampsAwarded ?? 0,
                order_type: tx.orderType || 'dine_in',
                table_number: tx.tableNumber || null,
                notes: tx.notes || null,
                created_at: txTimestamp,
              },
            ]);

            if (error) throw new Error(error.message);

            // Update local stored transaction to mark synced = true
            const localTx = await getStoredTransactionById(tx.id);
            if (localTx) {
              localTx.synced = true;
              await saveStoredTransaction(localTx);
            }
          } else if (item.type === 'customer') {
            const customer: Customer = item.payload;
            const visitDate = customer.lastVisitDate || customer.lastVisit || new Date().toISOString();
            const { error } = await supabase.from('customers').upsert([
              {
                id: customer.id,
                name: customer.name,
                phone: customer.phone || customer.whatsapp || '',
                whatsapp: customer.whatsapp || customer.phone || '',
                total_visits: customer.totalVisits || 1,
                lifetime_value: customer.lifetimeValue || 0,
                stamps_count: customer.stampsCount || 0,
                rewards_claimed: customer.rewardsClaimed || 0,
                last_visit_date: visitDate,
                last_visit: visitDate,
                segment: customer.segment || 'Pelanggan Baru',
              },
            ]);

            if (error) throw new Error(error.message);
          }

          // Successfully synced
          await removeSyncQueueItem(item.id);
          succeeded++;
        } catch (err: any) {
          failed++;
          console.warn(`[SyncQueue] Failed to sync item ${item.id}:`, err.message);
          await updateSyncQueueItem(item.id, {
            status: 'failed',
            retryCount: item.retryCount + 1,
            lastError: err.message,
          });
        }
      }

      this.lastSyncTime = new Date().toISOString();
    } finally {
      this.isSyncing = false;
      await this.notifyListeners();
    }

    return { processed, succeeded, failed };
  }
}

export const syncQueueManager = new SyncQueueManager();

// Initialize listener on import in browser environments
if (typeof window !== 'undefined') {
  syncQueueManager.init();
}
