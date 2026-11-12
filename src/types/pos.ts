import { MenuItem, ToppingItem } from './menu';

export interface CartItem {
  id?: string; // unique cart line id
  cartItemId?: string; // synonym
  menuItemId?: string;
  name?: string;
  variant?: string; // 'Mie Kuah' | 'Yamin Manis' | 'Yamin Asin'
  unitPrice?: number;
  quantity: number;
  selectedToppings: ToppingItem[];
  notes?: string;
  isNoodlePortion?: boolean;
  itemTotal: number;
  subtotal?: number; // synonym for itemTotal
  customPrice?: number; // For Aneka Jus
  menuItem?: MenuItem; // full reference if attached
}

export type PaymentMethod = 'cash' | 'qris';

export interface Transaction {
  id: string;
  invoiceNumber?: string;
  timestamp?: string; // ISO string
  createdAt?: string; // synonym
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid?: number;
  cashGiven?: number; // synonym
  change?: number;
  changeAmount?: number; // synonym
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerWhatsapp?: string; // synonym
  stampsAwarded?: number;
  stampsEarned?: number; // synonym
  rewardClaimed?: boolean;
  orderType?: 'dine_in' | 'takeaway';
  tableNumber?: string;
  notes?: string;
  synced?: boolean;
  status?: 'completed' | 'synced';
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  operationalHours: string;
  mapsEmbedUrl: string;
  mapsDirectUrl: string;
  qrisImageUrl: string;
  qrisVersion?: string;
  stampTarget: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'transaction' | 'customer' | 'settings';
  action: 'insert' | 'update';
  payload: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  retryCount: number;
  lastError?: string;
}

export interface SyncStatus {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  deadLetterCount: number;
  syncingCount: number;
  totalQueued: number;
  lastSyncTime: string | null;
  isOnline: boolean;
  isCloudConfigured: boolean;
}

