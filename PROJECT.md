# Project: Smart CRM & Touch POS — Mie Baso & Aneka Jus Kartika Sari (KS) Garut

## Architecture
- **Client App**: React 18 + Vite + TypeScript Single Page Application (PWA)
- **Styling & Design System**: Tailwind CSS with Forest Green (`#166534`) primary, Gold Yellow (`#EAB308` / `#F59E0B`) accent, Lucide React icons
- **Platform Architecture**:
  - Web App Manifest (`manifest.json`) & Service Worker (`sw.js`) for offline caching and PWA installation
  - Responsive layouts: Mobile (<640px), Dual-Pane Tablet POS (768-1024px), Desktop Cashier (>1024px)
  - Capacitor 5+ ready (`capacitor.config.ts`, Android/iOS bundling compatibility)
- **Routing & Separation of Concerns**:
  - Public Customer Portal (`/`): Menu Catalog, Digital Stamp Card lookup, Store Info & Location
  - Admin Login (`/login`): Strict authentication gate
  - Protected Admin Back-Office (`/admin/*`): Touch POS (`/admin/pos`), CRM (`/admin/crm`), Reports & Analytics (`/admin/reports`), Settings (`/admin/settings`)
- **Persistence & Offline Sync**:
  - Local-first architecture: IndexedDB / LocalStorage for zero-downtime offline transactions
  - Supabase client integration for cloud sync and persistence when connected
  - Auto-sync queue on reconnect (`window.addEventListener('online')`)

---

