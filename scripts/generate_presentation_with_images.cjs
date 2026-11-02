const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches (widescreen)
pres.title = 'Presentasi Ekosistem Digital Mie Baso Kartika Sari Garut';
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

// Common Slide Header Helper
function addSlideHeader(slide, category, title, subtitle) {
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 0.35,
    w: 2.3,
    h: 0.3,
    rectRadius: 0.15,
    fill: { color: COLOR.GOLD_LIGHT },
    line: { color: COLOR.GOLD, width: 1 },
  });
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.35,
    w: 2.3,
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

// Common Slide Footer Helper
function addSlideFooter(slide, current, total) {
  slide.addText('Mie Baso & Aneka Jus Kartika Sari Garut • Ekosistem Digital Terintegrasi', {
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
// SLIDE 1: COVER SLIDE (With Logo & Hero App Mockup Photo)
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
    w: 3.4,
    h: 0.35,
    rectRadius: 0.17,
    fill: { color: '1E5434' },
    line: { color: COLOR.GOLD, width: 1.2 },
  });
  s1.addText('TRANSFORMASI DIGITAL UMKM KULINER', {
    x: 2.0,
    y: 0.95,
    w: 3.4,
    h: 0.35,
    fontSize: 9.5,
    fontFace: 'Calibri',
    bold: true,
    color: 'FDE68A',
    align: 'center',
    valign: 'middle',
  });

  // Main Title
  s1.addText('Sistem POS, Self-Ordering & CRM\nLoyalitas Stempel Real-Time', {
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
  s1.addText('Studi Kasus: Rumah Makan Mie Baso & Aneka Jus Kartika Sari Garut\nJl. Otista No 127 Paseban, Garut', {
    x: 0.9,
    y: 3.25,
    w: 4.8,
    h: 0.5,
    fontSize: 11,
    fontFace: 'Calibri',
    color: 'A7F3D0',
    lineSpacingMultiple: 1.15,
  });

  // Presenter Info
  s1.addText('Presenter: Muhammad Fanza Yuseftian\nLive App: kartikasari-pos-crm.vercel.app', {
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
    s1.addText('📸 Tampilan Langsung Web App di HP Pelanggan', {
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
    s1.addText('Pesan mandiri praktis, racik menu, & klaim stempel gratis', {
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
    'Selamat pagi/siang bapak/ibu dan rekan-rekan sekalian. Pada hari ini saya mempersembahkan ekosistem digital terpadu untuk Mie Baso Kartika Sari Garut. Di sebelah kanan slide ini adalah foto nyata dari aplikasi web mobile yang sudah berjalan live dan bisa langsung digunakan pelanggan dari smartphone mereka.'
  );
}

// ============================================================================
// SLIDE 2: LATAR BELAKANG & PROBLEM STATEMENT
// ============================================================================
{
  const s2 = pres.addSlide();
  s2.background = { color: COLOR.BG_LIGHT };
  addSlideHeader(s2, 'Latar Belakang', 'Tantangan Operasional Restoran Tradisional', 'Masalah klasik yang sering dialami UMKM kuliner saat jam ramai pengunjung');

  const problems = [
    {
      icon: '⏳',
      title: 'Antrean Kasir Menumpuk',
      desc: 'Pelanggan harus antre lama hanya untuk memesan menu dan membayar. Mengurangi kepuasan makan dan kenyamanan.',
    },
    {
      icon: '📝',
      title: 'Pesanan Dapur Tertukar',
      desc: 'Nota kertas sering tercecer, tulisan kasir tidak terbaca juru masak, dan pesanan salah diantar ke meja.',
    },
    {
      icon: '🏷️',
      title: 'Kupon Stempel Kertas Hilang',
      desc: 'Kartu kupon fisik sering tertinggal di rumah atau rusak di dompet, membuat program loyalitas tidak efektif.',
    },
    {
      icon: '📒',
      title: 'Rekap Omset Manual & Lambat',
      desc: 'Tutup buku memakan waktu hingga 1 jam setiap malam dengan risiko selisih hitung dan potensi kebocoran kas.',
    },
  ];

  problems.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 4.3;
    const y = 1.65 + row * 1.65;

    s2.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: 4.1,
      h: 1.45,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });

    s2.addShape(pres.ShapeType.ellipse, {
      x: x + 0.25,
      y: y + 0.25,
      w: 0.65,
      h: 0.65,
      fill: { color: 'FEE2E2' },
      line: { color: 'FCA5A5', width: 0.8 },
    });
    s2.addText(p.icon, {
      x: x + 0.25,
      y: y + 0.25,
      w: 0.65,
      h: 0.65,
      fontSize: 16,
      align: 'center',
      valign: 'middle',
    });

    s2.addText(p.title, {
      x: x + 1.05,
      y: y + 0.2,
      w: 2.85,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.RED_ACCENT,
      valign: 'middle',
    });
    s2.addText(p.desc, {
      x: x + 1.05,
      y: y + 0.55,
      w: 2.85,
      h: 0.75,
      fontSize: 10,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      lineSpacingMultiple: 1.15,
    });
  });

  addSlideFooter(s2, 2, 12);
  s2.addNotes(
    'Bisa kita amati pada slide ini, ada 4 problem utama yang sering dialami warung makan ramai: antrean panjang saat memesan, pesanan makanan yang tertukar karena nota kertas tercecer, program kartu stempel kertas yang tidak efektif, serta proses tutup buku manual yang rawan salah hitung.'
  );
}

// ============================================================================
// SLIDE 3: SOLUSI INOVATIF & FOTO PORTAL PELANGGAN
// ============================================================================
{
  const s3 = pres.addSlide();
  s3.background = { color: COLOR.BG_LIGHT };
  addSlideHeader(s3, 'Solusi Terintegrasi', 'Ekosistem Digital All-in-One Kartika Sari', 'Solusi terpadu dari pemesanan mandiri oleh pelanggan hingga manajemen kasir & toko');

  // Left Side: 4 Pillar Points
  const pillars = [
    {
      num: '01',
      title: 'Customer Self-Ordering',
      desc: 'Pelanggan scan QR di meja, pilih menu, racik topping ekstra, dan pilih bayar tanpa antre.',
    },
    {
      num: '02',
      title: 'Real-Time Order Queue',
      desc: 'Pesanan masuk otomatis ke dapur dengan suara lonceng instan dalam <100ms.',
    },
    {
      num: '03',
      title: 'Digital Loyalty Stamp',
      desc: 'Poin stempel otomatis terisi saat bayar. Cukup sebutkan No. WhatsApp atau nama.',
    },
    {
      num: '04',
      title: 'POS Kasir & Analitik CRM',
      desc: 'Touch POS cepat, segmentasi pembeli (VIP/Reguler/At-Risk), dan ekspor laporan PDF/CSV.',
    },
  ];

  pillars.forEach((p, idx) => {
    const y = 1.6 + idx * 0.85;
    s3.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y,
      w: 4.3,
      h: 0.78,
      rectRadius: 0.08,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });
    s3.addText(p.num, {
      x: 0.95,
      y: y + 0.15,
      w: 0.5,
      h: 0.45,
      fontSize: 16,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.EMERALD,
    });
    s3.addText(p.title, {
      x: 1.5,
      y: y + 0.1,
      w: 3.4,
      h: 0.28,
      fontSize: 11.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });
    s3.addText(p.desc, {
      x: 1.5,
      y: y + 0.38,
      w: 3.5,
      h: 0.35,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLOR.SLATE_MUTED,
    });
  });

  // Right Side: Screenshot Photo of Menu Catalog
  if (fs.existsSync(IMG.MENU_CATALOG)) {
    s3.addShape(pres.ShapeType.roundRect, {
      x: 5.3,
      y: 1.6,
      w: 3.9,
      h: 3.4,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: 'CBD5E1', width: 1 },
    });
    s3.addImage({
      path: IMG.MENU_CATALOG,
      x: 5.4,
      y: 1.7,
      w: 3.7,
      h: 2.8,
    });
    s3.addText('📸 Foto Layar: Katalog Menu Lengkap di HP Pembeli', {
      x: 5.4,
      y: 4.6,
      w: 3.7,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
      align: 'center',
    });
  }

  addSlideFooter(s3, 3, 12);
  s3.addNotes(
    'Seperti terlihat pada foto layar di sebelah kanan, pelanggan disajikan katalog menu Mie Baso Kartika Sari yang sangat bersih, lengkap dengan visual foto mie kuah, mie yamin, pilihan topping, dan tombol tambah porsi yang responsif.'
  );
}

