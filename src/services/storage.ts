import { Customer, Transaction, StoreSettings, CustomerSegment, Order, CustomerOrderItem, OrderStatus, OrderPaymentMethod, PaymentStatus, MenuItem } from '../types';
import { DEFAULT_STORE_SETTINGS, SEED_CUSTOMERS } from '../data/menuData';
import { pushOrderToCloud } from './supabaseOrders';
import { pushCustomerToCloud } from './supabaseCustomers';

const STORAGE_KEYS = {
  CUSTOMERS: 'ks_customers_v1',
  TRANSACTIONS: 'ks_transactions_v1',
  SETTINGS: 'ks_settings_v1',
  ADMIN_SESSION: 'ks_admin_session_v1',
  SYNC_QUEUE: 'ks_sync_queue_v1',
  ORDERS: 'ks_orders_v1',
  CUSTOMER_CART: 'ks_customer_cart_v1',
  ACTIVE_ORDER_ID: 'ks_active_order_id_v1',
  MENU_PHOTOS: 'ks_menu_photos_v1',
};

// --- Formatter Helpers ---
export const formatRupiah = (amount: number): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp 0';
  }
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted}`;
};

export const formatDateIndo = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return dateStr;
  }
};

// Customer segment analyzer
export const getCustomerSegment = (customer: Customer): CustomerSegment => {
  const daysSinceLastVisit = (Date.now() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24);

  if (customer.totalVisits > 5) {
    if (daysSinceLastVisit > 30) return 'at_risk';
    return 'vip';
  }
  if (daysSinceLastVisit > 30) {
    return 'at_risk';
  }
  if (customer.totalVisits <= 1) {
    return 'new';
  }
  return 'regular';
};

export const getSegmentBadge = (segment: CustomerSegment) => {
  switch (segment) {
    case 'vip':
      return {
        label: 'VIP / Langganan Tetap',
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        badge: '👑 VIP',
      };
    case 'new':
      return {
        label: 'Pelanggan Baru',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        badge: '🌱 Baru',
      };
    case 'at_risk':
      return {
        label: 'At-Risk / Perlu Disapa',
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        badge: '⚠️ Butuh Sapaan',
      };
    default:
      return {
        label: 'Pelanggan Setia',
        bg: 'bg-blue-100 text-blue-800 border-blue-300',
        badge: '🍜 Reguler',
      };
  }
};

// --- Storage API ---

// 1. Settings
export const getStoreSettings = (): StoreSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_STORE_SETTINGS,
        ...parsed,
        qrisImageUrl: (parsed.qrisImageUrl && parsed.qrisImageUrl !== '/logo.jpg')
          ? parsed.qrisImageUrl
          : DEFAULT_STORE_SETTINGS.qrisImageUrl,
        mapsDirectUrl: parsed.mapsDirectUrl && parsed.mapsDirectUrl.includes('goo.gl')
          ? parsed.mapsDirectUrl
          : DEFAULT_STORE_SETTINGS.mapsDirectUrl,
        mapsEmbedUrl: parsed.mapsEmbedUrl && parsed.mapsEmbedUrl.includes('Kartika+Sari')
          ? parsed.mapsEmbedUrl
          : DEFAULT_STORE_SETTINGS.mapsEmbedUrl,
      };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_STORE_SETTINGS;
};

export const saveStoreSettings = (settings: StoreSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ks_settings_updated', { detail: settings }));
  }
};

export const updateStoreQrisImage = (qrisDataUrl: string): StoreSettings => {
  const current = getStoreSettings();
  const updated: StoreSettings = { ...current, qrisImageUrl: qrisDataUrl };
  saveStoreSettings(updated);
  return updated;
};

export const resetStoreQrisImage = (): StoreSettings => {
  const current = getStoreSettings();
  const updated: StoreSettings = { ...current, qrisImageUrl: DEFAULT_STORE_SETTINGS.qrisImageUrl };
  saveStoreSettings(updated);
  return updated;
};

// 2. Customers
export const getCustomers = (): Customer[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load customers:', e);
  }
  // Initialize with seed
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
  return SEED_CUSTOMERS;
};

export const saveCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  const index = customers.findIndex((c) => c.id === customer.id || (c.whatsapp && customer.whatsapp && c.whatsapp === customer.whatsapp));
  if (index >= 0) {
    customers[index] = { ...customers[index], ...customer };
  } else {
    customers.unshift(customer);
  }
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));

  // Dispatch custom event for real-time CRM updates across components in this window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ks_customer_event', { detail: { type: 'save', customer } }));
  }

  // Push to Supabase Cloud so all devices/screens share customer data in real-time
  pushCustomerToCloud(customer).catch((err) => {
    console.warn('Silent cloud customer sync warning:', err);
  });
};

export const deleteCustomer = (customerId: string): boolean => {
  const customers = getCustomers();
  const filtered = customers.filter((c) => c.id !== customerId);
  if (filtered.length !== customers.length) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(filtered));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ks_customer_event', { detail: { type: 'delete', customerId } }));
    }
    return true;
  }
  return false;
};

export const updateCustomerStamps = (customerId: string, delta: number): Customer | undefined => {
  const customers = getCustomers();
  const cust = customers.find((c) => c.id === customerId);
  if (!cust) return undefined;
  cust.stampsCount = Math.max(0, Math.min(10, (cust.stampsCount || 0) + delta));
  saveCustomer(cust);
  return cust;
};

export const getCustomerOrderHistory = (phoneOrName: string): { orders: Order[]; transactions: Transaction[] } => {
  const clean = phoneOrName.trim().toLowerCase();
  const cleanPhone = phoneOrName.replace(/[^0-9]/g, '');
  const normCleanPhone = cleanPhone.replace(/^62/, '0');

  const orders = getOrders().filter((o) => {
    if (clean && o.customerName && o.customerName.toLowerCase().includes(clean)) return true;
    if (cleanPhone && o.customerWhatsapp) {
      const p = o.customerWhatsapp.replace(/[^0-9]/g, '').replace(/^62/, '0');
      if (p.includes(normCleanPhone) || normCleanPhone.includes(p)) return true;
    }
    return false;
  });

  const transactions = getTransactions().filter((t) => {
    if (clean && t.customerName && t.customerName.toLowerCase().includes(clean)) return true;
    if (cleanPhone && t.customerWhatsapp) {
      const p = t.customerWhatsapp.replace(/[^0-9]/g, '').replace(/^62/, '0');
      if (p.includes(normCleanPhone) || normCleanPhone.includes(p)) return true;
    }
    return false;
  });

  return { orders, transactions };
};

export const subscribeToCrmChanges = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = () => callback();
  const handleStorageEvent = (e: StorageEvent) => {
    if (
      e.key === STORAGE_KEYS.CUSTOMERS ||
      e.key === STORAGE_KEYS.TRANSACTIONS ||
      e.key === STORAGE_KEYS.ORDERS
    ) {
      callback();
    }
  };

  window.addEventListener('ks_customer_event', handleCustomEvent);
  window.addEventListener('ks_transaction_event', handleCustomEvent);
  window.addEventListener('ks_order_event', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  // Periodic heartbeat polling check (gentle and only when document is visible)
  const interval = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      callback();
    }
  }, 10000);

  return () => {
    window.removeEventListener('ks_customer_event', handleCustomEvent);
    window.removeEventListener('ks_transaction_event', handleCustomEvent);
    window.removeEventListener('ks_order_event', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    clearInterval(interval);
  };
};

export const findCustomerByPhoneOrName = (query: string): Customer | undefined => {
  const cleanQuery = query.trim().toLowerCase();
  const cleanPhone = query.replace(/[^0-9]/g, '');
  const normCleanPhone = cleanPhone.replace(/^62/, '0');
  const customers = getCustomers();

  return customers.find((c) => {
    const phoneDigits = c.whatsapp.replace(/[^0-9]/g, '');
    const normPhoneDigits = phoneDigits.replace(/^62/, '0');
    if (cleanPhone && (phoneDigits.includes(cleanPhone) || normPhoneDigits.includes(normCleanPhone) || cleanPhone.includes(phoneDigits) || normCleanPhone.includes(normPhoneDigits))) return true;
    return c.name.toLowerCase().includes(cleanQuery);
  });
};

// 3. Transactions
export const getTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load transactions:', e);
  }
  return [];
};

export const saveTransaction = (tx: Transaction): void => {
  const transactions = getTransactions();
  transactions.unshift(tx);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

  // Update or create customer profile
  if (tx.customerWhatsapp || tx.customerName) {
    const existing = findCustomerByPhoneOrName(tx.customerWhatsapp || tx.customerName || '');
    const orderRef = tx.invoiceNumber || tx.id;
    if (existing) {
      existing.totalVisits += 1;
      existing.lastVisit = tx.createdAt;
      if (!existing.lastOrderPaidTracked?.includes(orderRef)) {
        existing.lifetimeValue += tx.totalAmount;
        existing.lastOrderPaidTracked = [...(existing.lastOrderPaidTracked || []), orderRef];
      }
      if (!existing.stampsOrdersTracked?.includes(orderRef)) {
        existing.stampsCount = Math.min(10, (existing.stampsCount || 0) + (tx.stampsEarned || 0));
        existing.stampsOrdersTracked = [...(existing.stampsOrdersTracked || []), orderRef];
      }
      if (tx.rewardClaimed) {
        existing.stampsCount = 0; // Reset after claim
        existing.rewardsClaimed = (existing.rewardsClaimed || 0) + 1;
      }
      saveCustomer(existing);
    } else if (tx.customerWhatsapp) {
      const newCust: Customer = {
        id: 'cust-' + Date.now(),
        name: tx.customerName || 'Pelanggan Kartika Sari',
        whatsapp: tx.customerWhatsapp,
        phone: tx.customerWhatsapp,
        totalVisits: 1,
        lifetimeValue: tx.totalAmount,
        lastVisit: tx.createdAt,
        stampsCount: Math.min(10, tx.stampsEarned || 0),
        stampsOrdersTracked: [orderRef],
        lastOrderPaidTracked: [orderRef],
        rewardsClaimed: 0,
        createdAt: tx.createdAt,
      };
      saveCustomer(newCust);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ks_transaction_event', { detail: tx }));
    window.dispatchEvent(new CustomEvent('ks_customer_event', { detail: { type: 'transaction', transaction: tx } }));
  }
};

// 4. WhatsApp Integrations
export const generateReceiptText = (tx: Transaction, settings: StoreSettings): string => {
  const itemsText = tx.items
    .map((item) => {
      const toppings = item.selectedToppings.length > 0 ? ` (+${item.selectedToppings.map((t) => t.name).join(', ')})` : '';
      const notes = item.notes ? ` [Catatan: ${item.notes}]` : '';
      return `• ${item.quantity}x ${item.menuItem.name}${toppings} = ${formatRupiah(item.itemTotal)}${notes}`;
    })
    .join('\n');

  const paymentDetails =
    tx.paymentMethod === 'cash'
      ? `Bayar Tunai: ${formatRupiah(tx.cashGiven || tx.totalAmount)}\nKembalian: ${formatRupiah(tx.changeAmount || 0)}`
      : `Metode: QRIS KS (Lunas)`;

  const stampInfo = tx.rewardClaimed
    ? `🎉 SELAMAT! Anda telah mengklaim 1 porsi GRATIS stempel ke-10!`
    : `🍜 Stempel Kunjungan: +${tx.stampsEarned} stempel diperoleh. Kumpulkan 10 stempel untuk 1 porsi gratis!`;

  const orderTypeLine = tx.orderType
    ? `Tipe     : ${tx.orderType === 'takeaway' ? 'Bawa Pulang (Takeaway)' : `Makan di Tempat (Meja ${tx.tableNumber || '-'})`}\n`
    : '';
  const notesLine = tx.notes ? `Catatan  : ${tx.notes}\n` : '';

  return `*STRUK DIGITAL — ${settings.storeName.toUpperCase()}*