## Feature Inventory
Every requirement and feature discovered during Survey mapped to a specific milestone.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Brand Identity & Palette | Forest Green (#166534), Gold Yellow accent, Tailwind theme, Lucide icons | M1 | R1, Survey 1 |
| 2 | Brand Logo Assets Pipeline | Circular KS emblem (`media_1793333629773_af4b52b8.jpg`) copied & generated into favicon, 192px/512px PWA icons, apple touch icon | M1 | R1, Survey 1 |
| 3 | PWA & Offline Support | Web App Manifest, Service Worker with offline caching, iOS standalone meta tags | M1 | R1, Survey 1 |
| 4 | Capacitor Bundling Config | `capacitor.config.ts`, mobile-first responsive layout, ready for APK/IPA packaging | M1 | R1, Survey 1 |
| 5 | Master Data Schema & Seeding | Exact 7 noodle dishes, 5 toppings (@ Rp 5.000), 4 beverages with IDR formatting | M1 | R7, Survey 2 |
| 6 | Persistence & Offline Sync Engine | Local-first IndexedDB buffer, Supabase client schema, sync queue | M1 | R1, R4, Survey 3 |
| 7 | Dual Dashboard Route Guard | Decoupled Public (`/`) vs Protected Admin (`/admin/*`) with redirect | M2 | R2, Survey 2 |
| 8 | Strict Admin Authentication | Permits strictly `mfanza123@gmail.com` / `yoiyoiyoi01`; exact error `"Akses Ditolak: Khusus Pengelola Toko"` | M2 | R2, Survey 2 |
| 9 | Auth Session & Password Toggle | Session persistence across reload (`ks_admin_session`), instant logout, show/hide password toggle | M2 | R2, Survey 2 |
| 10 | Customer Portal Catalog | Interactive menu catalog with category filter tabs, ingredient pills, and IDR prices | M2 | R3, Survey 2 |
| 11 | Digital Stamp Card System | Name & WhatsApp lookup, 1 noodle portion = 1 stamp, 10 stamps = 1 free portion reward state | M2 | R3, Survey 2 |
| 12 | Store Information & Location | Store address in Garut, operational hours, embedded Google Maps, direct WhatsApp link | M2 | R3, Survey 2 |
| 13 | Touch POS Layout & Categories | Fast cashier interface: Semua, Mie Kuah, Yamin Manis, Yamin Asin, Topping, Minuman | M3 | R4, Survey 3 |
| 14 | 1-Click Topping Add-ons | Babat, Tetelan, Baso Urat, Siomay, Tahu (@ Rp 5.000) attached to dish or standalone | M3 | R4, Survey 3 |
| 15 | Dynamic Cart & Customization | Quantity inc/dec, item removal, custom notes, Aneka Jus manual price entry | M3 | R4, Survey 3 |
| 16 | Cash Payment & Change Calc | Quick denomination buttons (uang pas, 50k, 100k), automatic change calculator | M3 | R4, Survey 3 |
| 17 | QRIS Payment Option | Displays store QRIS code with verification toggle | M3 | R4, Survey 3 |
| 18 | WhatsApp E-Receipt Generator | Creates and dispatches formatted Indonesian receipt text via `wa.me` URL | M3 | R4, Survey 3 |
| 19 | Transaction Persistence & CRM Sync | Persists orders, increments customer visits and stamps, queues offline transactions | M3 | R4, Survey 3 |
| 20 | CRM Customer Directory | Directory recording Name, WhatsApp, visit count, Lifetime Value (LTV), last visit date | M4 | R5, Survey 3 |
| 21 | Customer Segmentation Labels | VIP / Langganan Tetap (>5 visits), Pelanggan Baru (1st visit), At-Risk (>30 days inactive) | M4 | R5, Survey 3 |
| 22 | CRM Search & Filter | Filter customers by segmentation status and search by name/phone | M4 | R5, Survey 3 |
| 23 | 1-Click WhatsApp Promo Engine | Generates personalized promo messages via `wa.me` links with customizable templates | M4 | R5, Survey 3 |
| 24 | Executive Summary Metrics | Today's revenue, transaction count, Average Order Value (AOV) cards | M4 | R6, Survey 3 |
| 25 | Cash vs QRIS Daily Reconciliation | Reconciliation chart with percentage breakdown and nominal values | M4 | R6, Survey 3 |
| 26 | Menu Pareto Chart & Ingredient Planning | 80/20 best-sellers chart and raw ingredient requirement projection | M4 | R6, Survey 3 |
| 27 | Period Filtering (Today / 7d / 30d) | Dynamic time-range selector updating all metrics and charts | M4 | R6, Survey 3 |
| 28 | E2E Test Suite Pass (Tiers 1-4) | 100% pass rate on opaque-box test cases created by E2E Testing Track | M5 | Testing Track |
| 29 | Tier 5 Adversarial Coverage Hardening | White-box stress testing, gap analysis, and bug remediation | M5 | Testing Track |
| 30 | Production Build & Documentation | Clean `npm run build`, zero TS errors, README with deployment & password change instructions | M5 | All |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Design test runner, test harness, and Tiers 1-4 test cases; publish TEST_READY.md | none | DONE |
| M1 | Core Foundation & Master Data | Vite+React+TS, Tailwind, Brand Logo & Icons, PWA Manifest & SW, Capacitor, Master Data, Local/Sync persistence | none | DONE |
| M2 | Auth & Customer Portal | Dual Dashboard routing, Strict Admin Auth, Session/Logout, Customer Catalog, Digital Stamp Card, Store Info | M1 | DONE |
| M3 | Touch POS & Payments | POS layout, tabs, 1-click toppings, cart, Cash (change calc), QRIS, wa.me E-Receipt, transaction sync | M1, M2 | IN_PROGRESS |
| M4 | CRM & Analytics | Customer Directory, Segmentation (VIP, Pelanggan Baru, At-Risk), 1-click WA Promo, Metrics, Charts (Cash vs QRIS, Pareto) | M1, M3 | PLANNED |
| M5 | E2E Pass & Hardening | Pass 100% of E2E tests (Tiers 1-4), Tier 5 Adversarial Coverage Hardening, Build & Docs | E2E, M1-M4 | PLANNED |

---

## Interface Contracts

### 1. Master Menu Item Contract (`src/types/menu.ts`)
```typescript
export type MenuCategory = 'mie_kuah' | 'yamin_manis' | 'yamin_asin' | 'topping' | 'minuman';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  composition: string[];
  defaultVariants?: ('Mie Kuah' | 'Yamin Manis' | 'Yamin Asin')[];
  isNoodlePortion: boolean; // qualifying item for Digital Stamp
  isAvailable: boolean;
  image: string;
  description: string;
  allowPriceOverride?: boolean; // For Aneka Jus
}
```

### 2. Authentication Contract (`src/types/auth.ts`)
```typescript
export interface AuthUser {
  email: string;
  role: 'store_manager';
  name: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
  token?: string;
}
```

### 3. Cart & Transaction Contract (`src/types/pos.ts`)
```typescript
export interface CartItem {
  id: string; // unique cart line id
  menuItemId: string;
  name: string;
  variant?: string; // 'Mie Kuah' | 'Yamin Manis' | 'Yamin Asin'
  unitPrice: number;
  quantity: number;
  selectedToppings: { name: string; price: number }[];
  notes?: string;
  isNoodlePortion: boolean;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'qris';

export interface Transaction {
  id: string;
  timestamp: string; // ISO string
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  customerName?: string;
  customerPhone?: string;
  stampsAwarded: number;
  synced: boolean;
}
```

### 4. CRM & Customer Contract (`src/types/crm.ts`)
```typescript
export type CustomerSegment = 'VIP' | 'Pelanggan Baru' | 'At-Risk' | 'Reguler';

export interface Customer {
  id: string;
  name: string;
  phone: string; // E.g. '081234567890' or '6281234567890'
  totalVisits: number;
  lifetimeValue: number;
  stampsCount: number; // 0 to 10
  lastVisitDate: string; // ISO date
  segment: CustomerSegment;
}
```

---

## Code Layout
```
kartikasari-pos-crm/
├── public/
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── logo.jpg
│   ├── manifest.json
│   ├── qris-dummy.png
│   ├── sw.js
│   └── menu/                # item photo placeholders
├── src/
│   ├── assets/              # Store branding assets
│   ├── components/
│   │   ├── common/          # Button, Input, Modal, Badge
│   │   ├── layout/          # PublicHeader, AdminHeader, AdminSidebar
│   │   ├── portal/          # MenuCatalog, StampCard, StoreInfo
│   │   ├── pos/             # PosCatalog, CartDrawer, PaymentModal, EReceiptModal
│   │   ├── crm/             # CustomerTable, PromoModal, SegmentationBadge
│   │   └── reports/         # MetricCards, RevenueChart, ParetoChart, Reconciliation
│   ├── contexts/            # AuthContext, CartContext, StoreContext
│   ├── data/                # pre-seeded master menu, dummy CRM data
│   ├── lib/                 # supabase.ts, indexedDb.ts, syncQueue.ts
│   ├── types/               # menu.ts, auth.ts, pos.ts, crm.ts, reports.ts
│   ├── utils/               # formatters.ts, whatsapp.ts, segmentation.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── auth.test.ts
│   ├── menu.test.ts
│   ├── stamp.test.ts
│   ├── pos.test.ts
│   ├── crm.test.ts
│   └── reports.test.ts
├── capacitor.config.ts
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```