// ============================================================================
// SLIDE 4: ARSITEKTUR ALUR SISTEM REAL-TIME
// ============================================================================
{
  const s4 = pres.addSlide();
  s4.background = { color: COLOR.BG_LIGHT };
  addSlideHeader(s4, 'Arsitektur Sistem', 'Alur Kerja Data Real-Time Tanpa Delay', 'Bagaimana data mengalir instan dari meja pelanggan ke kasir, dapur, dan database cloud');

  const steps = [
    {
      step: 'Langkah 1',
      actor: '📱 Pelanggan di Meja',
      action: 'Scan QR Meja ➡️ Pilih menu & topping ➡️ Checkout (Cash / QRIS).',
    },
    {
      step: 'Langkah 2',
      actor: '⚡ Supabase Cloud Engine',
      action: 'Data pesanan di-broadcast seketika via Realtime WebSockets (<100ms).',
    },
    {
      step: 'Langkah 3',
      actor: '🔔 Kasir & Dapur',
      action: 'Lonceng berbunyi, pesanan diproses, status berubah (Diproses ➡️ Siap).',
    },
    {
      step: 'Langkah 4',
      actor: '🎁 CRM & Pelanggan',
      action: 'Stempel otomatis terisi di HP pelanggan, data tersimpan di laporan omset.',
    },
  ];

  steps.forEach((st, idx) => {
    const x = 0.8 + idx * 2.15;
    const y = 1.95;

    s4.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: 2.05,
      h: 2.35,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: 'CBD5E1', width: 1.2 },
    });

    s4.addShape(pres.ShapeType.roundRect, {
      x: x + 0.2,
      y: y + 0.18,
      w: 1.65,
      h: 0.3,
      rectRadius: 0.06,
      fill: { color: 'DCFCE7' },
      line: { color: COLOR.EMERALD, width: 0.8 },
    });
    s4.addText(st.step, {
      x: x + 0.2,
      y: y + 0.18,
      w: 1.65,
      h: 0.3,
      fontSize: 9.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
      align: 'center',
      valign: 'middle',
    });

    s4.addText(st.actor, {
      x: x + 0.15,
      y: y + 0.6,
      w: 1.75,
      h: 0.45,
      fontSize: 12,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
      align: 'center',
      valign: 'middle',
    });

    s4.addText(st.action, {
      x: x + 0.15,
      y: y + 1.15,
      w: 1.75,
      h: 1.05,
      fontSize: 9.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      align: 'center',
      lineSpacingMultiple: 1.15,
    });

    if (idx < 3) {
      s4.addText('➔', {
        x: x + 2.02,
        y: y + 0.95,
        w: 0.2,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: COLOR.EMERALD,
        align: 'center',
      });
    }
  });

  // Callout Box
  s4.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 4.5,
    w: 8.5,
    h: 0.5,
    rectRadius: 0.08,
    fill: { color: 'FEF3C7' },
    line: { color: COLOR.GOLD, width: 1 },
  });
  s4.addText('💡 Keunggulan Arsitektur: Sinkronisasi 2 arah otomatis (Full-Duplex) tanpa perlu tombol refresh manual.', {
    x: 1.0,
    y: 4.5,
    w: 8.1,
    h: 0.5,
    fontSize: 10,
    fontFace: 'Calibri',
    bold: true,
    color: '92400E',
    valign: 'middle',
  });

  addSlideFooter(s4, 4, 12);
  s4.addNotes(
    'Arsitektur sistem ini menggunakan Supabase Realtime Channels. Jadi ketika pelanggan mengklik pesan di meja, tidak ada jeda antrean data. Kasir dan dapur langsung menerima informasi pesanan secara instan, lengkap dengan preferensi sambal atau kuahnya.'
  );
}