${settings.address}
WA Toko: ${settings.phone}
----------------------------------------
No. Nota : ${tx.invoiceNumber}
Waktu    : ${formatDateIndo(tx.createdAt)}
Pelanggan: ${tx.customerName || 'Tamu KS'}
${orderTypeLine}${notesLine}----------------------------------------
*PESANAN:*
${itemsText}
----------------------------------------
*TOTAL: ${formatRupiah(tx.totalAmount)}*
${paymentDetails}
----------------------------------------
${stampInfo}

Hatur nuhun tos jajan di Mie Baso Kartika Sari Garut! Raosna mantap, sumping deui nya! 🙏`;
};

export const getReceiptWhatsAppUrl = (tx: Transaction, settings: StoreSettings): string => {
  const text = encodeURIComponent(generateReceiptText(tx, settings));
  let phone = tx.customerWhatsapp ? tx.customerWhatsapp.replace(/[^0-9]/g, '') : '';
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  }
  return `https://wa.me/${phone}?text=${text}`;
};

export const getPromoWhatsAppUrl = (customer: Customer, promoTextTemplate?: string): string => {
  let phone = customer.whatsapp.replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  }

  const defaultTemplate = `Sampurasun Kak {nama}! 🍜
Sudah rindu semangkuk Mie Baso hangat dari Kartika Sari Garut?
Spesial untuk Kakak, tunjukkan pesan WhatsApp ini saat berkunjung minggu ini untuk mendapatkan *FREE Es Jeruk Segar / Teh Botol* pada pembelian paket komplit!

📍 Lokasi: Jl. Otista No 127 Paseban (Depan Rumah Beku), Garut.
Ditunggu kehadirannya ya Kak! 🙏`;

  const template = promoTextTemplate || defaultTemplate;
  const message = template.replace(/{nama}/g, customer.name);

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

