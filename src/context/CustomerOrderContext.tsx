import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CustomerOrderItem,
  Order,
  CreateOrderPayload,
  OrderStatus,
  OrderPaymentMethod,
  PaymentStatus,
  MenuItem,
  ToppingItem,
} from '../types';
import {
  getOrders,
  saveOrder,
  getOrderById,
  updateOrderStatus,
  confirmOrderPayment,
  simulateQrisPaymentVerification,
  getCustomerCart,
  saveCustomerCart,
  clearCustomerCart,
  generateOrderId,
  getActiveOrderId,
  setActiveOrderId,
} from '../services/storage';
import {
  fetchCloudOrders,
  subscribeToCloudOrders,
  pushOrderToCloud,
} from '../services/supabaseOrders';

const mergeOrders = (local: Order[], cloud: Order[]): Order[] => {
  const map = new Map<string, Order>();
  local.forEach((o) => map.set(o.id, o));
  cloud.forEach((o) => {
    const existing = map.get(o.id);
    if (!existing) {
      map.set(o.id, o);
    } else {
      const existingTime = new Date(existing.paidAt || existing.createdAt).getTime();
      const cloudTime = new Date(o.paidAt || o.createdAt).getTime();
      if (cloudTime >= existingTime || o.paymentStatus === 'Sudah Dibayar') {
        map.set(o.id, o);
      }
    }
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

interface CustomerOrderContextType {
  cart: CustomerOrderItem[];
  cartTotal: number;
  cartItemCount: number;
  activeOrder: Order | null;
  orders: Order[];
  newOrderCount: number;
  addToCart: (menuItem: MenuItem, selectedToppings?: ToppingItem[], notes?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  createOrder: (payload: CreateOrderPayload) => Order;
  refreshOrders: () => void;
  updateStatus: (orderId: string, orderStatus: OrderStatus, paymentStatus?: PaymentStatus) => Order | undefined;
  confirmPayment: (orderId: string, method?: OrderPaymentMethod) => Order | undefined;
  simulateQrisVerification: (orderId: string) => { success: boolean; order?: Order; message: string };
  setActiveOrderById: (orderId: string | null) => void;
  playOrderNotificationSound: () => void;
}

const CustomerOrderContext = createContext<CustomerOrderContextType | undefined>(undefined);

const areOrdersEqual = (a: Order[], b: Order[]): boolean => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].id !== b[i].id ||
      a[i].orderStatus !== b[i].orderStatus ||
      a[i].paymentStatus !== b[i].paymentStatus ||
      a[i].paidAt !== b[i].paidAt
    ) {
      return false;
    }
  }
  return true;
};

// Gentle web audio chime helper (singleton to avoid leaking AudioContexts)
let sharedAudioCtx: AudioContext | null = null;
const playChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    const ctx = sharedAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Audio might be restricted until user gesture; ignore safely
  }
};