// ============================================================================
// SLIDE 5: FITUR 1 - CUSTOMER SELF-ORDERING (With Real Product Detail Card Photo)
// ============================================================================
{
  const s5 = pres.addSlide();
  s5.background = { color: COLOR.BG_LIGHT };
  addSlideHeader(s5, 'Fitur Unggulan 1', 'Customer Portal & Smart Self-Ordering', 'Pesan praktis dari smartphone pelanggan dengan antarmuka yang intuitif dan cepat');

  // Left Details
  const subfeatures = [
    {
      title: '🎯 Kategori & Porsi Lengkap',
      desc: 'Pilihan porsi Mie Kuah, Yamin Manis, & Yamin Asin (Seporsi, 1/2 Porsi, & Komplit Khusus Garut) dengan visual foto menu.',
    },
    {
      title: '🍲 Kustomisasi Topping Ekstra',
      desc: 'Pelanggan bebas menambah topping favorit: Baso Urat Jumbo, Tetelan Sapi empuk, Babat, Siomay, & Tahu bakso.',
    },
    {
      title: '💳 Pilihan Bayar Fleksibel',
      desc: 'Dukungan bayar via QRIS Digital (lengkap dengan panduan scan QR) maupun bayar tunai di meja kasir.',
    },
    {
      title: '📍 Pelacakan Status Langsung',
      desc: 'Setelah order, layar HP menampilkan status langsung apakah pesanan sedang diracik dapur atau sudah siap diambil.',
    },
  ];

  subfeatures.forEach((sf, idx) => {
    const y = 1.6 + idx * 0.85;
    s5.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y,
      w: 4.8,
      h: 0.78,
      rectRadius: 0.08,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });
    s5.addText(sf.title, {
      x: 1.0,
      y: y + 0.1,
      w: 4.4,
      h: 0.28,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });
    s5.addText(sf.desc, {
      x: 1.0,
      y: y + 0.38,
      w: 4.4,
      h: 0.35,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  // Right Photo: Item Card Detail (Baso Urat photo from user_uploaded)
  if (fs.existsSync(IMG.MENU_ITEM_DETAIL)) {
    s5.addShape(pres.ShapeType.roundRect, {
      x: 5.8,
      y: 1.6,
      w: 3.4,
      h: 3.4,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: 'CBD5E1', width: 1 },
    });
    s5.addImage({
      path: IMG.MENU_ITEM_DETAIL,
      x: 6.0,
      y: 1.7,
      w: 3.0,
      h: 2.8,
    });
    s5.addText('📸 Kartu Menu Topping: Baso Urat Jumbo', {
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

  addSlideFooter(s5, 5, 12);
  s5.addNotes(
    'Pada foto di sebelah kanan, bapak/ibu dapat melihat kartu menu Baso Urat seharga Rp 10.000 dengan ilustrasi mangkok, tag porsi, dan tombol tambah instan. Ini membuktikan bahwa pelanggan dapat meracik sendiri menu favorit mereka secara mudah dari meja.'
  );
}

// ============================================================================
// SLIDE 6: FITUR 2 - ANTREAN PESANAN DAPUR & TOUCH POS (Photos of Both Screens)
// ============================================================================
{
  const s6 = pres.addSlide();
  s6.background = { color: COLOR.BG_LIGHT };
  addSlideHeader(s6, 'Fitur Unggulan 2', 'Antrean Pesanan Real-Time & Touch POS Kasir', 'Kelola alur dapur dan transaksi kasir secara efisien dengan kontrol visual yang jelas');

  // Left Photo: Order Queue Screen
  if (fs.existsSync(IMG.ORDER_QUEUE)) {
    s6.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.55,
      w: 4.15,
      h: 3.5,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });
    s6.addText('📋 Antrean Pesanan Masuk (Order Queue)', {
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
      path: IMG.ORDER_QUEUE,
      x: 0.95,
      y: 2.05,
      w: 3.85,
      h: 1.95,
    });
    s6.addText('• 4 Tab Status: Menunggu Bayar, Diproses, Siap, Selesai\n• Audio Chime: Lonceng bersuara saat ada pesanan baru masuk', {
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

  // Right Photo: Touch POS Screen
  if (fs.existsSync(IMG.TOUCH_POS)) {
    s6.addShape(pres.ShapeType.roundRect, {
      x: 5.15,
      y: 1.55,
      w: 4.15,
      h: 3.5,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });
    s6.addText('⚡ Layar Touch POS Kasir Cepat', {
      x: 5.3,
      y: 1.7,
      w: 3.85,
      h: 0.28,
      fontSize: 11.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });
    s6.addImage({
      path: IMG.TOUCH_POS,
      x: 5.3,
      y: 2.05,
      w: 3.85,
      h: 1.95,
    });
    s6.addText('• Tombol Uang Cepat: Rp 50k, Rp 100k, & Uang Pas otomatis\n• Cetak Struk Rapi & Pencarian transaksi instan', {
      x: 5.3,
      y: 4.1,
      w: 3.85,
      h: 0.85,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      lineSpacingMultiple: 1.15,
    });
  }

  addSlideFooter(s6, 6, 12);
  s6.addNotes(
    'Slide ini memperlihatkan dua layar utama operasional toko: di sebelah kiri adalah Layar Antrean Pesanan Dapur yang otomatis mengelompokkan pesanan baru, sedang diproses, hingga siap diambil. Dan di sebelah kanan adalah Layar Touch POS Kasir dengan tombol nominal uang pas dan hitung kembalian cepat.'
  );
}

// ============================================================================
// SLIDE 7: FITUR 3 - KARTU STEMPEL LOYALITAS (Real Member Card Photos)
// ============================================================================
{
  const s7 = pres.addSlide();
  s7.background = { color: COLOR.BG_LIGHT };
  addSlideHeader(s7, 'Fitur Unggulan 3', 'Kartu Stempel Loyalitas Digital (Digital Stamp Card)', 'Modernisasi program "Beli 10 Porsi Gratis 1" tanpa kartu kertas konvensional');

  // Left Photo: Stamp Card Modal Photo (Muhammad Fanza Yuseftian Member Card)
  if (fs.existsSync(IMG.STAMP_CARD)) {
    s7.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.55,
      w: 4.15,
      h: 3.5,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: 'CBD5E1', width: 1 },
    });
    s7.addText('🍜 Kartu Member Digital (10 Mangkok Mie)', {
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
      path: IMG.STAMP_CARD,
      x: 0.95,
      y: 2.05,
      w: 3.85,
      h: 2.3,
    });
    s7.addText('📸 Foto Layar: Kartu Stempel Muhammad Fanza (08998022630)', {
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

  // Right Photo: Stamp Search Modal Photo
  if (fs.existsSync(IMG.STAMP_SEARCH)) {
    s7.addShape(pres.ShapeType.roundRect, {
      x: 5.15,
      y: 1.55,
      w: 4.15,
      h: 3.5,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: 'CBD5E1', width: 1 },
    });
    s7.addText('🔍 Cara Pelanggan Cek Stempel Kupon', {
      x: 5.3,
      y: 1.7,
      w: 3.85,
      h: 0.28,
      fontSize: 11.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });
    s7.addImage({
      path: IMG.STAMP_SEARCH,
      x: 5.3,
      y: 2.05,
      w: 3.85,
      h: 2.3,
    });
    s7.addText('📸 Cukup masukkan nama / No. WhatsApp, data langsung tersinkron', {
      x: 5.3,
      y: 4.45,
      w: 3.85,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
      align: 'center',
    });
  }

  addSlideFooter(s7, 7, 12);
  s7.addNotes(
    'Slide ini memperlihatkan bukti nyata kartu stempel digital. Pada foto sebelah kanan, pelanggan cukup memasukkan nama atau nomor WhatsApp. Dan pada foto sebelah kiri, langsung muncul kartu member digital dengan animasi 10 mangkok mie. Begitu membeli 1 porsi mie baso, poin stempel langsung bertambah secara real-time.'
  );
}

// ============================================================================
// SLIDE 8: FITUR 4 - CRM CERDAS & PEMBAYARAN DIGITAL (With QRIS Modal Photo)
// ============================================================================
{
  const s8 = pres.addSlide();
  s8.background = { color: COLOR.BG_LIGHT };
  addSlideHeader(s8, 'Fitur Unggulan 4', 'CRM Cerdas & Integrasi Pembayaran QRIS', 'Manajemen hubungan pelanggan berbasis data untuk meningkatkan retensi dan transaksi ulang');

  // Left Side: 4 CRM Segments
  const segments = [
    {
      title: '👑 Segmen VIP',
      desc: 'Pelanggan belanja >5x. Diberikan layanan prioritas & bonus porsi.',
      color: '7C3AED',
    },
    {
      title: '🟢 Segmen Reguler',
      desc: 'Pelanggan setia yang berkunjung rutin setiap minggu.',
      color: COLOR.EMERALD,
    },
    {
      title: '🟡 Pelanggan Baru',
      desc: 'Pelanggan pertama kali order. Disambut bonus stempel perdana.',
      color: COLOR.GOLD,
    },
    {
      title: '🔴 Segmen At-Risk',
      desc: 'Pelanggan tidak datang >30 hari. Ditargetkan promo via WhatsApp.',
      color: COLOR.RED_ACCENT,
    },
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

  addSlideFooter(s8, 8, 12);
  s8.addNotes(
    'Di sisi CRM, sistem secara otomatis mengelompokkan pelanggan ke dalam 4 segmen: VIP, Reguler, Baru, dan At-Risk. Dan pada foto sebelah kanan, pelanggan juga disajikan modal pembayaran digital QRIS resmi Kartika Sari Garut yang langsung dapat discan dengan semua e-wallet.'
  );
}

// ============================================================================
// SLIDE 9: FITUR 5 - LAPORAN OMSET & EKSPOR DATA (PDF & CSV)
// ============================================================================
{
  const s9 = pres.addSlide();
  s9.background = { color: COLOR.BG_LIGHT };
  addSlideHeader(s9, 'Fitur Unggulan 5', 'Laporan Penjualan & Analitik Toko Lengkap', 'Keputusan bisnis berbasis data akurat dengan kemampuan ekspor data siap cetak');

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
  s9.addText('📈 Metrik Finansial Otomatis', {
    x: 1.05,
    y: 1.85,
    w: 3.6,
    h: 0.32,
    fontSize: 13,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const metrics = [
    { title: 'Total Omset Bersih', desc: 'Terhitung otomatis dari transaksi lunas terverifikasi' },
    { title: 'Rata-rata Belanja (Basket Size)', desc: 'Indikator keberhasilan upselling topping ekstra' },
    { title: 'Porsi Terjual', desc: 'Rincian porsi mie kuah, yamin manis, & yamin asin' },
    { title: 'Menu Terlaris (Best Seller)', desc: 'Membantu persiapan stok bahan baku baso harian' },
  ];
  metrics.forEach((m, idx) => {
    s9.addText(`• ${m.title}`, {
      x: 1.05,
      y: 2.25 + idx * 0.65,
      w: 3.6,
      h: 0.28,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });
    s9.addText(m.desc, {
      x: 1.25,
      y: 2.53 + idx * 0.65,
      w: 3.4,
      h: 0.32,
      fontSize: 9,
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
  s9.addText('📊 Fitur Ekspor Data Profesional', {
    x: 5.4,
    y: 1.85,
    w: 3.65,
    h: 0.32,
    fontSize: 13,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const exports = [
    {
      badge: '📊 Export CSV / Excel',
      detail: 'Diformat dengan standar UTF-8 BOM, angka desimal dan rupiah langsung rapi dibuka di Microsoft Excel tanpa teks error.',
    },
    {
      badge: '📄 Export PDF A4 Resmi',
      detail: 'Dokumen A4 siap cetak lengkap dengan kop Mie Baso Kartika Sari, rincian pembayaran tunai vs QRIS, dan kolom pengesahan owner.',
    },
    {
      badge: '🔒 Filter Rentang Tanggal',
      detail: 'Fleksibilitas memilih laporan per hari ini, 7 hari terakhir, 30 hari, atau periode pembukuan bulanan kustom.',
    },
  ];
  exports.forEach((ex, idx) => {
    s9.addText(ex.badge, {
      x: 5.4,
      y: 2.25 + idx * 0.85,
      w: 3.65,
      h: 0.28,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.GOLD,
    });
    s9.addText(ex.detail, {
      x: 5.4,
      y: 2.53 + idx * 0.85,
      w: 3.65,
      h: 0.52,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      lineSpacingMultiple: 1.15,
    });
  });

  addSlideFooter(s9, 9, 12);
  s9.addNotes(
    'Untuk kebutuhan audit dan rekapitulasi, aplikasi menyediakan dua tombol ekspor unggulan: Export CSV untuk diolah di Microsoft Excel, dan Export PDF untuk dokumen siap cetak A4 berstempel resmi Kartika Sari.'
  );
}

// ============================================================================
// SLIDE 10: KEUNGGULAN TEKNIS & KEANDALAN SISTEM
// ============================================================================
{
  const s10 = pres.addSlide();
  s10.background = { color: COLOR.BG_LIGHT };
  addSlideHeader(s10, 'Teknologi & Keandalan', 'Spesifikasi Teknis & Jaminan Zero-Downtime', 'Dibangun dengan standar pengembangan perangkat lunak modern, aman, dan tahan banting');

  const techSpecs = [
    {
      title: '⚛️ React 18 & TypeScript',
      desc: 'Frontend modern ultra-cepat dengan ketahanan tipe data (type-safety) tinggi, mencegah bug pada saat pemrosesan nominal uang.',
    },
    {
      title: '⚡ Supabase Cloud Realtime',
      desc: 'PostgreSQL Cloud dengan WebSocket push notification instan (<100ms latency) antara HP pelanggan, kasir, dan dapur.',
    },
    {
      title: '💾 Offline-First IndexedDB',
      desc: 'Jaminan Zero-Downtime: kasir tetap dapat menerima pesanan dan mencetak struk meskipun koneksi internet lokal sempat terputus.',
    },
    {
      title: '🧪 277 Automated Tests (100% Pass)',
      desc: 'Telah teruji dengan 24 test file mencakup stress test antrean ganda, formatting nomor telepon 08/62, dan validasi matematis kasir.',
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
      fontSize: 12.5,
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

  addSlideFooter(s10, 10, 12);
  s10.addNotes(
    'Aplikasi ini didukung fondasi teknis yang kuat: React 18, TypeScript, Supabase Realtime, dan IndexedDB untuk kemampuan offline-first. Keseluruhan sistem telah divalidasi dengan 277 automated unit & stress tests yang lulus 100%.'
  );
}

// ============================================================================
// SLIDE 11: DAMPAK BISNIS (SEBELUM VS SESUDAH)
// ============================================================================
{
  const s11 = pres.addSlide();
  s11.background = { color: COLOR.BG_LIGHT };
  addSlideHeader(s11, 'Evaluasi Bisnis', 'Dampak Nyata: Sebelum vs Sesudah Menggunakan Aplikasi', 'Peningkatan efisiensi waktu, kepuasan pembeli, dan akurasi keuangan restoran');

  const tableHeaders = [
    { text: 'Aspek Operasional', options: { bold: true, fill: '143823', color: 'FFFFFF', align: 'left', fontSize: 11 } },
    { text: 'Sebelum (Manual / Kertas)', options: { bold: true, fill: 'DC2626', color: 'FFFFFF', align: 'left', fontSize: 11 } },
    { text: 'Sesudah (Ekosistem Digital)', options: { bold: true, fill: '059669', color: 'FFFFFF', align: 'left', fontSize: 11 } },
  ];

  const tableRows = [
    [
      { text: 'Waktu Antre Pesan', options: { bold: true } },
      { text: '5 - 10 menit antre di kasir' },
      { text: '< 1 menit (pesan mandiri dari meja)', options: { bold: true, color: '059669' } },
    ],
    [
      { text: 'Akurasi Pesanan Dapur', options: { bold: true } },
      { text: 'Salah dengar / nota hilang (10-15%)' },
      { text: 'Akurasi 99.9% tercatat digital', options: { bold: true, color: '059669' } },
    ],
    [
      { text: 'Kartu Stempel Loyalitas', options: { bold: true } },
      { text: 'Sering hilang / ketinggalan dompet' },
      { text: 'Tersimpan di nomor WA & realtime', options: { bold: true, color: '059669' } },
    ],
    [
      { text: 'Waktu Tutup Buku Toko', options: { bold: true } },
      { text: '45 - 60 menit hitung bon manual' },
      { text: '1 detik (Sekali klik PDF / CSV)', options: { bold: true, color: '059669' } },
    ],
    [
      { text: 'Pengenalan Pelanggan', options: { bold: true } },
      { text: 'Tidak ada data sama sekali' },
      { text: 'Database CRM (VIP, Reguler, Baru)', options: { bold: true, color: '059669' } },
    ],
  ];

  s11.addTable([tableHeaders, ...tableRows], {
    x: 0.8,
    y: 1.75,
    w: 8.5,
    h: 3.15,
    colW: [2.5, 3.0, 3.0],
    fontSize: 10,
    fontFace: 'Calibri',
    border: { pt: 1, color: 'CBD5E1' },
    valign: 'middle',
  });

  addSlideFooter(s11, 11, 12);
  s11.addNotes(
    'Tabel evaluasi bisnis ini merangkum lonjakan efisiensi operasional warung: waktu antre terpangkas drastis, salah pesanan dihilangkan, partisipasi kartu stempel meningkat, dan laporan omset harian siap dalam hitungan detik.'
  );
}

// ============================================================================
// SLIDE 12: KESIMPULAN & PENUTUP (With Brand Logo)
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
    w: 2.3,
    h: 0.35,
    rectRadius: 0.17,
    fill: { color: '1E5434' },
    line: { color: COLOR.GOLD, width: 1.2 },
  });
  s12.addText('KESIMPULAN & DEMO', {
    x: 2.0,
    y: 0.95,
    w: 2.3,
    h: 0.35,
    fontSize: 9.5,
    fontFace: 'Calibri',
    bold: true,
    color: 'FDE68A',
    align: 'center',
    valign: 'middle',
  });

  s12.addText('Siap Mewujudkan Kuliner Garut\nMenjadi Bisnis Modern Berdaya Saing', {
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
    h: 1.4,
    rectRadius: 0.12,
    fill: { color: '18432A' },
    line: { color: '2E7D4E', width: 1 },
  });

  const takeaways = [
    '✓ Solusi Lengkap: Menggabungkan Self-Ordering Meja, Touch POS, Loyalitas Stempel, & Laporan Keuangan.',
    '✓ Tanpa Investasi Alat Mahal: Cukup menggunakan smartphone dan laptop/tablet yang sudah dimiliki toko.',
    '✓ Sudah Live & Teruji Produksi: Siap digunakan langsung di outlet Mie Baso Kartika Sari Garut.',
  ];
  takeaways.forEach((tk, idx) => {
    s12.addText(tk, {
      x: 1.15,
      y: 3.1 + idx * 0.4,
      w: 7.7,
      h: 0.32,
      fontSize: 10.5,
      fontFace: 'Calibri',
      color: 'E2E8F0',
      valign: 'middle',
    });
  });

  s12.addText('🔗 Akses Live Aplikasi: https://kartikasari-pos-crm.vercel.app', {
    x: 0.9,
    y: 4.6,
    w: 8.2,
    h: 0.3,
    fontSize: 11.5,
    fontFace: 'Calibri',
    bold: true,
    color: 'FBBF24',
  });
  s12.addText('Terima Kasih • Sesi Tanya Jawab (Q&A) Dibuka', {
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
    'Demikian presentasi dari saya. Melalui aplikasi ini, kami membuktikan bahwa UMKM kuliner legendaris Garut seperti Mie Baso Kartika Sari dapat mengadopsi teknologi kelas enterprise tanpa biaya perangkat keras yang mahal. Aplikasi ini sudah live di internet dan siap didemonstrasikan. Terima kasih, saya persilakan jika ada pertanyaan dari bapak/ibu sekalian.'
  );
}

// Generate the PPTX File
const outputPath = path.resolve(__dirname, '../Presentasi_Mie_Baso_Kartika_Sari.pptx');
pres
  .writeFile({ fileName: outputPath })
  .then(() => {
    console.log('✅ File presentasi PPTX dengan FOTO ASLI berhasil dibuat di:', outputPath);
  })
  .catch((err) => {
    console.error('❌ Gagal membuat PPTX:', err);
    process.exit(1);
  });
