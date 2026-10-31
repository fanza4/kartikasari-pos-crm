# Automated Test Suite Ready (TEST_READY.md)
## Smart CRM & Touch POS — Mie Baso & Aneka Jus Kartika Sari (KS) Garut

The automated test suite authoring for Kartika Sari POS & CRM is **COMPLETE**. All 7 required test suites have been constructed under `tests/` following the strict 4-Tier Test Architecture (Feature Coverage, Boundary & Corner Cases, Cross-Feature Interactions, Real-World Application Scenarios).

---

## 1. Test Runner & Execution Guide

### Primary Test Command
```bash
npm test
```
*(Runs Vitest across all test suites in the `tests/` directory via `vitest run`)*

### Individual Suite Execution
```bash
# Auth & Session Security Suite
npx vitest run tests/auth.test.ts

# Master Menu & IDR Localization Suite
npx vitest run tests/menu.test.ts

# Digital Stamp Card & Loyalty Suite
npx vitest run tests/stamp.test.ts

# Touch POS, Cart, Cash & QRIS Suite
npx vitest run tests/pos.test.ts

# CRM Customer Directory & Retention Suite
npx vitest run tests/crm.test.ts

# Sales Reports, Pareto & Reconciliation Suite
npx vitest run tests/reports.test.ts

# PWA Manifest, Service Worker & Capacitor Suite
npx vitest run tests/pwa.test.ts
```

---

## 2. Test Coverage Breakdown Across Tiers 1–4

| Test Suite | File Path | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Interaction) | Tier 4 (Scenario) | Total Tests |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Admin Authentication & Session** | `tests/auth.test.ts` | 5 | 7 | 2 | 1 | **15** |
| **Menu Catalog & Pricing** | `tests/menu.test.ts` | 6 | 5 | 2 | 1 | **14** |
| **Digital Stamp Loyalty Card** | `tests/stamp.test.ts` | 6 | 6 | 1 | 1 | **14** |
| **Touch POS, Cart & Payments** | `tests/pos.test.ts` | 7 | 6 | 2 | 1 | **16** |
| **CRM Directory & Segmentation** | `tests/crm.test.ts` | 6 | 5 | 1 | 1 | **13** |
| **Reports, Analytics & Reconciliation** | `tests/reports.test.ts` | 5 | 5 | 1 | 1 | **12** |
| **PWA, Manifest & Packaging** | `tests/pwa.test.ts` | 6 | 5 | 1 | 1 | **13** |
| **Total Test Count** | *All 7 Suites* | **41** | **39** | **10** | **7** | **97 Tests** |

---

## 3. Feature Verification Checklist

### R1. Brand Identity, UI/UX & PWA Architecture
- [x] Web App Manifest validation (`short_name`, `name`, `start_url`, `display: standalone`).
- [x] Brand color palette: Forest Green (`#166534`) as primary theme color across manifest and HTML meta tags.
- [x] App icons configuration: 192x192 and 512x512 icons declared and linked.
- [x] Service Worker offline caching strategy (`sw.js`) with cache lifecycle hooks (`install`, `activate`, `fetch`).
- [x] iOS standalone web app meta tags (`apple-mobile-web-app-capable`, `apple-touch-icon`).
- [x] Capacitor configuration ready for mobile APK/IPA bundling (`capacitor.config.ts`).

### R2. Dual Dashboard Architecture & Admin Authentication
- [x] Strict admin login gatekeeper: Permits strictly `mfanza123@gmail.com` with password `yoiyoiyoi01`.
- [x] Exact Indonesian error message on any invalid credentials: `"Akses Ditolak: Khusus Pengelola Toko"`.
- [x] Email normalization: Whitespace trimming and case-insensitive comparison (`MFANZA123@GMAIL.COM`).
- [x] Session persistence in storage with 7-day expiration timestamp surviving simulated page reloads.
- [x] Instant logout capability clearing credentials and invalidating active state.
- [x] Show/hide password visibility toggle representation.

