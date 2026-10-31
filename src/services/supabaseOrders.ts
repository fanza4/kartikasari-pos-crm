import { supabase, isSupabaseConfigured, isNetworkOnline } from '../lib/supabase';
import { Order, OrderStatus, PaymentStatus, OrderPaymentMethod, OrderType } from '../types';

/**
 * Converts a database row from Supabase 'orders' table to the client Order model.
 */
export const mapRowToOrder = (row: any): Order => {
  return {
    id: row.id,
    customerName: row.customer_name || 'Pelanggan',
    customerWhatsapp: row.customer_whatsapp || undefined,
    orderType: (row.order_type as OrderType) || 'dine_in',
    tableNumber: row.table_number || undefined,
    items: Array.isArray(row.items) ? row.items : [],
    totalAmount: Number(row.total_amount) || 0,
    paymentMethod: (row.payment_method as OrderPaymentMethod) || 'cash',
    paymentStatus: (row.payment_status as PaymentStatus) || 'Menunggu Pembayaran',
    orderStatus: (row.order_status as OrderStatus) || 'Pesanan Baru',
    createdAt: row.created_at || new Date().toISOString(),
    paidAt: row.paid_at || undefined,
    processedAt: row.processed_at || undefined,
    readyAt: row.ready_at || undefined,
    completedAt: row.completed_at || undefined,
    cancelledAt: row.cancelled_at || undefined,
    paymentReference: row.payment_reference || undefined,
    notes: row.notes || undefined,
  };
};

/**
 * Converts client Order model to database row for Supabase 'orders' table.
 */
export const mapOrderToRow = (order: Order): any => {
  return {
    id: order.id,
    customer_name: order.customerName,
    customer_whatsapp: order.customerWhatsapp || null,
    order_type: order.orderType,
    table_number: order.tableNumber || null,
    items: order.items || [],
    total_amount: order.totalAmount,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    order_status: order.orderStatus,
    payment_reference: order.paymentReference || null,
    notes: order.notes || null,
    created_at: order.createdAt || new Date().toISOString(),
    paid_at: order.paidAt || null,
    processed_at: order.processedAt || null,
    ready_at: order.readyAt || null,
    completed_at: order.completedAt || null,
    cancelled_at: order.cancelledAt || null,
  };
};

/**
 * Pushes an order to Supabase cloud immediately.
 */
export const pushOrderToCloud = async (order: Order): Promise<boolean> => {
  if (!isSupabaseConfigured() || !isNetworkOnline()) {
    return false;
  }

  try {
    const row = mapOrderToRow(order);
    const { error } = await supabase.from('orders').upsert([row]);
    if (error) {
      console.warn('Failed to push order to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Network exception pushing order to Supabase:', err.message);
    return false;
  }
};

/**
 * Fetches all orders from Supabase cloud.
 */
export const fetchCloudOrders = async (): Promise<Order[]> => {
  if (!isSupabaseConfigured() || !isNetworkOnline()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Failed to fetch cloud orders:', error?.message);
      return [];
    }

    return data.map(mapRowToOrder);
  } catch (err: any) {
    console.warn('Network exception fetching cloud orders:', err.message);
    return [];
  }
};

/**
 * Subscribes to Supabase Realtime changes on 'orders' table.
 * Calls onChange whenever an order is inserted or updated across ANY connected device.
 */
export const subscribeToCloudOrders = (
  onChange: (order: Order, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
): (() => void) => {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel('realtime_orders_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (payload.new && payload.new.id) {
            const mapped = mapRowToOrder(payload.new);
            onChange(mapped, payload.eventType || 'UPDATE');
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          // Connected to realtime orders
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err: any) {
    console.warn('Failed to setup Supabase realtime subscription:', err.message);
    return () => {};
  }
};
