const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches (widescreen)
pres.title = 'Presentasi PRD - Mie Baso & Aneka Jus Kartika Sari Garut';
pres.author = 'Muhammad Fanza Yuseftian';
pres.company = 'Mie Baso Kartika Sari Garut';

// Color Palette Constants
const COLOR = {
  FOREST_DARK: '143823',
  FOREST_MID: '166534',
  EMERALD: '059669',
  GOLD: 'D97706',
  GOLD_LIGHT: 'FEF3C7',
  SLATE_DARK: '0F172A',
  SLATE_TEXT: '334155',
  SLATE_MUTED: '64748B',
  BG_LIGHT: 'F8FAFC',
  CARD_BG: 'FFFFFF',
  CARD_BORDER: 'E2E8F0',
  WHITE: 'FFFFFF',
  RED_ACCENT: 'DC2626',
  BLUE_ACCENT: '2563EB',
};

// Paths to presentation asset images
const ASSETS_DIR = path.resolve(__dirname, '../presentation_assets');
const IMG = {
  LOGO: path.join(ASSETS_DIR, 'logo_kartikasari.jpg'),
  PORTAL_HERO: path.join(ASSETS_DIR, 'portal_hero.png'),
  MENU_CATALOG: path.join(ASSETS_DIR, 'menu_catalog.png'),
  MENU_ITEM_DETAIL: path.join(ASSETS_DIR, 'menu_item_detail.png'),
  ORDER_QUEUE: path.join(ASSETS_DIR, 'order_queue.png'),
  TOUCH_POS: path.join(ASSETS_DIR, 'touch_pos.png'),
  STAMP_CARD: path.join(ASSETS_DIR, 'stamp_card.png'),
  STAMP_SEARCH: path.join(ASSETS_DIR, 'stamp_search.png'),
  QRIS_PAYMENT: path.join(ASSETS_DIR, 'qris_payment.png'),
  QRIS_BARCODE: path.join(ASSETS_DIR, 'qris_barcode.jpg'),
};

// Common Slide Header Helper for PRD
function addPrdHeader(slide, prdSection, title, subtitle) {
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 0.35,
    w: 2.6,
    h: 0.3,
    rectRadius: 0.15,
    fill: { color: COLOR.GOLD_LIGHT },
    line: { color: COLOR.GOLD, width: 1 },
  });
  slide.addText(prdSection.toUpperCase(), {
    x: 0.8,
    y: 0.35,
    w: 2.6,
    h: 0.3,
    fontSize: 9,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.GOLD,
    align: 'center',
    valign: 'middle',
  });

  slide.addText(title, {
    x: 0.8,
    y: 0.72,
    w: 8.4,
    h: 0.45,
    fontSize: 21,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
    valign: 'middle',
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8,
      y: 1.18,
      w: 8.4,
      h: 0.28,
      fontSize: 10.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_MUTED,
      valign: 'top',
    });
  }
}

// Common Slide Footer Helper for PRD
function addPrdFooter(slide, current, total) {
  slide.addText('PRD Dokumentasi Resmi • Mie Baso Kartika Sari Garut (Versi 2.1.0 Production)', {
    x: 0.8,
    y: 5.22,
    w: 7.0,
    h: 0.28,
    fontSize: 8.5,
    fontFace: 'Calibri',
    color: COLOR.SLATE_MUTED,
  });
  slide.addText(`${current} / ${total}`, {
    x: 8.2,
    y: 5.22,
    w: 1.0,
    h: 0.28,
    fontSize: 8.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.SLATE_MUTED,
    align: 'right',
  });
}

// ============================================================================
// SLIDE 1: PRD COVER SLIDE
// ============================================================================
{
  const s1 = pres.addSlide();
  s1.background = { color: COLOR.FOREST_DARK };

  // Decorative ambient glow
  s1.addShape(pres.ShapeType.ellipse, {
    x: 7.8,
    y: -0.8,
    w: 3.2,
    h: 3.2,
    fill: { color: '18432A' },
  });

  // Logo Image Box
  if (fs.existsSync(IMG.LOGO)) {
    s1.addImage({
      path: IMG.LOGO,
      x: 0.9,
      y: 0.7,
      w: 0.95,
      h: 0.95,
    });
  }

  // Top Category Pill
  s1.addShape(pres.ShapeType.roundRect, {
    x: 2.0,
    y: 0.95,
    w: 3.6,
    h: 0.35,
    rectRadius: 0.17,
    fill: { color: '1E5434' },
    line: { color: COLOR.GOLD, width: 1.2 },
  });
  s1.addText('PRODUCT REQUIREMENTS DOCUMENT (PRD)', {
    x: 2.0,
    y: 0.95,
    w: 3.6,
    h: 0.35,
    fontSize: 9.5,
    fontFace: 'Calibri',
    bold: true,
    color: 'FDE68A',
    align: 'center',
    valign: 'middle',
  });

  // Main Title
  s1.addText('Spesifikasi Kebutuhan Produk:\nSistem POS, Self-Ordering & CRM', {
    x: 0.9,
    y: 1.8,
    w: 4.8,
    h: 1.35,
    fontSize: 27,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.WHITE,
    lineSpacingMultiple: 1.1,
  });

  // Subtitle
  s1.addText('Dokumen Resmi PRD • Versi 2.1.0 (Production Release)\nRumah Makan Mie Baso & Aneka Jus Kartika Sari Garut', {
    x: 0.9,
    y: 3.25,
    w: 4.8,
    h: 0.5,
    fontSize: 11,
    fontFace: 'Calibri',
    color: 'A7F3D0',
    lineSpacingMultiple: 1.15,
  });

  // Product Owner Info
  s1.addText('Product Owner: Muhammad Fanza Yuseftian\nLive Production: kartikasari-pos-crm.vercel.app', {
    x: 0.9,
    y: 4.25,
    w: 4.8,
    h: 0.5,
    fontSize: 10.5,
    fontFace: 'Calibri',
    color: 'E2E8F0',
  });

  // Right Photo: Real App Mockup Frame (Portal Hero)
  if (fs.existsSync(IMG.PORTAL_HERO)) {
    s1.addShape(pres.ShapeType.roundRect, {
      x: 5.7,
      y: 1.0,
      w: 3.65,
      h: 3.9,
      rectRadius: 0.14,
      fill: { color: '18432A' },
      line: { color: '2E7D4E', width: 1.5 },
    });
    s1.addImage({
      path: IMG.PORTAL_HERO,
      x: 5.8,
      y: 1.1,
      w: 3.45,
      h: 2.8,
    });
    s1.addText('📸 Implementasi Nyata PRD pada Web App Mobile', {
      x: 5.8,
      y: 4.0,
      w: 3.45,
      h: 0.35,
      fontSize: 9.5,
      fontFace: 'Calibri',
      bold: true,
      color: 'FDE68A',
      align: 'center',
    });
    s1.addText('Memenuhi 100% spesifikasi kebutuhan di dokumen PRD.md', {
      x: 5.8,
      y: 4.35,
      w: 3.45,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: '94A3B8',
      align: 'center',
    });
  }

  s1.addNotes(
    'Selamat pagi/siang bapak/ibu dan rekan-rekan. Hari ini saya mempresentasikan Product Requirements Document (PRD) resmi untuk pengembangan ekosistem digital Mie Baso & Aneka Jus Kartika Sari Garut. Dokumen PRD ini menjadi fondasi spesifikasi produk versi 2.1.0 yang saat ini telah selesai diimplementasikan, diuji secara menyeluruh, dan telah aktif beroperasi di lingkungan produksi.'
  );
}

