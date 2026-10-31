import { openDB, IDBPDatabase } from 'idb';
import { MenuItem, Transaction, Customer, StoreSettings, SyncQueueItem } from '../types';
import { MENU_ITEMS, DEFAULT_STORE_SETTINGS, SEED_CUSTOMERS } from '../data/menu';

export type { SyncQueueItem };

const DB_NAME = 'kartikasari_pos_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<any>> | null = null;
const isIndexedDBSupported = typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;

// Memory fallback store for environments without IndexedDB or when IndexedDB throws runtime errors
const memoryFallback = {
  menu: new Map<string, MenuItem>(),
  transactions: new Map<string, Transaction>(),
  customers: new Map<string, Customer>(),
  settings: new Map<string, any>(),
  syncQueue: new Map<string, SyncQueueItem>(),
};

export const getDB = async (): Promise<IDBPDatabase<any> | null> => {
  if (!isIndexedDBSupported) return null;
  try {
    if (!dbPromise) {
      dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('menu')) {
            db.createObjectStore('menu', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('transactions')) {
            const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
            txStore.createIndex('by-timestamp', 'timestamp');
          }
          if (!db.objectStoreNames.contains('customers')) {
            const custStore = db.createObjectStore('customers', { keyPath: 'id' });
            custStore.createIndex('by-phone', 'phone');
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains('syncQueue')) {
            const qStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
            qStore.createIndex('by-status', 'status');
            qStore.createIndex('by-timestamp', 'timestamp');
          }
        },
      });
    }
    return await dbPromise;
  } catch (err) {
    console.warn('[IndexedDB] Failed to open database, falling back to memory store:', err);
    dbPromise = null;
    return null;
  }
};

/**
 * Initializes the database and seeds defaults if empty.
 */
export const initIndexedDB = async (): Promise<void> => {
  try {
    const db = await getDB();
    if (db) {
      const menuCount = await db.count('menu');
      if (menuCount === 0) {
        const tx = db.transaction('menu', 'readwrite');
        for (const item of MENU_ITEMS) {
          await tx.store.put(item);
        }
        await tx.done;
      }

      const custCount = await db.count('customers');
      if (custCount === 0) {
        const tx = db.transaction('customers', 'readwrite');
        for (const cust of SEED_CUSTOMERS) {
          await tx.store.put(cust);
        }
        await tx.done;
      }

      const currentSettings = await db.get('settings', 'store_settings');
      if (!currentSettings) {
        await db.put('settings', { key: 'store_settings', value: DEFAULT_STORE_SETTINGS });
      }
      return;
    }
  } catch (err) {
    console.warn('[IndexedDB] initIndexedDB failed, initializing memory fallback:', err);
    dbPromise = null;
  }

  // Populate memory fallback
  if (memoryFallback.menu.size === 0) {
    MENU_ITEMS.forEach((item) => memoryFallback.menu.set(item.id, item));
  }
  if (memoryFallback.customers.size === 0) {
    SEED_CUSTOMERS.forEach((c) => memoryFallback.customers.set(c.id, c));
  }
  if (!memoryFallback.settings.has('store_settings')) {
    memoryFallback.settings.set('store_settings', { key: 'store_settings', value: DEFAULT_STORE_SETTINGS });
  }
};

// ==========================================
// MENU STORE OPERATIONS
// ==========================================

export const getStoredMenu = async (): Promise<MenuItem[]> => {
  try {
    const db = await getDB();
    if (db) {
      const items = await db.getAll('menu');
      if (items.length > 0) return items;
      await initIndexedDB();
      return await db.getAll('menu');
    }
  } catch (err) {
    console.warn('[IndexedDB] getStoredMenu failed, using memory fallback:', err);
  }
  if (memoryFallback.menu.size === 0) {
    await initIndexedDB();
  }
  return Array.from(memoryFallback.menu.values());
};

export const saveStoredMenuItem = async (item: MenuItem): Promise<void> => {
  try {
    const db = await getDB();
    if (db) {
      await db.put('menu', item);
      return;
    }
  } catch (err) {
    console.warn('[IndexedDB] saveStoredMenuItem failed, saving to memory fallback:', err);
  }
  memoryFallback.menu.set(item.id, item);
};

export const saveStoredMenu = async (items: MenuItem[]): Promise<void> => {
  try {
    const db = await getDB();
    if (db) {
      const tx = db.transaction('menu', 'readwrite');
      for (const item of items) {
        await tx.store.put(item);
      }
      await tx.done;
      return;
    }
  } catch (err) {
    console.warn('[IndexedDB] saveStoredMenu failed, saving to memory fallback:', err);
  }
  items.forEach((item) => memoryFallback.menu.set(item.id, item));
};

