import { ToppingItem } from './menu';

export type OrderPaymentMethod = 'cash' | 'qris';

export type PaymentStatus = 'Menunggu Pembayaran' | 'Sudah Dibayar';

export type OrderStatus =
  | 'Menunggu Pembayaran'
  | 'Pesanan Baru'
  | 'Sedang Diproses'
  | 'Siap Diambil'
  | 'Selesai'
  | 'Dibatalkan';

export type OrderType = 'dine_in' | 'takeaway';

export interface CustomerOrderItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  selectedToppings: ToppingItem[];
  notes?: string;
  subtotal: number;
  givesStamp?: boolean;
}

export interface Order {
  id: string; // e.g., "KS-ORD-20261030-4821"
  customerName: string;
  customerWhatsapp?: string;
  orderType: OrderType;
  tableNumber?: string;
  items: CustomerOrderItem[];
  totalAmount: number;
  paymentMethod: OrderPaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  paidAt?: string;
  processedAt?: string;
  readyAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  paymentReference?: string;
  notes?: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerWhatsapp?: string;
  orderType: OrderType;
  tableNumber?: string;
  items: CustomerOrderItem[];
  paymentMethod: OrderPaymentMethod;
  notes?: string;
}
