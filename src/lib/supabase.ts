import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Transaction, Customer, MenuItem } from '../types';
import { saveStoredTransaction, saveStoredCustomer, addToSyncQueue } from './indexedDb';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sample-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sample-anon-key';

// Initialize Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Checks whether valid Supabase credentials have been provided in environment.
 */
export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key && !url.includes('sample-project') && key !== 'sample-anon-key');
};

/**
 * Checks if the browser runtime currently has internet connectivity.
 */
export const isNetworkOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

export interface CloudSyncResult {
  success: boolean;
  syncedToCloud: boolean;
  queuedForSync: boolean;
  error?: string;
}

/**
 * Persists a transaction local-first into IndexedDB.
 * If online and Supabase is configured, attempts cloud push.
 * If cloud push fails or offline, automatically enqueues into local syncQueue.
 */
export const persistTransactionWithSync = async (tx: Transaction): Promise<CloudSyncResult> => {
  // 1. Always save to local IndexedDB first (Zero-Downtime Local-First Guarantee)
  await saveStoredTransaction(tx);

  // 2. Check if we can push to cloud
  if (isSupabaseConfigured() && isNetworkOnline()) {
    try {
      const txTimestamp = tx.timestamp || tx.createdAt || new Date().toISOString();
      const { error } = await supabase.from('transactions').insert([
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

      if (!error) {
        tx.synced = true;
        await saveStoredTransaction(tx);
        return { success: true, syncedToCloud: true, queuedForSync: false };
      }
      console.warn('Supabase transaction insert error:', error.message);
    } catch (err: any) {
      console.warn('Network error pushing transaction to cloud:', err.message);
    }
  }

  // 3. Fallback: Queue for background sync on reconnect
  await addToSyncQueue({
    type: 'transaction',
    action: 'insert',
    payload: tx,
  });

  return { success: true, syncedToCloud: false, queuedForSync: true };
};

/**
 * Persists a customer local-first into IndexedDB.
 * Enqueues into sync queue if cloud unavailable.
 */
export const persistCustomerWithSync = async (customer: Customer): Promise<CloudSyncResult> => {
  // 1. Save to local IndexedDB
  await saveStoredCustomer(customer);

  // 2. Cloud sync if configured and online
  if (isSupabaseConfigured() && isNetworkOnline()) {
    try {
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

      if (!error) {
        return { success: true, syncedToCloud: true, queuedForSync: false };
      }
    } catch (err: any) {
      console.warn('Network error pushing customer to cloud:', err.message);
    }
  }

  // 3. Queue for offline sync
  await addToSyncQueue({
    type: 'customer',
    action: 'update',
    payload: customer,
  });

  return { success: true, syncedToCloud: false, queuedForSync: true };
};

/**
 * Optional cloud pull for menu items if configured.
 */
export const fetchCloudMenu = async (): Promise<MenuItem[] | null> => {
  if (!isSupabaseConfigured() || !isNetworkOnline()) return null;
  try {
    const { data, error } = await supabase.from('menu_items').select('*');
    if (!error && data && data.length > 0) {
      return data as MenuItem[];
    }
  } catch (err) {
    console.warn('Failed to fetch cloud menu:', err);
  }
  return null;
};
