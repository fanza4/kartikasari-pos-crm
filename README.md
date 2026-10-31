# 🍜 Mie Baso & Aneka Jus Kartika Sari (KS) — Smart CRM & Touch POS

Aplikasi **Smart Customer Relationship Management (CRM) & Touch POS Kasir** multi-platform yang dibangun khusus untuk usaha kuliner **Mie Baso & Aneka Jus Kartika Sari (KS)** di Garut:
📍 **Alamat**: *Jln. Otista No 127 Paseban (Depan Rumah Beku), Garut Satu, Jawa Barat, Indonesia.*

Aplikasi ini berbasis web responsif modern dengan kapabilitas **Progressive Web App (PWA)** sehingga dapat langsung di-install di smartphone **Android** maupun **iPhone (iOS)**, serta siap di-bundle menjadi file native Android APK / iOS IPA via **Capacitor**.

---

## 🌟 Fitur Utama & Arsitektur Dual-Dashboard

### 1. Dashboard Publik (Portal Pelanggan)
* **Sistem Pemesanan Mandiri (Ala Mie Gacoan)**:
  * Pelanggan dapat memilih makanan & minuman langsung dengan tombol `[+]` dan `[-]` pada katalog menu.
  * **Keranjang Belanja (Shopping Cart)**: Menampilkan rincian menu, subtotal, catatan selera pelanggan, dan tombol checkout. Keranjang tersimpan di penyimpanan lokal (*persistent cart*) sehingga tidak hilang saat halaman di-refresh.
  * **Identitas Pemesan**: Input nama pelanggan wajib, pilihan Dine In (Makan di Tempat + Nomor Meja) atau Takeaway (Bawa Pulang), serta nomor WhatsApp.
  * **Metode Pembayaran**:
    * **CASH**: Instruksi bayar tunai ke kasir. Status awal *"Menunggu Pembayaran"*, dapur baru memproses setelah kasir mengonfirmasi penerimaan uang.
    * **QRIS**: Tampilan QR Code resmi dan nominal pembayaran tepat. Dilengkapi mekanisme verifikasi simulasi gateway resmi serta siap integrasi payment gateway.
  * **Lacak Pesanan Real-Time (Live Order Tracking)**: Stepper alur pengerjaan (*Menunggu Pembayaran -> Sedang Diproses Dapur -> Siap Diambil di Counter -> Selesai*) dengan peringatan visual berkedip saat pesanan siap diambil.
* **Katalog Menu Interaktif**: Menampilkan seluruh varian menu Mie Baso (Mie Kuah, Yamin Manis, Yamin Asin), paket porsi (Seporsi, Setengah, Komplit, Topping Ekstra, dan Minuman) lengkap dengan komposisi bahan dan harga Rupiah.
* **Kartu Stempel Loyalitas Digital (CRM)**:
  * Pelanggan cukup memasukkan Nama & No. WhatsApp untuk melihat kartu stempel.
  * Setiap pembelian 1 porsi mie mendapatkan **1 stempel 🍜**.
  * Stempel ke-10 memberikan reward **1 Porsi Mie GRATIS** lengkap dengan efek animasi konfeti.
* **Informasi & Lokasi Toko**: Peta interaktif Google Maps ke Jl. Otista No 127 Paseban Garut, jam operasional (09:30 - 21:00 WIB), dan tombol direct chat WhatsApp ke kedai.

### 2. Dashboard Terproteksi (Back-Office Kasir POS & CRM)
* **Antrean Pesanan Masuk (Live Order Queue)**:
  * Tab filter status: *Semua Pesanan, Menunggu Pembayaran, Sudah Dibayar, Sedang Diproses, Siap Diambil, Selesai, Dibatalkan*.
  * Notifikasi visual & counter badge real-time ketika ada pesanan baru masuk dari pelanggan.
  * **Konfirmasi Pembayaran Cash**: Kasir mengonfirmasi penerimaan uang tunai dengan 1-klik, pesanan langsung beralih ke status *"Sudah Dibayar"* dan diteruskan ke dapur (*"Sedang Diproses"*).
  * **Verifikasi QRIS**: Memantau status pembayaran digital QRIS.
  * **Kendali Alur Pengerjaan**: Mengubah status ke *"Sedang Diproses"*, *"Siap Diambil"*, hingga *"Selesai"*. Pesanan yang belum lunas tidak dapat dimajukan ke proses pengerjaan.
  * Otomatis terintegrasi dengan basis data pelanggan CRM dan perolehan stempel kupon saat pesanan selesai.
* **Pintu Masuk Terproteksi (Gatekeeper)**:
  * Tombol **"Akses Kasir / Admin"** dengan autentikasi email & kata sandi.
  * Hanya mengizinkan akun resmi:
    * **Email**: `mfanza123@gmail.com`
    * **Password**: `yoiyoiyoi01`
  * Semua kredensial lain ditolak dengan pesan: `"Akses Ditolak: Khusus Pengelola Toko"`.
  * Sesi login otomatis tersimpan di peramban (tidak perlu login ulang saat reload) dan tombol Logout instan.