// ============================================================================
// SLIDE 2: PRD SECTION 1 - DOKUMEN KONTROL & PROBLEM STATEMENT
// ============================================================================
{
  const s2 = pres.addSlide();
  s2.background = { color: COLOR.BG_LIGHT };
  addPrdHeader(s2, 'PRD Section 1', 'Dokumen Kontrol & Latar Belakang Masalah', 'Identitas formal PRD dan analisis akar permasalahan operasional restoran');

  // Left Card: Document Control Table
  s2.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 3.8,
    h: 3.45,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });
  s2.addText('📋 Lembar Kontrol Dokumen PRD', {
    x: 1.0,
    y: 1.8,
    w: 3.4,
    h: 0.3,
    fontSize: 12.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const docControls = [
    { label: 'Nama Produk', val: 'Ekosistem Digital Kartika Sari' },
    { label: 'Versi Rilis', val: '2.1.0 (Production Approved)' },
    { label: 'Product Owner', val: 'Muhammad Fanza Yuseftian' },
    { label: 'Platform', val: 'PWA Web (React 18 + Supabase)' },
    { label: 'Lokasi Usaha', val: 'Jl. Otista No 127 Paseban, Garut' },
    { label: 'Status Uji', val: '277 Automated Tests (100% Pass)' },
  ];
  docControls.forEach((dc, idx) => {
    s2.addText(`${dc.label}:`, {
      x: 1.0,
      y: 2.18 + idx * 0.45,
      w: 1.3,
      h: 0.22,
      fontSize: 9.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });
    s2.addText(dc.val, {
      x: 2.3,
      y: 2.18 + idx * 0.45,
      w: 2.1,
      h: 0.4,
      fontSize: 9.5,
      fontFace: 'Calibri',
      color: COLOR.EMERALD,
    });
  });

  // Right Side: 4 Problem Statement Cards
  const problems = [
    { title: '⏳ Antrean Panjang di Kasir', desc: 'Pelanggan harus berdiri lama hanya untuk pesan dan bayar saat jam sibuk.' },
    { title: '📝 Kertas Pesanan Dapur Hilang', desc: 'Nota kertas basah/sobek membuat salah antar dan salah racik porsi mie.' },
    { title: '🏷️ Kartu Stempel Kertas Tidak Efektif', desc: 'Kupon fisik sering tertinggal di rumah, rusak, atau hilang di dompet.' },
    { title: '📒 Tutup Buku Manual & Selisih', desc: 'Rekapitulasi omset butuh 1 jam dan rawan salah hitung matematika.' },
  ];
  problems.forEach((p, idx) => {
    const y = 1.6 + idx * 0.85;
    s2.addShape(pres.ShapeType.roundRect, {
      x: 4.8,
      y,
      w: 4.4,
      h: 0.78,
      rectRadius: 0.08,
      fill: { color: COLOR.CARD_BG },
      line: { color: 'FCA5A5', width: 0.8 },
    });
    s2.addText(p.title, {
      x: 5.0,
      y: y + 0.1,
      w: 4.0,
      h: 0.28,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.RED_ACCENT,
    });
    s2.addText(p.desc, {
      x: 5.0,
      y: y + 0.38,
      w: 4.0,
      h: 0.35,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  addPrdFooter(s2, 2, 12);
  s2.addNotes(
    'Pada Bagian 1 PRD, kami mendokumentasikan lembar kontrol produk dan 4 problem statement utama. Masalah klasik restoran kuliner ramai adalah antrean menumpuk, nota kertas hilang, kartu kupon stempel yang tidak efektif, dan proses tutup buku malam hari yang memakan waktu lama.'
  );
}

// ============================================================================
// SLIDE 3: PRD SECTION 2 - USER PERSONAS & ROLE MATRIX
// ============================================================================
{
  const s3 = pres.addSlide();
  s3.background = { color: COLOR.BG_LIGHT };
  addPrdHeader(s3, 'PRD Section 2', 'Profil Pengguna & Matriks Peran (User Personas)', 'Pemetaan 4 peran pengguna dalam sistem dari pelanggan hingga pemilik toko');

  const personas = [
    {
      role: '📱 Pelanggan Meja (Customer)',
      platform: 'Smartphone Browser / PWA',
      resp: 'Scan QR di meja, pilih porsi mie & ekstra topping, checkout mandiri (Cash/QRIS), lacak status pesanan live, dan cek stempel WhatsApp.',
      color: COLOR.EMERALD,
    },
    {
      role: '🔔 Juru Masak (Kitchen)',
      platform: 'Tablet Dapur (/admin/orders)',
      resp: 'Menerima pesanan masuk real-time, melihat preferensi selera khusus (kuah pisah, pedas), dan memajukan status pesanan menjadi Siap Diambil.',
      color: COLOR.BLUE_ACCENT,
    },
    {
      role: '💻 Kasir Restoran (Cashier)',
      platform: 'Tablet/Laptop POS (/admin/pos)',
      resp: 'Konfirmasi pembayaran tunai dengan tombol uang cepat, verifikasi QRIS digital, cetak nota thermal kasir, dan kirim e-receipt WhatsApp.',
      color: COLOR.GOLD,
    },
    {
      role: '📊 Pemilik Toko (Store Owner)',
      platform: 'PC / Laptop Admin (/admin/reports)',
      resp: 'Memantau omzet penjualan bersih real-time, melihat menu terlaris, kelola segmentasi pelanggan CRM, dan ekspor laporan ke Excel CSV & PDF.',
      color: '7C3AED',
    },
  ];

  personas.forEach((ps, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 4.3;
    const y = 1.6 + row * 1.68;

    s3.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: 4.1,
      h: 1.5,
      rectRadius: 0.1,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });

    s3.addShape(pres.ShapeType.rect, {
      x: x + 0.02,
      y: y + 0.02,
      w: 4.06,
      h: 0.08,
      fill: { color: ps.color },
    });

    s3.addText(ps.role, {
      x: x + 0.2,
      y: y + 0.18,
      w: 3.7,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });
    s3.addText(`Platform: ${ps.platform}`, {
      x: x + 0.2,
      y: y + 0.48,
      w: 3.7,
      h: 0.22,
      fontSize: 9,
      fontFace: 'Calibri',
      bold: true,
      color: ps.color,
    });
    s3.addText(ps.resp, {
      x: x + 0.2,
      y: y + 0.72,
      w: 3.7,
      h: 0.7,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      lineSpacingMultiple: 1.15,
    });
  });

  addPrdFooter(s3, 3, 12);
  s3.addNotes(
    'Bagian 2 PRD merinci 4 persona pengguna: Pelanggan yang memesan mandiri, Juru masak di dapur yang memantau pesanan real-time, Kasir yang mengeksekusi transaksi cepat, dan Pemilik Toko yang mengawasi performa omzet dan loyalitas pelanggan.'
  );
}

// ============================================================================
// SLIDE 4: PRD MODUL 1 - CUSTOMER PORTAL & SELF-ORDERING
// ============================================================================
{
  const s4 = pres.addSlide();
  s4.background = { color: COLOR.BG_LIGHT };
  addPrdHeader(s4, 'PRD Modul 1 (FR-1)', 'Customer Portal & Pemesanan Mandiri Meja', 'Spesifikasi fitur pemesanan mandiri pelanggan via browser smartphone');

  // Left Side: FR-1 Specifications
  const specs = [
    { code: 'FR-1.1', title: 'Katalog 27 Menu Otentik', desc: 'Pilihan porsi mie kuah, yamin manis, yamin asin, minuman, & topping ekstra.' },
    { code: 'FR-1.2', title: 'Topping Ala Carte Fleksibel', desc: 'Baso urat jumbo (Rp 10k), babat, tetelan empuk, siomay, & tahu (Rp 5k).' },
    { code: 'FR-1.3', title: 'Keranjang Belanja Persisten', desc: 'Pilihan porsi tidak hilang saat layar HP tidak sengaja ditutup atau reload.' },
    { code: 'FR-1.4', title: 'Metode Bayar QRIS & Tunai', desc: 'Pelanggan bebas memilih bayar digital QRIS atau tunai langsung ke kasir.' },
    { code: 'FR-1.5', title: 'Pelacakan Status Real-Time', desc: 'Status pesanan terpantau live dari Sedang Diproses hingga Siap Diambil.' },
  ];

  specs.forEach((sp, idx) => {
    const y = 1.55 + idx * 0.68;
    s4.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y,
      w: 4.8,
      h: 0.62,
      rectRadius: 0.06,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });
    s4.addText(sp.code, {
      x: 0.95,
      y: y + 0.12,
      w: 0.8,
      h: 0.38,
      fontSize: 9.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.EMERALD,
    });
    s4.addText(sp.title, {
      x: 1.75,
      y: y + 0.08,
      w: 3.7,
      h: 0.24,
      fontSize: 10.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });
    s4.addText(sp.desc, {
      x: 1.75,
      y: y + 0.32,
      w: 3.7,
      h: 0.28,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_MUTED,
    });
  });

  // Right Photo: Menu Catalog & Product Detail
  if (fs.existsSync(IMG.MENU_ITEM_DETAIL)) {
    s4.addShape(pres.ShapeType.roundRect, {
      x: 5.8,
      y: 1.55,
      w: 3.4,
      h: 3.45,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: 'CBD5E1', width: 1 },
    });
    s4.addImage({
      path: IMG.MENU_ITEM_DETAIL,
      x: 6.0,
      y: 1.65,
      w: 3.0,
      h: 2.8,
    });
    s4.addText('📸 Implementasi PRD: Kartu Menu Baso Urat Jumbo', {
      x: 5.9,
      y: 4.6,
      w: 3.2,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
      align: 'center',
    });
  }

  addPrdFooter(s4, 4, 12);
  s4.addNotes(
    'Modul 1 PRD mengatur spesifikasi portal pelanggan. Pelanggan dapat memesan dari smartphone, meracik topping ekstra seperti baso urat seharga Rp 10.000, serta memilih pembayaran tunai atau QRIS. Semua kebutuhan fungsional FR-1.1 hingga FR-1.5 telah terpenuhi 100%.'
  );
}