export const CustomerOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CustomerOrderItem[]>(() => getCustomerCart());
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [activeOrderIdState, setActiveOrderIdState] = useState<string | null>(() => getActiveOrderId());

  // Derive active order
  const activeOrder = activeOrderIdState ? orders.find((o) => o.id === activeOrderIdState) || null : null;

  // Derive cart totals
  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Derive count of actionable new orders for admin
  const newOrderCount = orders.filter(
    (o) => o.orderStatus === 'Pesanan Baru' || o.orderStatus === 'Menunggu Pembayaran'
  ).length;

  const syncWithCloud = useCallback(async () => {
    try {
      const cloudOrders = await fetchCloudOrders();
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders((prev) => {
          const merged = mergeOrders(prev, cloudOrders);
          if (areOrdersEqual(prev, merged)) {
            return prev;
          }
          try {
            localStorage.setItem('ks_orders_v1', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch {
      // Ignore background sync errors
    }
  }, []);

  const refreshOrders = useCallback(() => {
    const loaded = getOrders();
    setOrders((prev) => (areOrdersEqual(prev, loaded) ? prev : loaded));
    syncWithCloud();
  }, [syncWithCloud]);

  // Synchronize cart changes to local storage
  useEffect(() => {
    saveCustomerCart(cart);
  }, [cart]);

  // Synchronize active order id
  useEffect(() => {
    setActiveOrderId(activeOrderIdState);
  }, [activeOrderIdState]);

  // Supabase Realtime Subscription & Polling across ALL devices
  useEffect(() => {
    // 1. Initial Cloud Sync
    syncWithCloud();

    // 2. Realtime WebSocket listener across all devices
    const unsubscribe = subscribeToCloudOrders((updatedOrder) => {
      setOrders((prev) => {
        const existing = prev.find((o) => o.id === updatedOrder.id);
        const isNew = !existing;
        const justPaid = updatedOrder.paymentStatus === 'Sudah Dibayar' && existing?.paymentStatus !== 'Sudah Dibayar';

        const merged = mergeOrders(prev, [updatedOrder]);
        try {
          localStorage.setItem('ks_orders_v1', JSON.stringify(merged));
        } catch {}

        // Ensure customer record and stamps are in sync if order was paid or completed
        if (updatedOrder.paymentStatus === 'Sudah Dibayar') {
          saveOrder(updatedOrder);
        }

        if (isNew || justPaid) {
          playChime();
        }

        return merged;
      });
    });

    // 3. Fallback polling only when tab is active (every 8 seconds)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncWithCloud();
      }
    }, 8000);

    const handleOrderEvent = () => {
      refreshOrders();
    };

    window.addEventListener('ks_order_event', handleOrderEvent);
    window.addEventListener('storage', handleOrderEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('ks_order_event', handleOrderEvent);
      window.removeEventListener('storage', handleOrderEvent);
      clearInterval(interval);
    };
  }, [syncWithCloud, refreshOrders]);

  const addToCart = (
    menuItem: MenuItem,
    selectedToppings: ToppingItem[] = [],
    notes: string = ''
  ) => {
    const toppingsKey = selectedToppings.map((t) => t.id).sort().join('-');
    const cartItemId = `${menuItem.id}-${toppingsKey}-${notes.trim() || 'std'}`;

    const toppingPrice = selectedToppings.reduce((s, t) => s + t.price, 0);
    const unitPrice = menuItem.price + toppingPrice;

    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newQty = existing.quantity + 1;
        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          subtotal: unitPrice * newQty,
        };
        return updated;
      }

      const newItem: CustomerOrderItem = {
        cartItemId,
        menuItemId: menuItem.id,
        name: menuItem.name,
        category: menuItem.category,
        unitPrice,
        quantity: 1,
        selectedToppings: [...selectedToppings],
        notes: notes.trim(),
        subtotal: unitPrice,
        givesStamp: !!menuItem.givesStamp,
      };
      return [...prev, newItem];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter((i): i is CustomerOrderItem => i !== null)
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    clearCustomerCart();
  };

  const createOrder = (payload: CreateOrderPayload): Order => {
    const orderId = generateOrderId();
    const now = new Date().toISOString();
    const totalAmount = payload.items.reduce((s, i) => s + i.subtotal, 0);

    const initialPaymentStatus: PaymentStatus = 'Menunggu Pembayaran';
    const initialOrderStatus: OrderStatus = 'Menunggu Pembayaran';

    const newOrder: Order = {
      id: orderId,
      customerName: payload.customerName.trim(),
      customerWhatsapp: payload.customerWhatsapp?.trim() || undefined,
      orderType: payload.orderType,
      tableNumber: payload.tableNumber?.trim() || undefined,
      items: [...payload.items],
      totalAmount,
      paymentMethod: payload.paymentMethod,
      paymentStatus: initialPaymentStatus,
      orderStatus: initialOrderStatus,
      createdAt: now,
      notes: payload.notes?.trim() || undefined,
    };

    saveOrder(newOrder);
    pushOrderToCloud(newOrder).catch(() => {});
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== orderId)]);
    setActiveOrderIdState(orderId);
    clearCart();

    // Trigger audible notification
    playChime();

    return newOrder;
  };

  const updateStatus = (
    orderId: string,
    orderStatus: OrderStatus,
    paymentStatus?: PaymentStatus
  ): Order | undefined => {
    const updated = updateOrderStatus(orderId, orderStatus, paymentStatus);
    if (updated) {
      pushOrderToCloud(updated).catch(() => {});
    }
    refreshOrders();
    return updated;
  };

  const confirmPayment = (orderId: string, method?: OrderPaymentMethod): Order | undefined => {
    const updated = confirmOrderPayment(orderId, method);
    if (updated) {
      pushOrderToCloud(updated).catch(() => {});
    }
    refreshOrders();
    return updated;
  };

  const simulateQrisVerification = (orderId: string) => {
    const res = simulateQrisPaymentVerification(orderId);
    if (res.order) {
      pushOrderToCloud(res.order).catch(() => {});
    }
    refreshOrders();
    return res;
  };

  const setActiveOrderById = (orderId: string | null) => {
    setActiveOrderIdState(orderId);
  };

  return (
    <CustomerOrderContext.Provider
      value={{
        cart,
        cartTotal,
        cartItemCount,
        activeOrder,
        orders,
        newOrderCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        createOrder,
        refreshOrders,
        updateStatus,
        confirmPayment,
        simulateQrisVerification,
        setActiveOrderById,
        playOrderNotificationSound: playChime,
      }}
    >
      {children}
    </CustomerOrderContext.Provider>
  );
};

const defaultContextValue: CustomerOrderContextType = {
  cart: [],
  cartTotal: 0,
  cartItemCount: 0,
  activeOrder: null,
  orders: [],
  newOrderCount: 0,
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  createOrder: () => ({} as any),
  refreshOrders: () => {},
  updateStatus: () => undefined,
  confirmPayment: () => undefined,
  simulateQrisVerification: () => ({ success: false, message: '' }),
  setActiveOrderById: () => {},
  playOrderNotificationSound: () => {},
};

export const useCustomerOrder = () => {
  const context = useContext(CustomerOrderContext);
  if (!context) {
    return defaultContextValue;
  }
  return context;
};