* **Touch POS Cepat (Kasir Jam Sibuk)**:
  * Filter kategori menu cepat: *Semua, Mie Kuah, Yamin Manis, Yamin Asin, Topping, Minuman*.
  * Penambahan topping 1-klik (*Babat, Tetelan, Baso Urat, Siomay, Tahu*) seharga Rp 5.000 / item.
  * Keranjang belanja dinamis (tambah, kurang, hapus, catatan selera pelanggan, harga fleksibel aneka jus).
  * Pembayaran Tunai (Cash) dengan tombol nominal cepat (Uang Pas, 50k, 100k) dan kalkulator kembalian otomatis.
  * Pembayaran Non-Tunai QRIS dengan tampilan gambar QRIS toko.
  * **E-Receipt WhatsApp**: Struk digital langsung terkirim ke WhatsApp pelanggan via tautan resmi `wa.me`.
  * **Dukungan Offline**: Transaksi kasir tetap lancar meski koneksi internet terputus; data tersimpan di cache lokal dan tersinkronisasi otomatis saat online.
* **Customer Directory & Segmentasi CRM**:
  * Basis data pelanggan: Nama, WhatsApp, Total Kunjungan, Total Belanja (*Lifetime Value*), dan Tanggal Kunjungan Terakhir.
  * Label otomatis:
    * 👑 **VIP / Langganan Tetap** (> 5 kunjungan)
    * 🌱 **Pelanggan Baru** (kunjungan pertama)
    * ⚠️ **At-Risk / Perlu Disapa** (tidak berkunjung > 30 hari)
  * **Promo WhatsApp 1-Klik**: Generator pesan penawaran promo personal langsung ke nomor WhatsApp pelanggan berdasarkan template pesan yang dapat diedit.
* **Laporan Finansial & Analitik**:
  * Ringkasan eksekutif: Omset penjualan, jumlah nota, dan rata-rata belanja per nota (AOV).
  * Rekonsiliasi Cash vs QRIS (nominal & persentase) untuk mempermudah pengecekan uang fisik di laci kasir vs rekening QRIS.
  * Diagram Pareto Menu Terlaris (Top 5 menu favorit) untuk perencanaan bahan baku mie dan baso.
  * Filter rentang waktu: Hari Ini, 7 Hari Terakhir, 30 Hari Terakhir.

---

## 📋 Master Data Menu & Skema Harga

| Kategori | Varian Menu | Porsi / Paket | Harga (Rp) | Komposisi Isi |
| :--- | :--- | :--- | :--- | :--- |
| **Mie Baso** | Mie Kuah / Yamin Manis / Yamin Asin | **Seporsi** | Rp 26.000 | Mie, 1 Baso Urat, 3 Baso Kecil |
| | Mie Kuah / Yamin Manis / Yamin Asin | **Setengah Porsi** | Rp 20.000 | Mie, 3 Baso Kecil |
| | Mie Kuah / Yamin Manis | **Komplit** | Rp 48.000 | Mie, 1 Baso Urat, 3 Baso Kecil, Tahu, Siomay |
| | Yamin Asin | **Komplit Khusus** | Rp 40.000 | Mie, 1 Baso Urat, 3 Baso Kecil, Tahu, Siomay |
| | Mie Kuah / Yamin Manis / Yamin Asin | **1/2 + Tambah Baso** | Rp 35.000 | Mie, 1 Baso Urat, 5 Baso Kecil |
| | Mie Kuah / Yamin Manis / Yamin Asin | **1/2 + Tambah Siomay** | Rp 29.000 | Mie, 3 Baso Kecil, 1 Siomay |
| | Mie Kuah / Yamin Manis / Yamin Asin | **1/2 + Tambah Tahu** | Rp 29.000 | Mie, 3 Baso Kecil, 1 Tahu |
| **Topping Ekstra** | Babat, Tetelan, Baso Urat, Siomay, Tahu | Ala Carte | Rp 5.000 / item | Ekstra per mangkok |
| **Minuman** | Teh Botol Sosro | Botol | Rp 6.000 | Dingin / Normal |
| | Es Jeruk Peras | Gelas | Rp 10.000 | Segar manis |
| | Air Putih Botol | Botol | Rp 6.000 | Dingin / Normal |
| | Aneka Jus Segar KS | Gelas | Sesuai Buah | Harga fleksibel di kasir |

---

## ⚙️ Petunjuk Instalasi & Pengembangan Lokal

### 1. Prasyarat
- Node.js versi 18 atau lebih tinggi
- npm atau pnpm

### 2. Menjalankan di Komputer Kasir / Laptop
```bash
# 1. Masuk ke folder proyek
cd kartikasari-pos-crm

# 2. Install dependensi
npm install

# 3. Jalankan server pengembang lokal
npm run dev
```
Buka browser di `http://localhost:5173`.

### 3. Menjalankan Pengujian Otomatis (Automated Test Suite)
```bash
# Menjalankan 129 test komprehensif
npm test
```

### 4. Build untuk Produksi
```bash
npm run build
```
Hasil build siap hosting akan berada di dalam folder `dist/`.

---

## 🔑 Cara Mengganti Kata Sandi (Password) Admin di Kemudian Hari

