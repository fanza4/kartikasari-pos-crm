# Test Infrastructure & Testing Architecture
## Smart CRM & Touch POS — Mie Baso & Aneka Jus Kartika Sari (KS) Garut

This document formalizes the complete 4-tier test architecture for Kartika Sari POS & CRM, outlining the test suites, execution environment, authoritative test oracles, and coverage mapping across all system features.

---

## 1. Test Harness & Execution Setup

- **Test Runner**: Vitest 2.x
- **Environment**: Node.js / jsdom simulated DOM environment
- **Command**: `npm test` (`vitest run`)
- **Directory Layout**:
  - `tests/auth.test.ts` — Authentication, session lifecycle, password masking
  - `tests/menu.test.ts` — Master menu catalog, composition, pricing, currency formatting
  - `tests/stamp.test.ts` — Customer stamp card, 1 portion = 1 stamp, 10-stamp free reward
  - `tests/pos.test.ts` — Touch POS categories, 1-click toppings, cart operations, cash quick buttons, change calculation, QRIS, WA e-receipt
  - `tests/crm.test.ts` — Customer directory, VIP/New/At-Risk segmentation, search/filter, 1-click WA promo generator
  - `tests/reports.test.ts` — Executive metrics (Revenue, Count, AOV), Cash vs QRIS reconciliation, Pareto top sellers, period filters
  - `tests/pwa.test.ts` — Web App Manifest, Service Worker caching, iOS standalone meta tags, Capacitor configuration

---

## 2. 4-Tier Test Suite Architecture

### Tier 1: Feature Coverage (>=5 tests per core feature)
Verifies nominal, happy-path functionality according to verbatim requirements in `ORIGINAL_REQUEST.md` and `PROJECT.md`:
- **Auth (R2)**:
  - Admin login with `mfanza123@gmail.com` and `yoiyoiyoi01` succeeds.
  - Active session persists in storage across page reload.
  - Immediate logout clears session data and state.
  - Show/hide password toggle flips between masked and plaintext.
  - Admin email normalization (case insensitivity / whitespace trimming).
- **Menu & Master Data (R7)**:
  - Exact 7 noodle items seeded with correct base prices (Rp 20.000 to Rp 48.000).
  - Special Yamin Asin Komplit price seeded at Rp 40.000.
  - Exact 5 toppings seeded at Rp 5.000/item.
  - Exact 4 beverages seeded (Teh Botol 6k, Es Jeruk 10k, Air Putih 6k, Aneka Jus 12k with price override).
  - Indonesian Rupiah currency formatting (`formatRupiah`) produces standard `Rp 26.000`.
- **Digital Stamp Card (R3)**:
  - Customer search by name retrieves accurate member profile.
  - Customer search by WhatsApp phone retrieves accurate member profile.
  - Purchasing qualifying noodle portion adds 1 stamp per portion.
  - Non-noodle items (beverages, standalone toppings) do not earn stamps.
  - Reaching 10 stamps activates the free portion reward claim state.
- **Touch POS System (R4)**:
  - Category tabs filter items correctly (Semua, Mie Kuah, Yamin Manis, Yamin Asin, Topping, Minuman).
  - 1-click topping adds Rp 5.000 to the dish subtotal.
  - Dynamic cart supports increment (+1) and decrement (-1, removal at 0).
  - Cart item custom cooking notes persistence (e.g. "kuah dipisah").
  - Aneka Jus manual price entry updates item line total.
  - Cash quick denomination buttons (Uang Pas, 50k, 100k) populate received cash.
  - Automatic change calculation (`cashGiven - totalAmount`).
  - QRIS payment displays store QRIS and sets change to Rp 0.
  - WA e-receipt generator creates formatted `wa.me` URL with invoice details.
- **CRM & Customer Retention (R5)**:
  - Customer directory records name, phone, visits, LTV, and last visit date.
  - VIP / Langganan Tetap segmentation assigned for visits > 5.
  - Pelanggan Baru segmentation assigned for 1st visit.
  - At-Risk / Perlu Disapa segmentation assigned for inactivity > 30 days.
  - Search customer by name and phone query.
  - 1-Click WhatsApp promo message generator with `{nama}` placeholder replacement.
- **Reports & Analytics (R6)**:
  - Summary cards compute Today's revenue, transaction count, and AOV accurately.
  - Cash vs QRIS comparison calculates nominal totals and exact percentages.
  - Best-selling menu Pareto sorts items by quantity sold.
  - Period filter switches correctly between Today, 7 Days, and 30 Days.
- **PWA & Packaging (R1)**:
  - `manifest.json` contains valid name, theme color `#166534`, and icons (192px, 512px).
  - `sw.js` caches critical shell assets and implements offline fallback.
  - `index.html` includes required iOS standalone meta tags.
  - `capacitor.config.ts` configured for Android/iOS app packaging.

---

### Tier 2: Boundary & Corner Cases (>=5 tests per boundary domain)
Tests extreme values, empty inputs, edge conditions, and error recovery:
- **Auth Boundaries**:
  - Empty email rejects with exact error `"Akses Ditolak: Khusus Pengelola Toko"`.
  - Empty password rejects with exact error `"Akses Ditolak: Khusus Pengelola Toko"`.
  - Valid email with wrong password rejects with exact error `"Akses Ditolak: Khusus Pengelola Toko"`.
  - Unauthorized email with valid password rejects with exact error `"Akses Ditolak: Khusus Pengelola Toko"`.
  - Malicious inputs (SQL injection, script injection, control characters) fail gracefully with exact error.
  - Corrupted or expired session storage automatically invalidates on boot.