// ==========================================
// 5. CUSTOMER ONLINE ORDERS
// ==========================================

export const generateOrderId = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KS-ORD-${year}${month}${day}-${rand}`;
};

export const getOrders = (): Order[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load orders:', e);
  }
  return [];
};

export const calculateOrderStamps = (order: Order): number => {
  if (!order || !order.items || !Array.isArray(order.items)) return 0;
  return order.items.reduce((acc, item) => {
    const isNoodle = Boolean(
      item.givesStamp ||
      (item as any).isNoodlePortion ||
      ['mie_kuah', 'yamin_manis', 'yamin_asin'].includes(item.category)
    );
    return isNoodle ? acc + (item.quantity || 1) : acc;
  }, 0);
};

export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.unshift(order);
  }
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

  // Auto-sync customer profile to CRM immediately upon order
  if (order.customerWhatsapp || order.customerName) {
    const isPaid = order.paymentStatus === 'Sudah Dibayar';
    const earnedStamps = calculateOrderStamps(order);
    const existing = findCustomerByPhoneOrName(order.customerWhatsapp || order.customerName || '');

    if (!existing && (order.customerWhatsapp || order.customerName)) {
      const newCust: Customer = {
        id: 'cust-' + Date.now(),
        name: order.customerName || 'Pelanggan Kartika Sari',
        whatsapp: order.customerWhatsapp || '',
        phone: order.customerWhatsapp || '',
        totalVisits: 1,
        lifetimeValue: isPaid ? order.totalAmount : 0,
        stampsCount: isPaid ? Math.min(10, earnedStamps) : 0,
        stampsOrdersTracked: isPaid ? [order.id] : [],
        lastOrderPaidTracked: isPaid ? [order.id] : [],
        rewardsClaimed: 0,
        lastVisit: order.createdAt,
        createdAt: order.createdAt,
        segment: 'Pelanggan Baru',
      };
      saveCustomer(newCust);
    } else if (existing) {
      existing.lastVisit = order.createdAt;
      if (isPaid) {
        if (!existing.lastOrderPaidTracked?.includes(order.id)) {
          existing.lifetimeValue = (existing.lifetimeValue || 0) + order.totalAmount;
          existing.lastOrderPaidTracked = [...(existing.lastOrderPaidTracked || []), order.id];
        }
        if (!existing.stampsOrdersTracked?.includes(order.id)) {
          existing.stampsCount = Math.min(10, (existing.stampsCount || 0) + earnedStamps);
          existing.stampsOrdersTracked = [...(existing.stampsOrdersTracked || []), order.id];
        }
      }
      saveCustomer(existing);
    }
  }

  // Dispatch custom event for real-time listener in the same window/tabs
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ks_order_event', { detail: order }));
    window.dispatchEvent(new CustomEvent('ks_customer_event', { detail: { type: 'order', order } }));
  }

  // Push immediately to Supabase Cloud so all devices/screens see the order in real-time
  pushOrderToCloud(order).catch((err) => {
    console.warn('Silent cloud order sync warning:', err);
  });
};

export const getOrderById = (id: string): Order | undefined => {
  const orders = getOrders();
  return orders.find((o) => o.id === id);
};

export const updateOrderStatus = (
  orderId: string,
  newOrderStatus: OrderStatus,
  newPaymentStatus?: PaymentStatus
): Order | undefined => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return undefined;

  order.orderStatus = newOrderStatus;
  const now = new Date().toISOString();

  if (newPaymentStatus) {
    order.paymentStatus = newPaymentStatus;
    if (newPaymentStatus === 'Sudah Dibayar' && !order.paidAt) {
      order.paidAt = now;
    }
  }

  if (newOrderStatus === 'Sedang Diproses' && !order.processedAt) {
    order.processedAt = now;
  } else if (newOrderStatus === 'Siap Diambil' && !order.readyAt) {
    order.readyAt = now;
  } else if (newOrderStatus === 'Selesai' && !order.completedAt) {
    order.completedAt = now;
    if (order.paymentStatus !== 'Sudah Dibayar') {
      order.paymentStatus = 'Sudah Dibayar';
      if (!order.paidAt) order.paidAt = now;
    }

    // Award stamps and record to CRM/Transactions if customer info is present
    const noodleStamps = calculateOrderStamps(order);
    const mockTx: Transaction = {
      id: 'tx-ord-' + order.id,
      invoiceNumber: order.id,
      customerName: order.customerName,
      customerWhatsapp: order.customerWhatsapp || '',
      items: order.items.map((i) => ({
        cartItemId: i.cartItemId,
        quantity: i.quantity,
        selectedToppings: i.selectedToppings,
        notes: i.notes,
        itemTotal: i.subtotal,
        menuItem: {
          id: i.menuItemId,
          name: i.name,
          category: (i.category as any) || 'mie_kuah',
          portionType: 'seporsi',
          price: i.unitPrice,
          composition: '',
          givesStamp: !!i.givesStamp,
          isNoodlePortion: !!i.givesStamp,
          isAvailable: true,
          image: '',
          description: '',
        } as MenuItem,
      })),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      cashGiven: order.totalAmount,
      changeAmount: 0,
      stampsEarned: noodleStamps,
      rewardClaimed: false,
      createdAt: order.createdAt,
      status: 'completed',
    };
    saveTransaction(mockTx);
  } else if (newOrderStatus === 'Dibatalkan' && !order.cancelledAt) {
    order.cancelledAt = now;
  }

  saveOrder(order);
  return order;
};

export const confirmOrderPayment = (
  orderId: string,
  method?: OrderPaymentMethod
): Order | undefined => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return undefined;

  const now = new Date().toISOString();
  order.paymentStatus = 'Sudah Dibayar';
  order.paidAt = now;
  if (method) {
    order.paymentMethod = method;
  }

  // Once paid, if it was in 'Menunggu Pembayaran' or 'Pesanan Baru', move into 'Sedang Diproses'
  if (order.orderStatus === 'Menunggu Pembayaran' || order.orderStatus === 'Pesanan Baru') {
    order.orderStatus = 'Sedang Diproses';
    order.processedAt = now;
  }

  saveOrder(order);
  return order;
};

export const simulateQrisPaymentVerification = (
  orderId: string
): { success: boolean; order?: Order; message: string } => {
  const order = getOrderById(orderId);
  if (!order) {
    return { success: false, message: 'Pesanan tidak ditemukan' };
  }
  if (order.paymentStatus === 'Sudah Dibayar') {
    return { success: true, order, message: 'Pembayaran sudah terverifikasi sebelumnya' };
  }

  const now = new Date().toISOString();
  order.paymentStatus = 'Sudah Dibayar';
  order.paidAt = now;
  order.paymentReference = 'QRIS-SIM-' + Date.now();

  // Progress to Sedang Diproses
  order.orderStatus = 'Sedang Diproses';
  order.processedAt = now;

  saveOrder(order);
  return {
    success: true,
    order,
    message: 'Pembayaran QRIS senilai ' + formatRupiah(order.totalAmount) + ' terverifikasi oleh gateway simulator.',
  };
};

export const getCustomerCart = (): CustomerOrderItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_CART);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load customer cart:', e);
  }
  return [];
};

export const saveCustomerCart = (cart: CustomerOrderItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.CUSTOMER_CART, JSON.stringify(cart));
};

export const clearCustomerCart = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CUSTOMER_CART);
};

export const getActiveOrderId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDER_ID);
};

export const setActiveOrderId = (orderId: string | null): void => {
  if (orderId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDER_ID, orderId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ORDER_ID);
  }
};

export const generateOrderReceiptText = (order: Order, settings: StoreSettings): string => {
  const itemsText = order.items
    .map((item) => {
      const toppings = item.selectedToppings?.length
        ? ` (+${item.selectedToppings.map((t) => t.name).join(', ')})`
        : '';
      const notes = item.notes ? ` [Catatan: ${item.notes}]` : '';
      return `• ${item.quantity}x ${item.name}${toppings} = ${formatRupiah(item.subtotal)}${notes}`;
    })
    .join('\n');

  const paymentMethodLabel = order.paymentMethod === 'cash' ? 'CASH (Bayar ke Kasir)' : 'QRIS Digital KS';
  const tableInfo = order.orderType === 'dine_in'
    ? `Makan di Tempat${order.tableNumber ? ` (Meja ${order.tableNumber})` : ''}`
    : 'Bawa Pulang (Takeaway)';

  return `*PESANAN ONLINE — ${settings.storeName.toUpperCase()}*