Untuk keamanan, Anda dapat mengganti password admin kasir dengan dua cara:

### Cara 1: Mengubah File Sumber Kode (Mudah & Cepat)
1. Buka file `src/context/AuthContext.tsx`.
2. Cari fungsi verifikasi kredensial:
   ```ts
   const VERIFY_CREDENTIALS = (email: string, pass: string): boolean => {
     const cleanEmail = email.trim().toLowerCase();
     return cleanEmail === ALLOWED_ADMIN_EMAIL.toLowerCase() && pass === 'yoiyoiyoi01';
   };
   ```
3. Ubah string `'yoiyoiyoi01'` menjadi password baru pilihan Anda.
4. Simpan file dan jalankan `npm run build`.

### Cara 2: Menggunakan Layanan Supabase Auth (Produksi Skala Besar)
1. Aktifkan Supabase Auth di dashboard Supabase Anda.
2. Tambahkan user dengan email `mfanza123@gmail.com`.
3. Masukkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` pada file `.env`.
4. Anda dapat mereset atau mengganti password kapan saja langsung dari dashboard pengguna Supabase tanpa menyentuh kode.

---

## 📱 Panduan Install di HP (Android & iPhone / iOS)

Aplikasi ini sudah dilengkapi **PWA (Progressive Web App)** sehingga kasir maupun pelanggan dapat meng-install aplikasi ini langsung dari peramban tanpa perlu melalui Google Play Store atau Apple App Store:

### Di HP Android (Google Chrome):
1. Buka link web aplikasi di Chrome.
2. Akan muncul tombol atau pill **"Install di HP (Android / iOS)"** di pojok kiri bawah layar, tap tombol tersebut.
3. Atau tap icon titik tiga (**⋮**) di pojok kanan atas browser Chrome.
4. Pilih **"Tambahkan ke Layar Utama"** (*Add to Home screen*) atau **"Instal Aplikasi"**.
5. Icon Mie Baso Kartika Sari akan otomatis muncul di layar utama HP Anda dan dapat dibuka fullscreen seperti aplikasi native.

### Di iPhone / iPad (Safari):
1. Buka link web aplikasi di peramban **Safari**.
2. Tap tombol **Bagikan** (*Share* — icon kotak dengan panah ke atas di bagian bawah layar).
3. Gulir ke bawah dan pilih **"Tambah ke Layar Utama"** (*Add to Home Screen*).
4. Beri nama (misal: "Mie Baso KS") lalu tap **Tambah** (*Add*).
5. Aplikasi siap digunakan dalam mode standalone tanpa address bar Safari.

### Build Menjadi File APK Android Native (Capacitor):
Proyek ini sudah memiliki konfigurasi `capacitor.config.ts`. Untuk membuat file APK native:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap copy
npx cap open android
```
Project Android Studio akan terbuka dan Anda dapat mengekspor file `.apk` langsung ke HP kasir.

---

## 🚀 Panduan Hosting Online (Vercel / Netlify)

Aplikasi ini 100% siap di-deploy secara gratis dengan domain HTTPS otomatis:

### Deploy ke Vercel (Rekomendasi Paling Mudah):
1. Unggah source code ini ke repository GitHub Anda (misal `github.com/username/kartikasari-pos-crm`).
2. Masuk ke [Vercel](https://vercel.com) dan hubungkan akun GitHub Anda.
3. Klik **"Add New Project"** dan pilih repository `kartikasari-pos-crm`.
4. Vercel akan otomatis mendeteksi framework **Vite**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Tambahkan Environment Variable (jika ada):
   - `VITE_ADMIN_EMAIL` = `mfanza123@gmail.com`
   - `VITE_SUPABASE_URL` = *(URL Supabase Anda)*
   - `VITE_SUPABASE_ANON_KEY` = *(Anon Key Supabase Anda)*
6. Klik **"Deploy"**. Dalam 1 menit, web aplikasi kasir sudah online di domain `https://kartikasari-pos-crm.vercel.app`!

### Deploy ke Netlify:
1. Masuk ke [Netlify](https://netlify.com) dan pilih **"Add new site"** $\rightarrow$ **"Import an existing project"**.
2. Pilih repository GitHub Anda.
3. Atur build command: `npm run build` dan publish directory: `dist`.
4. Klik **"Deploy Site"**.

---

## 🛡️ Daftar Environment Variable (`.env`)

| Variable | Nilai Default | Keterangan |
| :--- | :--- | :--- |
| `VITE_ADMIN_EMAIL` | `mfanza123@gmail.com` | Email resmi akun pengelola toko kasir |
| `VITE_SUPABASE_URL` | *(Opsional)* | Endpoint project cloud database Supabase |
| `VITE_SUPABASE_ANON_KEY` | *(Opsional)* | Kunci publik API Supabase |

*(Catatan: Tanpa mengisi kredensial Supabase pun, aplikasi tetap beroperasi 100% normal dengan mode local offline cache IndexedDB/LocalStorage).*

---

© 2026 **Mie Baso & Aneka Jus Kartika Sari (KS)** — Jln. Otista No 127 Paseban, Garut.