- **Financial & Monetary Boundaries**:
  - Rp 0 transaction (all-reward order).
  - Exact cash payment (`cashGiven == totalAmount`) produces change `Rp 0`.
  - Partial / insufficient cash payment flags validation error (`isCashSufficient = false`).
  - Large cash payment (e.g. Rp 1.000.000 on a Rp 26.000 order) correctly yields `Rp 974.000` change.
  - Custom beverage price set to Rp 0 or high premium (e.g. Rp 50.000) calculates cart correctly.
- **Stamp Counter Boundaries**:
  - Initial customer starts at 0 stamps.
  - Exactly 9 stamps does NOT trigger reward state.
  - Exactly 10 stamps triggers reward state.
  - Stamp count is capped at 10 (does not overflow to 11+ before claim).
  - Claiming reward resets stamps back to 0 and increments claimed reward count.
- **CRM Date Boundaries**:
  - Inactive exactly 30 days is NOT At-Risk; inactive 31+ days triggers At-Risk label.
  - Customer with 5 visits is Regular; customer with 6 visits is VIP.
  - Customer with 1 visit is Pelanggan Baru; customer with 2 visits is Regular.
  - Inactive customer with >5 visits (VIP) who is inactive >30 days receives At-Risk urgency.
- **POS Cart & String Boundaries**:
  - Empty cart checkout is prevented.
  - Custom note with special characters (emojis, quotes, newlines) correctly escapes in WA URL.
  - Extremely long notes do not break receipt layout.
  - Phone number with various formats (`08...`, `+628...`, `628...`, dashes, spaces) normalizes correctly to `628...` for `wa.me`.

---

### Tier 3: Cross-Feature Interactions
Validates interconnected module behaviors and data pipelines:
- **Interaction 1: Order -> Stamp -> Reward State -> Claim -> Reset**:
  Customer with 8 stamps orders 2 noodle portions -> total reaches 10 stamps -> UI offers reward claim -> customer claims free portion on next order -> total is discounted by Rp 26.000 -> stamps reset to 0.
- **Interaction 2: Cash POS Payment -> Change -> Stored Transaction -> Daily Revenue Report**:
  Cashier inputs order (Rp 52.000), pays with Rp 100.000 -> change Rp 48.000 recorded -> transaction committed to database -> Today's Revenue and Cash Reconciliation cards instantly update by Rp 52.000.
- **Interaction 3: QRIS Payment -> Transaction Sync -> QRIS Reconciliation**:
  Order processed via QRIS -> payment method 'qris' stored with 0 change -> Reports reconciliation reflects increased QRIS nominal and adjusts percentage split.
- **Interaction 4: New Customer Order -> Automatic CRM Directory Insertion -> Welcome Segment**:
  Cashier checks out order with new customer phone -> CRM directory automatically creates new customer record with 1 visit and "Pelanggan Baru" badge.
- **Interaction 5: Frequent Customer -> VIP Transition -> Personalized WA Promo**:
  Customer reaches 6th transaction -> segmentation flips from Regular to VIP -> CRM 1-Click promo generates personalized VIP loyalty message with recipient name.
- **Interaction 6: Transaction Completion -> E-Receipt WA Generation**:
  Order with multiple customized dishes (toppings, notes) formats multi-line WhatsApp receipt text with proper currency symbols and direct link to customer's WhatsApp.

---

### Tier 4: Real-World Cashier & Management Scenarios
Simulates realistic, multi-step end-to-end workflows:
- **Scenario A: Full Lunch Rush Cashier Shift**:
  Cashier logs in as store manager -> processes 5 consecutive orders (Mix of Mie Kuah Seporsi with Babat, Yamin Manis Komplit, Es Jeruk, Aneka Jus custom price) -> handles cash with quick buttons and QRIS -> prints digital receipts -> reviews shift summary in Reports.
- **Scenario B: Digital Stamp Card Journey**:
  Walk-in customer opens public portal on phone -> searches stamp card by phone -> sees 9 stamps -> orders 1 Mie Kuah at cashier -> cashier enters phone -> order completes -> customer re-checks phone portal and sees "10 dari 10" with celebratory reward state.
- **Scenario C: Inactive Customer Re-Engagement Campaign**:
  Store manager opens Admin CRM -> filters by "At-Risk / Perlu Disapa" -> identifies customers inactive for >30 days -> clicks 1-Click WhatsApp Promo -> generates tailored invitation message with free beverage voucher.
- **Scenario D: End-of-Day Financial Reconciliation**:
  Manager opens Reports & Analytics -> selects "Hari Ini" -> verifies total transactions, revenue, and average order value -> reconciles physical cash drawer against Cash nominal report -> validates QRIS settlement against QRIS nominal report.

---

## 3. Test Traceability Matrix

| Requirement | Description | Test Suite File | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|-------------|-------------|-----------------|:------:|:------:|:------:|:------:|
| **R1** | Brand, UI/UX & PWA | `tests/pwa.test.ts` | Yes | Yes | Yes | Yes |
| **R2** | Dual Dashboard & Strict Auth | `tests/auth.test.ts` | Yes | Yes | Yes | Yes |
| **R3** | Customer Portal & Stamp Card | `tests/stamp.test.ts`, `tests/menu.test.ts` | Yes | Yes | Yes | Yes |
| **R4** | Touch POS, Cart, Cash & QRIS | `tests/pos.test.ts` | Yes | Yes | Yes | Yes |
| **R5** | CRM & Retention Segments | `tests/crm.test.ts` | Yes | Yes | Yes | Yes |
| **R6** | Reports, Analytics & Pareto | `tests/reports.test.ts` | Yes | Yes | Yes | Yes |
| **R7** | Master Data & Localization | `tests/menu.test.ts` | Yes | Yes | Yes | Yes |