// ============================================================================
// SLIDE 5: PRD MODUL 2 - KITCHEN & CASHIER REAL-TIME ORDER QUEUE
// ============================================================================
{
  const s5 = pres.addSlide();
  s5.background = { color: COLOR.BG_LIGHT };
  addPrdHeader(s5, 'PRD Modul 2 (FR-2)', 'Antrean Dapur & Kasir Real-Time (Order Queue)', 'Alur komunikasi pemesanan antar perangkat tanpa jeda waktu (<100ms)');

  // Left Photo: Order Queue Screen
  if (fs.existsSync(IMG.ORDER_QUEUE)) {
    s5.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.55,
      w: 4.15,
      h: 3.5,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });
    s5.addText('📋 Antrean Pesanan Masuk (Order Queue)', {
      x: 0.95,
      y: 1.7,
      w: 3.85,
      h: 0.28,
      fontSize: 11.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });
    s5.addImage({
      path: IMG.ORDER_QUEUE,
      x: 0.95,
      y: 2.05,
      w: 3.85,
      h: 1.95,
    });
    s5.addText('• State Machine: Baru ➔ Menunggu Bayar ➔ Diproses ➔ Siap ➔ Selesai\n• Latensi WebSocket: <100ms sinkronisasi cloud Supabase', {
      x: 0.95,
      y: 4.1,
      w: 3.85,
      h: 0.85,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      lineSpacingMultiple: 1.15,
    });
  }

  // Right Side: FR-2 Requirements Breakdown
  const queueSpecs = [
    { code: 'FR-2.1', title: 'Full-Duplex Real-Time Sync', desc: 'Sinkronisasi instan via Supabase WebSockets; kasir tidak perlu refresh manual.' },
    { code: 'FR-2.2', title: 'Audio Chime Lonceng Otomatis', desc: 'Komputer kasir & tablet dapur membunyikan lonceng saat ada pesanan baru.' },
    { code: 'FR-2.3', title: 'Validasi Pembayaran Ketat', desc: 'Pesanan tunai belum dibayar tidak dapat dimajukan juru masak sebelum kasir konfirmasi.' },
    { code: 'FR-2.4', title: 'Indikator Siap Diambil', desc: 'Pelayan dan pelanggan menerima alert visual berkedip saat masakan siap saji.' },
  ];

  queueSpecs.forEach((qs, idx) => {
    const y = 1.55 + idx * 0.85;
    s5.addShape(pres.ShapeType.roundRect, {
      x: 5.15,
      y,
      w: 4.15,
      h: 0.78,
      rectRadius: 0.08,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });
    s5.addText(qs.code, {
      x: 5.35,
      y: y + 0.12,
      w: 0.85,
      h: 0.35,
      fontSize: 9.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.EMERALD,
    });
    s5.addText(qs.title, {
      x: 6.2,
      y: y + 0.1,
      w: 2.95,
      h: 0.28,
      fontSize: 10.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });
    s5.addText(qs.desc, {
      x: 6.2,
      y: y + 0.38,
      w: 2.95,
      h: 0.35,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_MUTED,
    });
  });

  addPrdFooter(s5, 5, 12);
  s5.addNotes(
    'Modul 2 PRD mengatur antrean pesanan real-time. Melalui WebSocket Supabase, pesanan dari smartphone pelanggan langsung muncul di layar antrean dapur dalam waktu kurang dari 100 milidetik, disertai audio chime lonceng sehingga koki langsung mengetahui ada pesanan baru.'
  );
}