// ==========================================
// TRANSACTIONS STORE OPERATIONS
// ==========================================

export const getStoredTransactions = async (): Promise<Transaction[]> => {
  try {
    const db = await getDB();
    if (db) {
      const txs = await db.getAll('transactions');
      if (memoryFallback.transactions.size > 0) {
        const txMap = new Map<string, Transaction>();
        txs.forEach((t) => txMap.set(t.id, t));
        memoryFallback.transactions.forEach((t) => txMap.set(t.id, t));
        return Array.from(txMap.values()).sort(
          (a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime()
        );
      }
      return txs.sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime());
    }
  } catch (err) {
    console.warn('[IndexedDB] getStoredTransactions failed, using memory fallback:', err);
  }
  return Array.from(memoryFallback.transactions.values()).sort(
    (a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime()
  );
};

export const saveStoredTransaction = async (tx: Transaction): Promise<void> => {
  try {
    const db = await getDB();
    if (db) {
      await db.put('transactions', tx);
      return;
    }
  } catch (err) {
    console.warn('[IndexedDB] saveStoredTransaction failed, saving to memory fallback:', err);
  }
  memoryFallback.transactions.set(tx.id, tx);
};

export const getStoredTransactionById = async (id: string): Promise<Transaction | undefined> => {
  try {
    const db = await getDB();
    if (db) {
      const tx = await db.get('transactions', id);
      if (tx) return tx;
    }
  } catch (err) {
    console.warn('[IndexedDB] getStoredTransactionById failed, searching memory fallback:', err);
  }
  return memoryFallback.transactions.get(id);
};

// ==========================================
// CUSTOMER STORE OPERATIONS
// ==========================================

export const getStoredCustomers = async (): Promise<Customer[]> => {
  try {
    const db = await getDB();
    if (db) {
      const customers = await db.getAll('customers');
      if (customers.length > 0) {
        if (memoryFallback.customers.size > 0) {
          const custMap = new Map<string, Customer>();
          customers.forEach((c) => custMap.set(c.id, c));
          memoryFallback.customers.forEach((c) => custMap.set(c.id, c));
          return Array.from(custMap.values());
        }
        return customers;
      }
      await initIndexedDB();
      return await db.getAll('customers');
    }
  } catch (err) {
    console.warn('[IndexedDB] getStoredCustomers failed, using memory fallback:', err);
  }
  if (memoryFallback.customers.size === 0) {
    await initIndexedDB();
  }
  return Array.from(memoryFallback.customers.values());
};

export const saveStoredCustomer = async (customer: Customer): Promise<void> => {
  try {
    const db = await getDB();
    if (db) {
      await db.put('customers', customer);
      return;
    }
  } catch (err) {
    console.warn('[IndexedDB] saveStoredCustomer failed, saving to memory fallback:', err);
  }
  memoryFallback.customers.set(customer.id, customer);
};

/**
 * Normalizes an Indonesian phone number to canonical 628... format.
 * Strips non-digits, handles 08..., +628..., 628..., 8..., and 6208... typos.
 */
export const normalizePhone = (phone?: string | null): string => {
  if (!phone || typeof phone !== 'string') return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('620')) {
    cleaned = '62' + cleaned.substring(3);
  } else if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
};

export const findStoredCustomerByPhone = async (phone: string): Promise<Customer | undefined> => {
  if (!phone || typeof phone !== 'string') return undefined;

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length < 4) return undefined; // Guards against empty or trivial queries

  const normQuery = normalizePhone(phone);
  const customers = await getStoredCustomers();

  return customers.find((c) => {
    // Check all available customer contact fields
    const candidates = [c.phone, c.whatsapp].filter(
      (p): p is string => Boolean(p && typeof p === 'string' && p.trim().length > 0)
    );

    return candidates.some((cp) => {
      const cleanCp = cp.replace(/[^0-9]/g, '');
      const normCp = normalizePhone(cp);

      // 1. Exact canonical match (handles 08 vs 62 vs +62 vs 8)
      if (normQuery && normCp && normQuery === normCp) return true;

      // 2. Exact clean digit match
      if (cleanPhone === cleanCp) return true;

      // 3. Substring match for partial search (e.g. query is suffix of 8+ digits)
      if (cleanPhone.length >= 8 && (cleanCp.includes(cleanPhone) || normCp.includes(normQuery))) {
        return true;
      }
      if (cleanCp.length >= 8 && cleanPhone.includes(cleanCp)) {
        return true;
      }

      return false;
    });
  });
};