No. Pesanan : ${order.id}
Nama Pemesan: ${order.customerName}
Tipe        : ${tableInfo}
Waktu       : ${formatDateIndo(order.createdAt)}
----------------------------------------
*DETAIL MENU:*
${itemsText}
----------------------------------------
*TOTAL: ${formatRupiah(order.totalAmount)}*
Metode: ${paymentMethodLabel}
Status Pembayaran: ${order.paymentStatus}
Status Pesanan   : ${order.orderStatus}
----------------------------------------
${settings.address}
WA Toko: ${settings.phone}
Hatur nuhun tos pesen di Mie Baso Kartika Sari Garut! 🙏`;
};

export const getOrderReceiptWhatsAppUrl = (order: Order, settings: StoreSettings): string => {
  const text = encodeURIComponent(generateOrderReceiptText(order, settings));
  let phone = order.customerWhatsapp ? order.customerWhatsapp.replace(/[^0-9]/g, '') : '';
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  }
  return `https://wa.me/${phone}?text=${text}`;
};

// ==========================================
// 6. MENU CUSTOM PHOTOS MANAGEMENT
// ==========================================

export const getCustomMenuPhotos = (): Record<string, string> => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MENU_PHOTOS);
    if (data) {
      const parsed = JSON.parse(data);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch (e) {
    console.error('Failed to load custom menu photos:', e);
  }
  return {};
};

export const saveCustomMenuPhoto = (menuId: string, photoDataUrlOrUrl: string): void => {
  const current = getCustomMenuPhotos();
  current[menuId] = photoDataUrlOrUrl;
  localStorage.setItem(STORAGE_KEYS.MENU_PHOTOS, JSON.stringify(current));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ks_menu_photos_updated', {
        detail: { menuId, photo: photoDataUrlOrUrl },
      })
    );
  }
};

export const removeCustomMenuPhoto = (menuId: string): void => {
  const current = getCustomMenuPhotos();
  delete current[menuId];
  localStorage.setItem(STORAGE_KEYS.MENU_PHOTOS, JSON.stringify(current));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ks_menu_photos_updated', {
        detail: { menuId },
      })
    );
  }
};

export const resetAllCustomMenuPhotos = (): void => {
  localStorage.removeItem(STORAGE_KEYS.MENU_PHOTOS);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ks_menu_photos_updated'));
  }
};