// ============================================================================
// SLIDE 6: PRD MODUL 3 - DIGITAL STAMP LOYALTY ENGINE
// ============================================================================
{
  const s6 = pres.addSlide();
  s6.background = { color: COLOR.BG_LIGHT };
  addPrdHeader(s6, 'PRD Modul 3 (FR-3)', 'Mesin Kartu Stempel Loyalitas Digital', 'Spesifikasi program loyalitas "Beli 10 Porsi Gratis 1" berbasis nomor WhatsApp');

  // Left Photo: Stamp Card Modal Photo
  if (fs.existsSync(IMG.STAMP_CARD)) {
    s6.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.55,
      w: 4.15,
      h: 3.5,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: 'CBD5E1', width: 1 },
    });
    s6.addText('🍜 Kartu Member Digital (10 Mangkok Mie)', {
      x: 0.95,
      y: 1.7,
      w: 3.85,
      h: 0.28,
      fontSize: 11.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });
    s6.addImage({
      path: IMG.STAMP_CARD,
      x: 0.95,
      y: 2.05,
      w: 3.85,
      h: 2.3,
    });
    s6.addText('📸 Bukti Nyata: Member Card Muhammad Fanza (2/10 Stempel Terisi)', {
      x: 0.95,
      y: 4.45,
      w: 3.85,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.GOLD,
      align: 'center',
    });
  }

  // Right Side: FR-3 Rules & Specs
  const stampSpecs = [
    { code: 'FR-3.1', title: '1 Porsi Mie = 1 Stempel', desc: 'Perhitungan otomatis dari porsi mie kuah, yamin manis, dan asin yang dibeli.' },
    { code: 'FR-3.2', title: 'Anti Double-Counting', desc: 'Mencatat ID order di array stampsOrdersTracked agar poin tidak ganda.' },
    { code: 'FR-3.3', title: 'Pencarian Tanpa Kartu Fisik', desc: 'Pelanggan cukup memasukkan nama atau nomor WhatsApp saat bayar di kasir.' },
    { code: 'FR-3.4', title: 'Reward Stempel ke-10', desc: 'Stempel ke-10 memicu konfeti dan klaim 1 porsi Mie Kuah/Yamin GRATIS.' },
  ];

  stampSpecs.forEach((ss, idx) => {
    const y = 1.55 + idx * 0.85;
    s6.addShape(pres.ShapeType.roundRect, {
      x: 5.15,
      y,
      w: 4.15,
      h: 0.78,
      rectRadius: 0.08,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });
    s6.addText(ss.code, {
      x: 5.35,
      y: y + 0.12,
      w: 0.85,
      h: 0.35,
      fontSize: 9.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.EMERALD,
    });
    s6.addText(ss.title, {
      x: 6.2,
      y: y + 0.1,
      w: 2.95,
      h: 0.28,
      fontSize: 10.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });
    s6.addText(ss.desc, {
      x: 6.2,
      y: y + 0.38,
      w: 2.95,
      h: 0.35,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_MUTED,
    });
  });

  addPrdFooter(s6, 6, 12);
  s6.addNotes(
    'Modul 3 PRD adalah mesin stempel loyalitas digital. Kami mengimplementasikan aturan ketat: 1 porsi mie baso otomatis menambah 1 stempel. Seperti pada foto kartu member Muhammad Fanza Yuseftian dengan saldo 2 dari 10 stempel, data ini langsung tersinkronisasi di Supabase cloud tanpa resiko kartu fisik hilang.'
  );
}