// ==========================================
// SETTINGS STORE OPERATIONS
// ==========================================

export const getStoredSettings = async (): Promise<StoreSettings> => {
  try {
    const db = await getDB();
    if (db) {
      const res = await db.get('settings', 'store_settings');
      if (res && res.value) return res.value;
    }
  } catch (err) {
    console.warn('[IndexedDB] getStoredSettings failed, using memory fallback:', err);
  }
  const fallback = memoryFallback.settings.get('store_settings');
  if (fallback && fallback.value) return fallback.value;
  return DEFAULT_STORE_SETTINGS;
};

export const saveStoredSettings = async (settings: StoreSettings): Promise<void> => {
  try {
    const db = await getDB();
    if (db) {
      await db.put('settings', { key: 'store_settings', value: settings });
      return;
    }
  } catch (err) {
    console.warn('[IndexedDB] saveStoredSettings failed, saving to memory fallback:', err);
  }
  memoryFallback.settings.set('store_settings', { key: 'store_settings', value: settings });
};

// ==========================================
// SYNC QUEUE STORE OPERATIONS
// ==========================================

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  try {
    const db = await getDB();
    if (db) {
      const queue = await db.getAll('syncQueue');
      if (memoryFallback.syncQueue.size > 0) {
        const qMap = new Map<string, SyncQueueItem>();
        queue.forEach((item) => qMap.set(item.id, item));
        memoryFallback.syncQueue.forEach((item) => qMap.set(item.id, item));
        return Array.from(qMap.values());
      }
      return queue;
    }
  } catch (err) {
    console.warn('[IndexedDB] getSyncQueue failed, using memory fallback:', err);
  }
  return Array.from(memoryFallback.syncQueue.values());
};

export const addToSyncQueue = async (
  item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'status' | 'retryCount'>
): Promise<SyncQueueItem> => {
  const queueItem: SyncQueueItem = {
    ...item,
    id: 'sync-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    status: 'pending',
    retryCount: 0,
  };

  try {
    const db = await getDB();
    if (db) {
      await db.put('syncQueue', queueItem);
      return queueItem;
    }
  } catch (err) {
    console.warn('[IndexedDB] addToSyncQueue failed, queueing in memory fallback:', err);
  }
  memoryFallback.syncQueue.set(queueItem.id, queueItem);
  return queueItem;
};

export const updateSyncQueueItem = async (id: string, updates: Partial<SyncQueueItem>): Promise<void> => {
  try {
    const db = await getDB();
    if (db) {
      const existing = await db.get('syncQueue', id);
      if (existing) {
        await db.put('syncQueue', { ...existing, ...updates });
      }
    }
  } catch (err) {
    console.warn('[IndexedDB] updateSyncQueueItem failed in IDB, falling back to memory:', err);
  }

  const existing = memoryFallback.syncQueue.get(id);
  if (existing) {
    memoryFallback.syncQueue.set(id, { ...existing, ...updates });
  }
};

export const removeSyncQueueItem = async (id: string): Promise<void> => {
  try {
    const db = await getDB();
    if (db) {
      await db.delete('syncQueue', id);
    }
  } catch (err) {
    console.warn('[IndexedDB] removeSyncQueueItem failed in IDB:', err);
  }
  memoryFallback.syncQueue.delete(id);
};

export const clearCompletedSyncQueue = async (): Promise<void> => {
  try {
    const db = await getDB();
    if (db) {
      const all = await db.getAll('syncQueue');
      const tx = db.transaction('syncQueue', 'readwrite');
      for (const item of all) {
        if (item.status === 'completed') {
          await tx.store.delete(item.id);
        }
      }
      await tx.done;
    }
  } catch (err) {
    console.warn('[IndexedDB] clearCompletedSyncQueue failed in IDB:', err);
  }
  for (const [id, item] of memoryFallback.syncQueue.entries()) {
    if (item.status === 'completed') {
      memoryFallback.syncQueue.delete(id);
    }
  }
};

export const clearFailedSyncQueue = async (): Promise<void> => {
  try {
    const db = await getDB();
    if (db) {
      const all = await db.getAll('syncQueue');
      const tx = db.transaction('syncQueue', 'readwrite');
      for (const item of all) {
        if (item.status === 'failed') {
          await tx.store.delete(item.id);
        }
      }
      await tx.done;
    }
  } catch (err) {
    console.warn('[IndexedDB] clearFailedSyncQueue failed in IDB:', err);
  }
  for (const [id, item] of memoryFallback.syncQueue.entries()) {
    if (item.status === 'failed') {
      memoryFallback.syncQueue.delete(id);
    }
  }
};