### R3. Customer Portal (Public Dashboard) & Digital Stamp Card
- [x] Customer lookup by WhatsApp phone number (supports local `08...` and international `+628...` formats).
- [x] Customer lookup by name (case-insensitive search).
- [x] 1 qualifying noodle portion = 1 digital stamp earned.
- [x] Non-noodle items (beverages, ala carte toppings) do not earn stamps.
- [x] Reaching 10 stamps activates the free noodle portion reward state.
- [x] Reward claim process resets stamps count to 0 and increments `rewardsClaimed` counter.
- [x] Stamp count capped at 10 (does not overflow before claim).

### R4. Touch POS (Cashier System) & Transactions
- [x] Category tab isolation: Semua, Mie Kuah, Yamin Manis, Yamin Asin, Topping, Minuman.
- [x] 1-Click topping add-ons (+Rp 5.000/item: Babat, Tetelan, Baso Urat, Siomay, Tahu) added to line subtotal.
- [x] Dynamic cart operations: Quantity increment (+1), decrement (-1), removal when reaching 0.
- [x] Custom cooking notes per cart item (e.g., "Kuah dipisah, ekstra sambal").
- [x] Aneka Jus manual price entry override for variable seasonal juice pricing.
- [x] Cash payment quick denomination buttons: Uang Pas, Rp 50.000, Rp 100.000.
- [x] Automatic change calculation (`cashGiven - totalAmount`) and insufficient cash validation.
- [x] QRIS payment option displaying store QRIS image and zeroing cash change.
- [x] WhatsApp E-Receipt generator: Formats Indonesian digital receipt text and generates `https://wa.me/{phone}?text=...` URL with internationalized phone prefix (`628...`).

### R5. CRM & Customer Retention
- [x] Customer Directory records name, WhatsApp, total visits, lifetime value (LTV), and last visit date.
- [x] Automatic customer segmentation:
  - `VIP / Langganan Tetap`: `totalVisits > 5`
  - `Pelanggan Baru`: 1st visit
  - `At-Risk / Perlu Disapa`: inactive > 30 days
- [x] Inactive VIP customers prioritized into At-Risk segment for immediate re-engagement.
- [x] Directory search and filter by status label and contact details.
- [x] 1-Click WhatsApp Promo Engine: Generates personalized invitation links replacing `{nama}` placeholder.

### R6. Reports & Analytics
- [x] Executive summary metrics: Today's revenue, transaction count, Average Order Value (AOV).
- [x] Cash vs QRIS daily reconciliation: Nominal values and exact percentage split (handling 0 revenue safely).
- [x] Best-selling menu Pareto ranking: Top items sorted by volume sold and total revenue contribution.
- [x] Period filters: Dynamic calculation for "Today", "7 Days", and "30 Days".

### R7. Master Data & Localization
- [x] Pre-seeded 7 noodle dishes with exact prices (Rp 20.000 – Rp 48.000).
- [x] Special price rule: Mie Baso Komplit Khusus (Yamin Asin) priced at Rp 40.000.
- [x] 5 Toppings priced at Rp 5.000 each.
- [x] Beverages: Teh Botol (Rp 6.000), Es Jeruk (Rp 10.000), Air Putih (Rp 6.000), Aneka Jus (Rp 12.000 / custom).
- [x] Indonesian Rupiah currency formatting: standard format `Rp 26.000`.

---

## 4. Test Infrastructure Deliverables
- `TEST_INFRA.md` — Complete 4-tier testing methodology, test harness configuration, and traceability matrix.
- `tests/auth.test.ts` — Authentication & session test suite.
- `tests/menu.test.ts` — Master menu & currency test suite.
- `tests/stamp.test.ts` — Digital stamp loyalty test suite.
- `tests/pos.test.ts` — Touch POS & cashier test suite.
- `tests/crm.test.ts` — CRM directory & segmentation test suite.
- `tests/reports.test.ts` — Analytics, Pareto & reconciliation test suite.
- `tests/pwa.test.ts` — PWA, Manifest & Capacitor config test suite.
- `TEST_READY.md` — Published delivery report and verification matrix.