// ============================================================================
// SLIDE 7: PRD MODUL 4 - TOUCH POS KASIR JAM SIBUK
// ============================================================================
{
  const s7 = pres.addSlide();
  s7.background = { color: COLOR.BG_LIGHT };
  addPrdHeader(s7, 'PRD Modul 4 (FR-4)', 'Touch POS Kasir Cepat & Struk Nota', 'Spesifikasi antarmuka kasir layar sentuh untuk kecepatan transaksi jam sibuk');

  // Left Photo: Touch POS Screen
  if (fs.existsSync(IMG.TOUCH_POS)) {
    s7.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.55,
      w: 4.15,
      h: 3.5,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });
    s7.addText('⚡ Layar Touch POS Kasir Jam Sibuk', {
      x: 0.95,
      y: 1.7,
      w: 3.85,
      h: 0.28,
      fontSize: 11.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });
    s7.addImage({
      path: IMG.TOUCH_POS,
      x: 0.95,
      y: 2.05,
      w: 3.85,
      h: 1.95,
    });
    s7.addText('• Keranjang Dinamis & Hitung Kembalian Uang Pas Otomatis\n• Cetak Struk Kasir & Kirim E-Receipt via WhatsApp wa.me', {
      x: 0.95,
      y: 4.1,
      w: 3.85,
      h: 0.85,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      lineSpacingMultiple: 1.15,
    });
  }

  // Right Side: FR-4 Specifications
  const posSpecs = [
    { code: 'FR-4.1', title: 'Layout Khusus Layar Sentuh', desc: 'Tombol porsi besar dioptimalkan untuk sentuhan cepat jari kasir tablet/PC.' },
    { code: 'FR-4.2', title: 'Tombol Cepat Uang Kertas', desc: 'Tombol instan: Uang Pas, Rp 50.000, Rp 100.000, serta kalkulator kembalian.' },
    { code: 'FR-4.3', title: 'E-Receipt WhatsApp wa.me', desc: 'Format teks struk rapi berbahasa Indonesia otomatis terkirim ke WhatsApp pelanggan.' },
    { code: 'FR-4.4', title: 'Pencarian Transaksi Cepat', desc: 'Cari riwayat pesanan berdasarkan ID nota, nama pembeli, atau nomor meja.' },
  ];

  posSpecs.forEach((ps, idx) => {
    const y = 1.55 + idx * 0.85;
    s7.addShape(pres.ShapeType.roundRect, {
      x: 5.15,
      y,
      w: 4.15,
      h: 0.78,
      rectRadius: 0.08,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });
    s7.addText(ps.code, {
      x: 5.35,
      y: y + 0.12,
      w: 0.85,
      h: 0.35,
      fontSize: 9.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.EMERALD,
    });
    s7.addText(ps.title, {
      x: 6.2,
      y: y + 0.1,
      w: 2.95,
      h: 0.28,
      fontSize: 10.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });
    s7.addText(ps.desc, {
      x: 6.2,
      y: y + 0.38,
      w: 2.95,
      h: 0.35,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_MUTED,
    });
  });

  addPrdFooter(s7, 7, 12);
  s7.addNotes(
    'Modul 4 PRD menetapkan spesifikasi Touch POS Kasir. Kasir didesain untuk kecepatan pelayanan dengan tombol nominal cepat 50 ribu, 100 ribu, dan uang pas, sehingga memotong waktu antre bayar dari 5 menit menjadi kurang dari 15 detik per transaksi.'
  );
}

// ============================================================================
// SLIDE 8: PRD MODUL 5 - CRM & SEGMENTASI PELANGGAN OTOMATIS
// ============================================================================
{
  const s8 = pres.addSlide();
  s8.background = { color: COLOR.BG_LIGHT };
  addPrdHeader(s8, 'PRD Modul 5 (FR-5)', 'CRM Cerdas & Pemasaran WhatsApp Personal', 'Spesifikasi manajemen retensi pelanggan berbasis data kunjungan dan transaksi');

  // Left Side: 4 CRM Segments
  const segments = [
    { title: '👑 Segmen VIP', desc: 'Kunjungan >5x. Pelanggan setia belanja tinggi diberikan layanan khusus & prioritas.', color: '7C3AED' },
    { title: '🟢 Segmen Reguler', desc: 'Pelanggan konsisten berkunjung rutin. Dijaga kepuasannya dengan perolehan stempel.', color: COLOR.EMERALD },
    { title: '🟡 Pelanggan Baru', desc: 'Transaksi pertama kali. Disambut bonus stempel perdana agar segera berkunjung kembali.', color: COLOR.GOLD },
    { title: '🔴 Segmen At-Risk', desc: 'Tidak berkunjung >30 hari. Ditargetkan promo khusus "Kangen Mie Kartika Sari".', color: COLOR.RED_ACCENT },
  ];

  segments.forEach((sg, idx) => {
    const y = 1.6 + idx * 0.82;
    s8.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y,
      w: 4.8,
      h: 0.75,
      rectRadius: 0.08,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });
    s8.addText(sg.title, {
      x: 1.0,
      y: y + 0.1,
      w: 4.4,
      h: 0.28,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: sg.color,
    });
    s8.addText(sg.desc, {
      x: 1.0,
      y: y + 0.38,
      w: 4.4,
      h: 0.32,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  // Right Photo: Real QRIS Modal Screenshot
  if (fs.existsSync(IMG.QRIS_PAYMENT)) {
    s8.addShape(pres.ShapeType.roundRect, {
      x: 5.8,
      y: 1.6,
      w: 3.4,
      h: 3.4,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: 'CBD5E1', width: 1 },
    });
    s8.addImage({
      path: IMG.QRIS_PAYMENT,
      x: 6.0,
      y: 1.7,
      w: 3.0,
      h: 2.8,
    });
    s8.addText('📸 Modal Pembayaran QRIS Resmi Kartika Sari', {
      x: 5.9,
      y: 4.6,
      w: 3.2,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
      align: 'center',
    });
  }

  addPrdFooter(s8, 8, 12);
  s8.addNotes(
    'Modul 5 PRD mengotomatisasi segmentasi pelanggan ke dalam 4 kategori: VIP, Reguler, Baru, dan At-Risk. Sistem dilengkapi generator draf promosi personal ke WhatsApp pelanggan hanya dengan 1-klik untuk mendorong kunjungan ulang.'
  );
}

// ============================================================================
// SLIDE 9: PRD MODUL 6 - LAPORAN OMSET & EKSPOR DATA (PDF & CSV)
// ============================================================================
{
  const s9 = pres.addSlide();
  s9.background = { color: COLOR.BG_LIGHT };
  addPrdHeader(s9, 'PRD Modul 6 (FR-6)', 'Laporan Keuangan & Ekspor Dokumen Resmi', 'Spesifikasi audit finansial toko dan ekspor format cetak PDF A4 & Excel CSV');

  // Left: Key Metrics
  s9.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.65,
    w: 4.15,
    h: 3.3,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });
  s9.addText('📈 Metrik Finansial Otomatis (FR-6.1)', {
    x: 1.05,
    y: 1.85,
    w: 3.6,
    h: 0.32,
    fontSize: 12.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const metrics = [
    { title: 'Total Omset Bersih Real-Time', desc: 'Kalkulasi otomatis transaksi lunas tanpa risiko salah hitung' },
    { title: 'Rata-rata Belanja (Basket Size)', desc: 'Indikator keberhasilan penawaran topping ekstra baso urat' },
    { title: 'Rekonsiliasi Cash vs QRIS', desc: 'Pengecekan uang fisik di laci kasir vs saldo e-wallet QRIS' },
    { title: 'Diagram Menu Terlaris (Pareto Top-5)', desc: 'Mengetahui menu mie favorit untuk persiapan bahan baku' },
  ];
  metrics.forEach((m, idx) => {
    s9.addText(`• ${m.title}`, {
      x: 1.05,
      y: 2.25 + idx * 0.65,
      w: 3.6,
      h: 0.28,
      fontSize: 10.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });
    s9.addText(m.desc, {
      x: 1.25,
      y: 2.53 + idx * 0.65,
      w: 3.4,
      h: 0.32,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_MUTED,
    });
  });

  // Right: Export Features Card
  s9.addShape(pres.ShapeType.roundRect, {
    x: 5.15,
    y: 1.65,
    w: 4.15,
    h: 3.3,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });
  s9.addText('📊 Fitur Ekspor Dokumen Resmi (FR-6.4)', {
    x: 5.4,
    y: 1.85,
    w: 3.65,
    h: 0.32,
    fontSize: 12.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const exports = [
    {
      badge: '📊 Export CSV / Excel (UTF-8 BOM)',
      detail: 'Format standar internasional UTF-8 BOM, angka desimal dan Rupiah langsung terbuka rapi di Microsoft Excel tanpa error karakter.',
    },
    {
      badge: '📄 Export PDF Resmi Ukuran A4',
      detail: 'Dokumen A4 siap cetak lengkap dengan kop Mie Baso Kartika Sari, rincian pembayaran tunai vs QRIS, dan kolom pengesahan owner.',
    },
    {
      badge: '🔒 Filter Rentang Waktu Fleksibel',
      detail: 'Owner bebas memilih pembukuan per hari ini, 7 hari terakhir, 30 hari, atau periode pembukuan bulanan kustom.',
    },
  ];
  exports.forEach((ex, idx) => {
    s9.addText(ex.badge, {
      x: 5.4,
      y: 2.25 + idx * 0.85,
      w: 3.65,
      h: 0.28,
      fontSize: 10.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.GOLD,
    });
    s9.addText(ex.detail, {
      x: 5.4,
      y: 2.53 + idx * 0.85,
      w: 3.65,
      h: 0.52,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      lineSpacingMultiple: 1.15,
    });
  });

  addPrdFooter(s9, 9, 12);
  s9.addNotes(
    'Modul 6 PRD memenuhi kebutuhan rekapitulasi pemilik toko. Kami melengkapi sistem dengan tombol Export CSV yang kompatibel Excel serta Export PDF ukuran A4 berstempel resmi Kartika Sari yang siap diprint untuk arsip pembukuan.'
  );
}

// ============================================================================
// SLIDE 10: PRD SECTION 4 - KEBUTUHAN NON-FUNGSIONAL (NFR)
// ============================================================================
{
  const s10 = pres.addSlide();
  s10.background = { color: COLOR.BG_LIGHT };
  addPrdHeader(s10, 'PRD Section 4', 'Kebutuhan Non-Fungsional (NFR) & Arsitektur', 'Spesifikasi keandalan sistem, zero-downtime offline, dan standar pengujian');

  const techSpecs = [
    {
      title: '💾 Zero-Downtime Offline-First',
      desc: 'Menerapkan IndexedDB local buffer. Kasir tetap bisa input pesanan dan cetak struk nota meski koneksi internet restoran sempat padam.',
    },
    {
      title: '⚡ Latensi Cloud Real-Time <100ms',
      desc: 'Supabase PostgreSQL Cloud dengan WebSocket push channel instan antara smartphone meja pelanggan, kasir, dan dapur.',
    },
    {
      title: '🔋 Anti-Lag & Efisiensi Memori',
      desc: 'Shallow memoization (areOrdersEqual) dan singleton AudioContext chime untuk menghemat CPU dan daya baterai HP pembeli.',
    },
    {
      title: '🧪 277 Automated Tests (100% Pass)',
      desc: 'Teruji secara otomatis di 24 test file mencakup stress test concurrent orders, phone formatting 08/62, dan akurasi keuangan kasir.',
    },
  ];

  techSpecs.forEach((ts, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 4.3;
    const y = 1.65 + row * 1.65;

    s10.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: 4.1,
      h: 1.45,
      rectRadius: 0.1,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });

    s10.addText(ts.title, {
      x: x + 0.25,
      y: y + 0.15,
      w: 3.6,
      h: 0.35,
      fontSize: 12,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
      valign: 'middle',
    });
    s10.addText(ts.desc, {
      x: x + 0.25,
      y: y + 0.52,
      w: 3.6,
      h: 0.8,
      fontSize: 9.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      lineSpacingMultiple: 1.15,
    });
  });

  addPrdFooter(s10, 10, 12);
  s10.addNotes(
    'Bagian 4 PRD menetapkan standar NFR (Non-Functional Requirements). Kami menjamin Zero-Downtime berkat arsitektur Offline-First IndexedDB. Selain itu, sistem telah divalidasi dengan 277 automated tests dengan hasil 100% lulus tanpa kegagalan.'
  );
}

// ============================================================================
// SLIDE 11: PRD SECTION 5 & 6 - MASTER DATA & SKEMA DATABASE
// ============================================================================
{
  const s11 = pres.addSlide();
  s11.background = { color: COLOR.BG_LIGHT };
  addPrdHeader(s11, 'PRD Section 5 & 6', 'Master Data Menu & Skema Database SQL', 'Spesifikasi model data tabel orders dan customers di cloud Supabase');

  // Left Card: Database Schema Table
  s11.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 4.3,
    h: 3.4,
    rectRadius: 0.1,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });
  s11.addText('🗄️ Model Database PostgreSQL (Supabase)', {
    x: 1.0,
    y: 1.8,
    w: 3.9,
    h: 0.28,
    fontSize: 11.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const schemaItems = [
    { table: 'Tabel: orders', cols: 'id, customer_name, customer_whatsapp, table_number, items (JSONB), total_amount, payment_status, order_status, created_at, paid_at' },
    { table: 'Tabel: customers', cols: 'id, name, phone, whatsapp, total_visits, lifetime_value, stamps_count (0-10), segment, last_visit' },
  ];
  schemaItems.forEach((sc, idx) => {
    const sy = 2.15 + idx * 1.35;
    s11.addShape(pres.ShapeType.roundRect, {
      x: 1.0,
      y: sy,
      w: 3.9,
      h: 1.25,
      rectRadius: 0.06,
      fill: { color: 'F1F5F9' },
    });
    s11.addText(sc.table, {
      x: 1.15,
      y: sy + 0.1,
      w: 3.6,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });
    s11.addText(sc.cols, {
      x: 1.15,
      y: sy + 0.35,
      w: 3.6,
      h: 0.8,
      fontSize: 8.5,
      fontFace: 'Courier New',
      color: COLOR.SLATE_TEXT,
      lineSpacingMultiple: 1.1,
    });
  });

  // Right Card: Canonical Price Structure
  s11.addShape(pres.ShapeType.roundRect, {
    x: 5.3,
    y: 1.6,
    w: 4.0,
    h: 3.4,
    rectRadius: 0.1,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });
  s11.addText('🍜 Skema Harga Kanonikal PRD', {
    x: 5.5,
    y: 1.8,
    w: 3.6,
    h: 0.28,
    fontSize: 11.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const priceItems = [
    { menu: 'Mie Kuah / Yamin Seporsi', price: 'Rp 26.000 (Dapat Stempel)' },
    { menu: 'Mie Baso Setengah Porsi', price: 'Rp 20.000 (Dapat Stempel)' },
    { menu: 'Mie Baso Komplit', price: 'Rp 48.000 (Dapat Stempel)' },
    { menu: 'Komplit Khusus Yamin Asin', price: 'Rp 40.000 (Hemat 8k)' },
    { menu: 'Baso Urat Jumbo', price: 'Rp 10.000' },
    { menu: 'Topping Babat / Tetelan / Tahu / Sio', price: 'Rp 5.000 / item' },
    { menu: 'Es Jeruk Peras', price: 'Rp 15.000' },
  ];
  priceItems.forEach((pi, idx) => {
    s11.addText(`• ${pi.menu}:`, {
      x: 5.5,
      y: 2.18 + idx * 0.38,
      w: 2.3,
      h: 0.3,
      fontSize: 8.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });
    s11.addText(pi.price, {
      x: 7.7,
      y: 2.18 + idx * 0.38,
      w: 1.5,
      h: 0.3,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.EMERALD,
      align: 'right',
    });
  });

  addPrdFooter(s11, 11, 12);
  s11.addNotes(
    'Bagian 5 dan 6 PRD mendokumentasikan skema database relasional di PostgreSQL Supabase untuk tabel orders dan customers, serta master data harga resmi Kartika Sari Garut.'
  );
}

// ============================================================================
// SLIDE 12: PRD SECTION 7 & 8 - KPIS, SIGN-OFF & PENUTUP
// ============================================================================
{
  const s12 = pres.addSlide();
  s12.background = { color: COLOR.FOREST_DARK };

  // Logo in center-top
  if (fs.existsSync(IMG.LOGO)) {
    s12.addImage({
      path: IMG.LOGO,
      x: 0.9,
      y: 0.7,
      w: 0.95,
      h: 0.95,
    });
  }

  s12.addShape(pres.ShapeType.roundRect, {
    x: 2.0,
    y: 0.95,
    w: 2.6,
    h: 0.35,
    rectRadius: 0.17,
    fill: { color: '1E5434' },
    line: { color: COLOR.GOLD, width: 1.2 },
  });
  s12.addText('PRD SIGN-OFF & APPROVAL', {
    x: 2.0,
    y: 0.95,
    w: 2.6,
    h: 0.35,
    fontSize: 9.5,
    fontFace: 'Calibri',
    bold: true,
    color: 'FDE68A',
    align: 'center',
    valign: 'middle',
  });

  s12.addText('Pengesahan Dokumen PRD:\nProduk Siap Digunakan Penuh', {
    x: 0.9,
    y: 1.8,
    w: 8.2,
    h: 1.1,
    fontSize: 27,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.WHITE,
    lineSpacingMultiple: 1.1,
  });

  // Summary Points Card
  s12.addShape(pres.ShapeType.roundRect, {
    x: 0.9,
    y: 3.0,
    w: 8.2,
    h: 1.45,
    rectRadius: 0.12,
    fill: { color: '18432A' },
    line: { color: '2E7D4E', width: 1 },
  });

  const kpis = [
    '✓ Capaian KPI 1: Waktu antre pesan turun drastis dari 10 menit menjadi < 1 menit (Self-Ordering).',
    '✓ Capaian KPI 2: Akurasi pesanan dapur mencapai 99.9% (Tercatat digital tanpa nota kertas tercecer).',
    '✓ Capaian KPI 3: Proses rekapitulasi tutup buku harian tuntas dalam 1 detik via Export PDF & CSV.',
    '✓ Lembar Pengesahan: Disetujui resmi oleh Product Owner Muhammad Fanza Yuseftian (4 Nov 2026).',
  ];
  kpis.forEach((kp, idx) => {
    s12.addText(kp, {
      x: 1.15,
      y: 3.1 + idx * 0.33,
      w: 7.7,
      h: 0.3,
      fontSize: 9.5,
      fontFace: 'Calibri',
      color: 'E2E8F0',
      valign: 'middle',
    });
  });

  s12.addText('🔗 Akses Live Production: https://kartikasari-pos-crm.vercel.app', {
    x: 0.9,
    y: 4.62,
    w: 8.2,
    h: 0.28,
    fontSize: 11,
    fontFace: 'Calibri',
    bold: true,
    color: 'FBBF24',
  });
  s12.addText('Terima Kasih • Sesi Tanya Jawab PRD Dibuka', {
    x: 0.9,
    y: 4.95,
    w: 8.2,
    h: 0.3,
    fontSize: 12.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.WHITE,
  });

  s12.addNotes(
    'Sebagai kesimpulan, dokumen PRD ini membuktikan bahwa seluruh kebutuhan fungsional dan non-fungsional sistem Mie Baso Kartika Sari telah terpenuhi dan disahkan secara resmi. Target KPI tercapai dengan waktu antre di bawah 1 menit dan rekapitulasi tutup buku instan. Terima kasih, saya persilakan jika ada pertanyaan terkait dokumen PRD ini.'
  );
}

// Generate and Sanitize the PRD PPTX File
const outputPath = path.resolve(__dirname, '../PRD_Mie_Baso_Kartika_Sari.pptx');
const JSZip = require('jszip');

pres
  .write('nodebuffer')
  .then(async (buffer) => {
    // Sanitize OOXML structure to guarantee 100% compatibility with Microsoft PowerPoint
    const zip = await JSZip.loadAsync(buffer);

    // 1. Clean notesMaster1.xml to prevent PowerPoint repair dialog
    if (zip.files['ppt/notesMasters/notesMaster1.xml']) {
      let nm = await zip.files['ppt/notesMasters/notesMaster1.xml'].async('string');
      const cleanSpTree = '<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree>';
      nm = nm.replace(/<p:spTree>[\s\S]*?<\/p:spTree>/, cleanSpTree);
      zip.file('ppt/notesMasters/notesMaster1.xml', nm);
    }

    // 2. Remove phantom empty directories flagged by PowerPoint
    const emptyDirs = ['ppt/charts/', 'ppt/charts/_rels/', 'ppt/embeddings/'];
    for (const dir of emptyDirs) {
      if (zip.files[dir]) zip.remove(dir);
    }

    const cleanBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    fs.writeFileSync(outputPath, cleanBuffer);
    console.log('✅ File presentasi PRD PPTX berhasil dibuat dan disanitasi di:', outputPath);
  })
  .catch((err) => {
    console.error('❌ Gagal membuat PRD PPTX:', err);
    process.exit(1);
  });
