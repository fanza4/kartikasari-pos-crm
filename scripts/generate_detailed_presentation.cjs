const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');
const JSZip = require('jszip');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches (widescreen)
pres.title = 'Presentasi Komprehensif Ekosistem POS & CRM Mie Baso Kartika Sari Garut';
pres.author = 'Muhammad Fanza Yuseftian';
pres.company = 'Mie Baso & Aneka Jus Kartika Sari Garut';

// Brand Color Palette (hex without #)
const COLOR = {
  FOREST_DARK: '143823',
  FOREST_MID: '166534',
  EMERALD: '059669',
  GOLD: 'D97706',
  GOLD_LIGHT: 'FEF3C7',
  GOLD_BG: 'FFFBEB',
  SLATE_DARK: '0F172A',
  SLATE_TEXT: '334155',
  SLATE_MUTED: '64748B',
  BG_LIGHT: 'F8FAFC',
  CARD_BG: 'FFFFFF',
  CARD_BORDER: 'E2E8F0',
  WHITE: 'FFFFFF',
  RED_ACCENT: 'DC2626',
  BLUE_ACCENT: '2563EB',
  PURPLE_ACCENT: '7C3AED',
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

const TOTAL_SLIDES = 21;

// Helper: Common slide header
function addHeader(slide, category, title, subtitle) {
  // Category Pill Badge
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 0.32,
    w: 2.5,
    h: 0.28,
    rectRadius: 0.14,
    fill: { color: COLOR.GOLD_LIGHT },
    line: { color: COLOR.GOLD, width: 1 },
  });
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.32,
    w: 2.5,
    h: 0.28,
    fontSize: 8.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.GOLD,
    align: 'center',
    valign: 'middle',
  });

  // Main Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.65,
    w: 8.4,
    h: 0.45,
    fontSize: 20,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
    valign: 'middle',
  });

  // Slide Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8,
      y: 1.1,
      w: 8.4,
      h: 0.26,
      fontSize: 10,
      fontFace: 'Calibri',
      color: COLOR.SLATE_MUTED,
      valign: 'top',
    });
  }
}

// Helper: Common slide footer
function addFooter(slide, currentSlide) {
  slide.addText('Mie Baso & Aneka Jus Kartika Sari Garut • Solusi Digital POS, Self-Ordering & CRM Terpadu', {
    x: 0.8,
    y: 5.25,
    w: 7.2,
    h: 0.25,
    fontSize: 8,
    fontFace: 'Calibri',
    color: COLOR.SLATE_MUTED,
    valign: 'middle',
  });
  slide.addText(`${currentSlide} / ${TOTAL_SLIDES}`, {
    x: 8.2,
    y: 5.25,
    w: 1.0,
    h: 0.25,
    fontSize: 8.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.GOLD,
    align: 'right',
    valign: 'middle',
  });
}

// ==========================================
// SLIDE 1: COVER & EXECUTIVE OVERVIEW
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.FOREST_DARK };

  // Decorative Accent Bar
  s.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.25,
    h: 5.625,
    fill: { color: COLOR.GOLD },
    line: { color: COLOR.GOLD },
  });

  // Brand Logo
  if (fs.existsSync(IMG.LOGO)) {
    s.addImage({
      path: IMG.LOGO,
      x: 0.9,
      y: 0.6,
      w: 1.25,
      h: 1.25,
      rounding: true,
    });
  }

  // Pill Status
  s.addShape(pres.ShapeType.roundRect, {
    x: 2.35,
    y: 0.65,
    w: 3.4,
    h: 0.32,
    rectRadius: 0.16,
    fill: { color: COLOR.FOREST_MID },
    line: { color: COLOR.GOLD, width: 1 },
  });
  s.addText('TRANSFORMASI DIGITAL UMKM KULINER • LIVE PRODUCTION', {
    x: 2.35,
    y: 0.65,
    w: 3.4,
    h: 0.32,
    fontSize: 8,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.GOLD_LIGHT,
    align: 'center',
    valign: 'middle',
  });

  // Main Titles
  s.addText('Sistem POS Kasir, QR Self-Ordering\n& CRM Loyalitas Stempel Real-Time', {
    x: 2.35,
    y: 1.05,
    w: 6.8,
    h: 0.95,
    fontSize: 23,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.WHITE,
    valign: 'top',
  });

  s.addText('Studi Kasus & Implementasi Produksi: Rumah Makan Mie Baso & Aneka Jus Kartika Sari Garut\nJl. Otista No. 127 Paseban, Garut, Jawa Barat', {
    x: 2.35,
    y: 2.05,
    w: 6.8,
    h: 0.5,
    fontSize: 10.5,
    fontFace: 'Calibri',
    color: 'CBD5E1',
    valign: 'top',
  });

  // Highlight Feature Cards (3 Pillars)
  const pillars = [
    { title: '⚡ Real-Time WebSocket', desc: 'Latency <100ms antara meja pelanggan, dapur, dan kasir.' },
    { title: '🎁 Digital Loyalty Stamp', desc: 'Akumulasi stempel otomatis (10 porsi = 1 porsi mie gratis).' },
    { title: '📊 Analitik & Ekspor Laporan', desc: 'Rekap omset instan dengan ekspor PDF A4 resmi dan CSV/Excel.' },
  ];
  pillars.forEach((p, idx) => {
    const xPos = 0.9 + idx * 2.75;
    s.addShape(pres.ShapeType.roundRect, {
      x: xPos,
      y: 2.75,
      w: 2.6,
      h: 1.25,
      rectRadius: 0.12,
      fill: { color: '1A4D31' },
      line: { color: '2D6A4F', width: 1 },
    });
    s.addText(p.title, {
      x: xPos + 0.15,
      y: 2.85,
      w: 2.3,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.GOLD_LIGHT,
      valign: 'top',
    });
    s.addText(p.desc, {
      x: xPos + 0.15,
      y: 3.2,
      w: 2.3,
      h: 0.7,
      fontSize: 9,
      fontFace: 'Calibri',
      color: 'E2E8F0',
      valign: 'top',
    });
  });

  // Footer Metadata Box
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.9,
    y: 4.25,
    w: 8.2,
    h: 0.85,
    rectRadius: 0.1,
    fill: { color: '0D2417' },
    line: { color: COLOR.GOLD, width: 1 },
  });
  s.addText('👤 Presenter & System Developer: Muhammad Fanza Yuseftian   •   Versi Aplikasi: 2.1.0 (Production Stable)\n🌐 Akses Live Vercel: https://kartikasari-pos-crm.vercel.app   •   Stack: React 18, TypeScript, Supabase PostgreSQL, PWA', {
    x: 1.1,
    y: 4.35,
    w: 7.8,
    h: 0.65,
    fontSize: 9.5,
    fontFace: 'Calibri',
    color: COLOR.WHITE,
    valign: 'middle',
  });

  s.addNotes(
    'Selamat pagi rekan-rekan dan bapak/ibu sekalian. Pada kesempatan kali ini, saya Muhammad Fanza Yuseftian dengan bangga mempersembahkan proyek implementasi teknologi digital menyeluruh untuk UMKM kuliner di Garut, yaitu Sistem POS, Self-Ordering via QR Meja, dan CRM Loyalitas Stempel Real-Time untuk Rumah Makan Mie Baso & Aneka Jus Kartika Sari Garut. Aplikasi ini sudah berstatus live production di Vercel dan Supabase, dirancang khusus untuk memodernisasi alur bisnis kuliner tradisional menjadi efisien, berbasis data, dan meningkatkan retensi pelanggan secara terukur.'
  );
}

// ==========================================
// SLIDE 2: PROFIL USAHA & KARAKTERISTIK OPERASIONAL
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Profil Bisnis & Operasional', 'Mengenal Karakteristik Rumah Makan Mie Baso Kartika Sari', 'Karakteristik operasional harian, variasi menu kuliner Garut, dan pola interaksi pelanggan');

  // Left Column: Business Profile Cards
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 4.4,
    h: 1.65,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });
  s.addText('🍜 Identitas Kuliner Otentik Garut', {
    x: 1.0,
    y: 1.6,
    w: 4.0,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });
  s.addText('• Berlokasi strategis di Jl. Otista No. 127 Paseban, Garut.\n• Menu spesialisasi: Mie Kuah Kaldu Sapi Asli, Yamin Manis, & Yamin Asin khas Priangan Timur.\n• Topping khas: Baso Urat Jumbo bertekstur mantap, Tetelan Sapi, Babat, Siomay, & Tahu Bakso.\n• Minuman pelengkap: Aneka Jus Buah Segar dan Es Jeruk Peras murni.', {
    x: 1.0,
    y: 1.95,
    w: 4.0,
    h: 1.05,
    fontSize: 9.5,
    fontFace: 'Calibri',
    color: COLOR.SLATE_TEXT,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 3.25,
    w: 4.4,
    h: 1.85,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });
  s.addText('⏱️ Pola Volume & Karakteristik Transaksi', {
    x: 1.0,
    y: 3.4,
    w: 4.0,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });
  s.addText('• Jam Sibuk (Rush Hour): Puncak makan siang (11:30 - 14:00) dan malam (18:00 - 20:30).\n• Volume Harian: Rata-rata 150 - 300 porsi per hari pada hari kerja, melonjak 2x lipat saat akhir pekan.\n• Kustomisasi Tinggi: 80% pelanggan meminta penyesuaian porsi (1/2 porsi, seporsi komplit) dan racikan kuah/yamin.\n• Model Layanan: Gabungan antara makan di tempat (Dine-in 70%) dan bungkus/bawa pulang (Takeaway 30%).', {
    x: 1.0,
    y: 3.75,
    w: 4.0,
    h: 1.25,
    fontSize: 9.5,
    fontFace: 'Calibri',
    color: COLOR.SLATE_TEXT,
  });

  // Right Column: Summary Stat Box
  s.addShape(pres.ShapeType.roundRect, {
    x: 5.4,
    y: 1.45,
    w: 3.8,
    h: 3.65,
    rectRadius: 0.12,
    fill: { color: COLOR.GOLD_BG },
    line: { color: COLOR.GOLD, width: 1 },
  });
  s.addText('🎯 Mengapa Membutuhkan Sistem Khusus?', {
    x: 5.6,
    y: 1.65,
    w: 3.4,
    h: 0.35,
    fontSize: 13,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.GOLD,
  });
  const reasons = [
    { num: '01', title: 'Kompleksitas Racikan Menu', desc: 'Bukan sekadar pesan menu jadi, pelanggan bebas mix-and-match kuah, yamin, dan ragam topping ekstra.' },
    { num: '02', title: 'Kecepatan Sajian Adalah Kunci', desc: 'Pelanggan kuliner bakso menuntut makanan disajikan hangat dalam <5 menit setelah dipesan.' },
    { num: '03', title: 'Tingkat Loyalitas Tinggi', desc: 'Pelanggan lokal Garut memiliki loyalitas tinggi, membutuhkan program stempel yang mudah diakses tanpa ribet.' },
  ];
  reasons.forEach((r, idx) => {
    const yP = 2.15 + idx * 0.95;
    s.addText(r.num, {
      x: 5.6,
      y: yP,
      w: 0.45,
      h: 0.3,
      fontSize: 14,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });
    s.addText(r.title, {
      x: 6.1,
      y: yP,
      w: 2.9,
      h: 0.25,
      fontSize: 10.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });
    s.addText(r.desc, {
      x: 6.1,
      y: yP + 0.25,
      w: 2.9,
      h: 0.55,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  addFooter(s, 2);
  s.addNotes(
    'Sebelum kita masuk ke fitur teknis, penting untuk memahami karakteristik operasional Mie Baso Kartika Sari Garut. Rumah makan ini berlokasi di Jalan Otista Garut dan memiliki volume pesanan yang sangat padat saat jam makan siang dan akhir pekan. Karakteristik khas warung mie baso adalah tingkat kustomisasi yang sangat tinggi: pelanggan bisa memesan porsi penuh, setengah porsi, kuah dipisah, yamin manis atau asin, hingga menambah topping seperti baso urat jumbo seharga 10 ribu atau es jeruk seharga 15 ribu. Kecepatan penyajian hangat dan akurasi racikan adalah kunci kepuasan pelanggan di sini.'
  );
}

// ==========================================
// SLIDE 3: PROBLEM STATEMENT (4 TITIK KRITIS)
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Problem Statement', '4 Titik Kritis Kegagalan Operasional Konvensional', 'Analisis kendala nyata yang dialami kasir, juru masak dapur, dan owner sebelum digitalisasi');

  const problems = [
    {
      icon: '⏳',
      title: 'Antrean Kasir Mengular (Bottleneck)',
      points: [
        'Pelanggan harus antre 5-10 menit di meja kasir hanya untuk memesan dan membayar.',
        'Meja kasir menjadi sesak dan menghalangi pintu masuk saat jam makan siang.',
        'Potensi pelanggan berbalik pergi (lost customers) karena enggan mengantre lama.',
      ],
      color: COLOR.RED_ACCENT,
    },
    {
      icon: '📝',
      title: 'Pesanan Dapur Tertukar & Nota Hilang',
      points: [
        'Pelayan mencatat pesanan di kertas bon kecil yang sering tercecer di area kompor.',
        'Tulisan tangan kasir/pelayan terburu-buru sering salah dibaca oleh juru racik dapur.',
        'Kesalahan penyajian porsi (yamin tertukar kuah) memicu komplain pelanggan.',
      ],
      color: COLOR.GOLD,
    },
    {
      icon: '🏷️',
      title: 'Kupon Stempel Kertas Tidak Efektif',
      points: [
        'Program promo "Beli 10 Gratis 1" menggunakan kartu stempel fisik sering ditinggal di rumah.',
        'Kartu kertas mudah sobek, basah oleh kuah baso, atau hilang dari dompet pembeli.',
        'Kasir kesulitan memvalidasi keaslian stempel dan histori riwayat pelanggan.',
      ],
      color: COLOR.BLUE_ACCENT,
    },
    {
      icon: '📒',
      title: 'Tutup Buku Kasir Lambat & Rawan Selisih',
      points: [
        'Proses rekapitulasi penjualan harian memakan waktu 45-60 menit setiap malam.',
        'Menghitung nota kertas secara manual rawan selisih uang tunai dan kebocoran kas.',
        'Owner tidak memiliki visibilitas data omset riil dan produk terlaris secara realtime.',
      ],
      color: COLOR.PURPLE_ACCENT,
    },
  ];

  problems.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xP = 0.8 + col * 4.3;
    const yP = 1.45 + row * 1.8;

    s.addShape(pres.ShapeType.roundRect, {
      x: xP,
      y: yP,
      w: 4.1,
      h: 1.65,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });

    s.addText(`${p.icon}  ${p.title}`, {
      x: xP + 0.2,
      y: yP + 0.15,
      w: 3.7,
      h: 0.3,
      fontSize: 11.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });

    const bodyText = p.points.map((pt) => `• ${pt}`).join('\n');
    s.addText(bodyText, {
      x: xP + 0.2,
      y: yP + 0.5,
      w: 3.7,
      h: 1.05,
      fontSize: 8.8,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      valign: 'top',
    });
  });

  addFooter(s, 3);
  s.addNotes(
    'Mari kita bedah 4 titik kritis yang menjadi latar belakang masalah. Pertama, antrean kasir: saat jam ramai, pelanggan menumpuk di depan meja kasir dan antre hingga 10 menit hanya untuk order. Kedua, di bagian dapur, nota kertas pesanan sering basah, hilang di dekat kompor, atau tulisan tangannya tidak terbaca, sehingga pesanan kuah dan yamin sering tertukar. Ketiga, program loyalitas tradisional dengan kartu kertas gagal berfungsi karena pelanggan sering lupa bawa kartu atau kartunya rusak di dompet. Terakhir, di akhir hari, owner dan kasir harus menghabiskan hampir 1 jam untuk menghitung tumpukan bon manual, dengan risiko selisih kas.'
  );
}

// ==========================================
// SLIDE 4: VISI SOLUSI ALL-IN-ONE
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Solusi Terintegrasi', 'Ekosistem Digital All-in-One Mie Baso Kartika Sari', 'Solusi digital terpadu 4-in-1 yang menghubungkan pelanggan, kasir, dapur, dan manajemen');

  const modules = [
    {
      num: '01',
      title: 'Customer Self-Ordering',
      sub: 'Pesan Mandiri dari Meja',
      desc: 'Pelanggan cukup scan QR meja, memilih menu, kustomisasi topping, dan bayar tanpa perlu mengantre ke kasir.',
      tag: 'Akses Instan Tanpa Install',
    },
    {
      num: '02',
      title: 'Kitchen Order Queue',
      sub: 'Antrean Dapur Real-Time',
      desc: 'Pesanan masuk otomatis ke layar dapur dalam waktu <100ms disertai audio chime, bebas dari risiko nota hilang.',
      tag: 'WebSocket Push <100ms',
    },
    {
      num: '03',
      title: 'Digital Loyalty Stamp',
      sub: 'Gamifikasi Stempel Poin',
      desc: 'Poin stempel bertambah otomatis sesuai jumlah porsi mie. Cukup masukkan nomor WhatsApp atau nama pelanggan.',
      tag: '10 Stempel = 1 Porsi Gratis',
    },
    {
      num: '04',
      title: 'Touch POS & Finansial',
      sub: 'Kasir Cepat & Rekap Otomatis',
      desc: 'Kasir layar sentuh dengan shortcut uang pas, kalkulator kembalian, cetak struk, dan ekspor laporan PDF/CSV instan.',
      tag: 'Tutup Buku 1-Klik',
    },
  ];

  modules.forEach((m, idx) => {
    const xP = 0.8 + idx * 2.15;
    s.addShape(pres.ShapeType.roundRect, {
      x: xP,
      y: 1.45,
      w: 2.05,
      h: 3.65,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });

    // Number Badge
    s.addShape(pres.ShapeType.roundRect, {
      x: xP + 0.15,
      y: 1.6,
      w: 0.5,
      h: 0.35,
      rectRadius: 0.08,
      fill: { color: COLOR.FOREST_DARK },
      line: { color: COLOR.FOREST_DARK },
    });
    s.addText(m.num, {
      x: xP + 0.15,
      y: 1.6,
      w: 0.5,
      h: 0.35,
      fontSize: 12,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.WHITE,
      align: 'center',
      valign: 'middle',
    });

    s.addText(m.title, {
      x: xP + 0.15,
      y: 2.05,
      w: 1.75,
      h: 0.45,
      fontSize: 11.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
      valign: 'top',
    });

    s.addText(m.sub, {
      x: xP + 0.15,
      y: 2.5,
      w: 1.75,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.GOLD,
      valign: 'top',
    });

    s.addText(m.desc, {
      x: xP + 0.15,
      y: 2.8,
      w: 1.75,
      h: 1.55,
      fontSize: 8.8,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      valign: 'top',
    });

    // Tag at bottom
    s.addShape(pres.ShapeType.roundRect, {
      x: xP + 0.12,
      y: 4.45,
      w: 1.8,
      h: 0.45,
      rectRadius: 0.08,
      fill: { color: COLOR.GOLD_LIGHT },
      line: { color: COLOR.GOLD, width: 1 },
    });
    s.addText(m.tag, {
      x: xP + 0.15,
      y: 4.45,
      w: 1.75,
      h: 0.45,
      fontSize: 8,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.GOLD,
      align: 'center',
      valign: 'middle',
    });
  });

  addFooter(s, 4);
  s.addNotes(
    'Untuk menyelesaikan masalah tersebut, kami merancang Ekosistem Digital All-in-One yang menghubungkan seluruh aspek operasional rumah makan. Ada empat pilar utama: Pertama, Customer Self-Ordering di mana pembeli bisa langsung memesan dari meja. Kedua, Kitchen Order Queue yang menampilkan pesanan di dapur secara real-time. Ketiga, Digital Loyalty Stamp yang mendigitalkan kartu stempel tanpa kertas. Dan keempat, Touch POS Kasir Cepat dengan ekspor laporan finansial otomatis. Sistem ini tidak memerlukan investasi hardware mahal, kasir dan koki cukup menggunakan tablet atau smartphone yang ada.'
  );
}

// ==========================================
// SLIDE 5: ARSITEKTUR REAL-TIME FULL-DUPLEX
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Arsitektur Sistem & Data', 'Alur Kerja Sinkronisasi Data Real-Time Tanpa Delay', 'Infrastruktur komunikasi dua arah (Full-Duplex) berkecepatan tinggi dengan Supabase WebSocket');

  const steps = [
    {
      step: 'Langkah 1',
      actor: '📱 Pelanggan di Meja',
      action: 'Scan QR di meja -> Pilih varian mie & racik topping ekstra -> Pilih pembayaran Tunai atau QRIS -> Submit Order.',
      color: COLOR.FOREST_DARK,
    },
    {
      step: 'Langkah 2',
      actor: '⚡ Supabase Cloud Engine',
      action: 'Data pesanan disimpan ke tabel PostgreSQL "orders" & di-broadcast seketika via Realtime WebSocket (<100ms).',
      color: COLOR.GOLD,
    },
    {
      step: 'Langkah 3',
      actor: '🔔 Kasir & Dapur (KDS)',
      action: 'Lonceng audio chime berbunyi di dapur, kartu pesanan muncul instan. Koki mengubah status "Diproses" -> "Siap Diambil".',
      color: COLOR.EMERALD,
    },
    {
      step: 'Langkah 4',
      actor: '🎁 CRM & Buku Finansial',
      action: 'Stempel otomatis bertambah di profil pelanggan. Data masuk ke laporan omset harian dan pembukuan toko.',
      color: COLOR.BLUE_ACCENT,
    },
  ];

  steps.forEach((st, idx) => {
    const xP = 0.8 + idx * 2.15;
    s.addShape(pres.ShapeType.roundRect, {
      x: xP,
      y: 1.5,
      w: 2.05,
      h: 2.5,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: xP + 0.15,
      y: 1.65,
      w: 1.75,
      h: 0.28,
      rectRadius: 0.14,
      fill: { color: COLOR.GOLD_LIGHT },
      line: { color: COLOR.GOLD, width: 1 },
    });
    s.addText(st.step, {
      x: xP + 0.15,
      y: 1.65,
      w: 1.75,
      h: 0.28,
      fontSize: 8.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.GOLD,
      align: 'center',
      valign: 'middle',
    });

    s.addText(st.actor, {
      x: xP + 0.15,
      y: 2.05,
      w: 1.75,
      h: 0.45,
      fontSize: 10.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
      valign: 'top',
    });

    s.addText(st.action, {
      x: xP + 0.15,
      y: 2.55,
      w: 1.75,
      h: 1.35,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      valign: 'top',
    });
  });

  // Technical Highlights Callout Box
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 4.15,
    w: 8.4,
    h: 0.95,
    rectRadius: 0.1,
    fill: { color: COLOR.FOREST_DARK },
    line: { color: COLOR.FOREST_DARK },
  });
  s.addText('💡 Keunggulan Arsitektur: Zero-Polling & Full-Duplex Synchronization', {
    x: 1.0,
    y: 4.25,
    w: 8.0,
    h: 0.28,
    fontSize: 11,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.GOLD_LIGHT,
  });
  s.addText('Berbeda dengan aplikasi konvensional yang mengandalkan tombol "Refresh" manual atau polling interval berkala yang memboroskan kuota data, sistem ini memanfaatkan koneksi WebSocket persisten (Supabase Realtime). Saat kasir mengubah status pesanan atau pelanggan menekan checkout, perubahan terpantau dalam <100 milidetik di semua perangkat secara instan.', {
    x: 1.0,
    y: 4.52,
    w: 8.0,
    h: 0.52,
    fontSize: 8.5,
    fontFace: 'Calibri',
    color: 'E2E8F0',
  });

  addFooter(s, 5);
  s.addNotes(
    'Slide ini memperlihatkan arsitektur komunikasi data. Alur datanya adalah: Pelanggan scan QR dan pesan -> masuk ke Supabase Cloud Engine -> diteruskan via WebSocket ke Kasir dan Dapur dalam waktu kurang dari 100 milidetik -> setelah selesai, CRM langsung mengupdate stempel dan laporan keuangan. Keunggulan arsitektur ini adalah sistem full-duplex tanpa refresh manual, sehingga koki di dapur langsung mendengar lonceng dan melihat pesanan baru tanpa delay sama sekali.'
  );
}

// ==========================================
// SLIDE 6: CUSTOMER SELF-ORDERING (PORTAL HERO)
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 1: Self-Ordering Meja', 'Customer Portal: Kemudahan Pesan Tanpa Mengunduh Aplikasi', 'Pengalaman pemesanan mandiri yang cepat, nyaman, dan higienis langsung dari meja makan');

  // Left Details
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 4.4,
    h: 3.65,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });

  s.addText('📱 Pengalaman Pengguna Berbasis PWA Modern', {
    x: 1.0,
    y: 1.65,
    w: 4.0,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const portalPoints = [
    { title: 'Zero Friction (Tanpa Download)', desc: 'Cukup arahkan kamera smartphone ke QR Code meja, halaman web app langsung terbuka dalam <1 detik.' },
    { title: 'Identitas Meja Tersemat Otomatis', desc: 'Sistem mengenali nomor meja secara otomatis (misal Meja #03), mencegah pesanan salah antar meja.' },
    { title: 'Pintasan Menu Terstruktur', desc: 'Tersedia tombol pintas kategori cepat, cek kartu stempel loyalty, serta informasi kontak dan lokasi kedai.' },
    { title: 'Desain Responsif & Ramah Pengguna', desc: 'Dioptimalkan untuk semua ukuran layar smartphone Android & iPhone dengan antarmuka yang bersih dan mudah dipahami.' },
  ];

  portalPoints.forEach((p, idx) => {
    const yP = 2.05 + idx * 0.72;
    s.addText(`✓  ${p.title}`, {
      x: 1.0,
      y: yP,
      w: 4.0,
      h: 0.22,
      fontSize: 10,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.GOLD,
    });
    s.addText(p.desc, {
      x: 1.25,
      y: yP + 0.22,
      w: 3.75,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  // Right: Screenshot
  if (fs.existsSync(IMG.PORTAL_HERO)) {
    s.addImage({
      path: IMG.PORTAL_HERO,
      x: 5.4,
      y: 1.45,
      w: 3.8,
      h: 3.65,
      sizing: { type: 'contain' },
    });
  }

  addFooter(s, 6);
  s.addNotes(
    'Kita masuk ke Modul 1: Portal Pelanggan Mandiri. Pelanggan yang duduk di meja tidak perlu menunggu pelayan datang membawa buku menu. Cukup scan barcode di meja, web app langsung terbuka tanpa perlu mengunduh aplikasi dari Play Store. Nomor meja otomatis terdeteksi, dan pelanggan langsung disuguhi banner promo stempel loyalitas serta tombol menu praktis. Desain ini sangat ramah bagi pelanggan dari segala kalangan umur.'
  );
}

// ==========================================
// SLIDE 7: KATALOG MENU DIGITAL & RACIK TOPPING
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 1: Katalog & Menu', 'Katalog Menu Interaktif & Kustomisasi Topping Ekstra', 'Eksplorasi varian mie khas Garut, pengaturan porsi, dan penambahan topping dengan harga transparan');

  // Left Details
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 4.4,
    h: 3.65,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });

  s.addText('🍲 Racik Mie Favorit Sesuai Selera', {
    x: 1.0,
    y: 1.65,
    w: 4.0,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const menuFeatures = [
    { title: 'Varian Porsi Lengkap', desc: 'Pilihan porsi Seporsi Penuh, 1/2 Porsi (hemat), atau Porsi Komplit Khusus dengan komposisi baso lengkap.' },
    { title: 'Master Harga Terupdate & Transparan', desc: 'Topping Baso Urat Jumbo Rp 10.000, Es Jeruk Peras Segar Rp 15.000, serta variasi tetelan, babat, dan tahu bakso.' },
    { title: 'Visualisasi Foto Asli Menggugah Selera', desc: 'Setiap menu dilengkapi foto produk nyata dan label kategori (Mie Kuah, Yamin Manis, Yamin Asin, Topping, Minuman).' },
    { title: 'Kolom Catatan Khusus Per Item', desc: 'Pelanggan bisa menyematkan catatan penting seperti: "Kuah dipisah", "Banyakin daun bawang", atau "Jangan pakai seledri".' },
  ];

  menuFeatures.forEach((m, idx) => {
    const yP = 2.05 + idx * 0.72;
    s.addText(`★  ${m.title}`, {
      x: 1.0,
      y: yP,
      w: 4.0,
      h: 0.22,
      fontSize: 10,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.EMERALD,
    });
    s.addText(m.desc, {
      x: 1.25,
      y: yP + 0.22,
      w: 3.75,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  // Right: Screenshot
  if (fs.existsSync(IMG.MENU_CATALOG)) {
    s.addImage({
      path: IMG.MENU_CATALOG,
      x: 5.4,
      y: 1.45,
      w: 3.8,
      h: 3.65,
      sizing: { type: 'contain' },
    });
  }

  addFooter(s, 7);
  s.addNotes(
    'Pada halaman katalog menu, pelanggan dapat melihat rincian foto menu asli dan harga yang transparan. Di sini pelanggan bisa memilih porsi penuh, setengah porsi, atau porsi komplit. Kami juga telah memperbarui master harga seperti Baso Urat Jumbo seharga Rp 10.000 dan Es Jeruk Peras murni seharga Rp 15.000. Fitur yang sangat disukai pelanggan adalah kolom catatan khusus di mana mereka bisa meminta kuah dipisah atau bumbu disesuaikan tanpa khawatir salah catat oleh pelayan.'
  );
}

// ==========================================
// SLIDE 8: LIVE ORDER STATUS TRACKING
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 1: Pelacakan Pesanan', 'Live Order Status: Transparansi Tahapan Pesanan Pelanggan', 'Pelanggan memantau tahapan racikan dapur dan status siap saji secara langsung di layar smartphone');

  // Left Details
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 4.4,
    h: 3.65,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });

  s.addText('📍 Siklus Hidup Pesanan (4 Tahapan Transparan)', {
    x: 1.0,
    y: 1.65,
    w: 4.0,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const statuses = [
    { stage: '1. Menunggu Pembayaran', desc: 'Menampilkan rincian tagihan belanja, opsi bayar kasir tunai atau scan QRIS digital secara mandiri.' },
    { stage: '2. Sedang Diproses Dapur', desc: 'Koki telah menerima order dan sedang meracik mie bakso. Pelanggan merasa tenang pesanan dikerjakan.' },
    { stage: '3. Siap Diambil / Diantar', desc: 'Makanan telah matang dan siap disajikan ke meja nomor pelanggan.' },
    { stage: '4. Selesai (Completed)', desc: 'Transaksi tuntas lunas, poin stempel loyalitas langsung terupdate otomatis ke nomor WhatsApp pelanggan.' },
  ];

  statuses.forEach((st, idx) => {
    const yP = 2.05 + idx * 0.72;
    s.addText(`⦿  ${st.stage}`, {
      x: 1.0,
      y: yP,
      w: 4.0,
      h: 0.22,
      fontSize: 10,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.BLUE_ACCENT,
    });
    s.addText(st.desc, {
      x: 1.25,
      y: yP + 0.22,
      w: 3.75,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  // Right: Screenshot
  if (fs.existsSync(IMG.QRIS_PAYMENT)) {
    s.addImage({
      path: IMG.QRIS_PAYMENT,
      x: 5.4,
      y: 1.45,
      w: 3.8,
      h: 3.65,
      sizing: { type: 'contain' },
    });
  }

  addFooter(s, 8);
  s.addNotes(
    'Setelah menekan tombol order, layar HP pelanggan langsung berubah menjadi pelacak status pesanan secara live. Ada 4 indikator yang jelas: Menunggu Pembayaran, Sedang Diproses oleh dapur, Siap Diambil atau diantar ke meja, hingga Selesai. Transparansi ini menghilangkan rasa cemas pelanggan yang bertanya-tanya apakah pesanan mereka sudah dibuat atau belum, sehingga suasana rumah makan menjadi jauh lebih tertib dan tenang.'
  );
}

// ==========================================
// SLIDE 9: KITCHEN DISPLAY SYSTEM & ORDER QUEUE
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 2: Antrean Dapur & Kasir', 'Kitchen Display System (KDS): Antrean Pesanan Real-Time', 'Menggantikan nota kertas dapur dengan dashboard digital responsif disertai notifikasi audio chime');

  // Left Details
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 4.4,
    h: 3.65,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });

  s.addText('📋 Dashboard Antrean Pesanan (/admin/orders)', {
    x: 1.0,
    y: 1.65,
    w: 4.0,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const kdsPoints = [
    { title: 'Audio Chime Notification', desc: 'Suara lonceng lembut otomatis berdentang saat ada pesanan masuk, koki tidak perlu melototi layar setiap detik.' },
    { title: 'Filter Status Lengkap', desc: 'Tab filter: Semua Pesanan, Menunggu Bayar, Sudah Dibayar, Sedang Diproses, Siap Diambil, Selesai, dan Dibatalkan.' },
    { title: 'Pencarian Cepat Multifungsi', desc: 'Kasir dapat mencari pesanan instan berdasarkan Nama Pembeli, Kode Transaksi (misal KS-ORD-...), atau Menu.' },
    { title: 'Perlindungan Anti-Blank Screen', desc: 'Dilengkapi fungsi Safe Data Parsing sehingga data histori transaksi besar tidak akan pernah memicu layar blank putih.' },
  ];

  kdsPoints.forEach((k, idx) => {
    const yP = 2.05 + idx * 0.72;
    s.addText(`🔔  ${k.title}`, {
      x: 1.0,
      y: yP,
      w: 4.0,
      h: 0.22,
      fontSize: 10,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.GOLD,
    });
    s.addText(k.desc, {
      x: 1.25,
      y: yP + 0.22,
      w: 3.75,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  // Right: Screenshot
  if (fs.existsSync(IMG.ORDER_QUEUE)) {
    s.addImage({
      path: IMG.ORDER_QUEUE,
      x: 5.4,
      y: 1.45,
      w: 3.8,
      h: 3.65,
      sizing: { type: 'contain' },
    });
  }

  addFooter(s, 9);
  s.addNotes(
    'Sekarang kita beralih ke sisi operasional dapur dan kasir pada Modul 2. Layar antrean pesanan atau Kitchen Display System menggantikan fungsi bon kertas seutuhnya. Setiap kali ada pelanggan checkout dari meja, lonceng audio chime langsung berbunyi di dapur. Juru masak dapat langsung melihat rincian makanan, nomor meja, dan catatan khusus. Kasir juga memiliki tab filter lengkap untuk memisahkan pesanan yang menunggu pembayaran dari pesanan yang sudah lunas.'
  );
}

// ==========================================
// SLIDE 10: ALUR OPERASIONAL DAPUR & MITIGASI KESALAHAN
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 2: Operasional Dapur', 'Alur Kerja Dapur Higienis & Jaminan Nol Pesanan Hilang', 'Mekanisme perubahan status pesanan 1-sentuhan dan mitigasi human error di area masak');

  const workflowCards = [
    {
      title: '1. Verifikasi Pembayaran Cepat',
      desc: 'Jika pelanggan memilih bayar tunai, kasir cukup menekan "Konfirmasi Bayar" di kasir, pesanan otomatis berstatus "Sudah Dibayar". Jika bayar QRIS, sistem otomatis memverifikasi status.',
      icon: '💵',
    },
    {
      title: '2. Visualisasi Resep & Topping',
      desc: 'Setiap kartu pesanan menampilkan rincian: porsi, jenis kuah/yamin, topping ekstra berbayar, serta catatan khusus tanpa singkatan membingungkan.',
      icon: '🍲',
    },
    {
      title: '3. Tombol Aksi 1-Sentuhan',
      desc: 'Koki cukup menekan tombol "Mulai Masak" untuk mengubah status menjadi sedang diracik, lalu tombol "Selesai Masak" saat pesanan siap diantar.',
      icon: '👆',
    },
    {
      title: '4. Fail-Safe Offline Caching',
      desc: 'Jika koneksi internet warung sempat terputus mendadak, data pesanan tetap tersimpan rapi di cache memori browser dan tersinkron saat internet pulih.',
      icon: '🛡️',
    },
  ];

  workflowCards.forEach((w, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xP = 0.8 + col * 4.3;
    const yP = 1.45 + row * 1.8;

    s.addShape(pres.ShapeType.roundRect, {
      x: xP,
      y: yP,
      w: 4.1,
      h: 1.65,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });

    s.addText(`${w.icon}  ${w.title}`, {
      x: xP + 0.2,
      y: yP + 0.18,
      w: 3.7,
      h: 0.3,
      fontSize: 11.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });

    s.addText(w.desc, {
      x: xP + 0.2,
      y: yP + 0.55,
      w: 3.7,
      h: 0.95,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      valign: 'top',
    });
  });

  addFooter(s, 10);
  s.addNotes(
    'Alur kerja operasional di dapur kini sangat terstandarisasi. Koki tidak lagi dipusingkan dengan sobekan nota kertas yang rawan kotor terkena kuah atau hilang dihembus angin. Kartu pesanan digital memiliki tombol 1-sentuhan untuk memajukan status pesanan. Selain itu, dengan adanya sistem fail-safe offline caching, apabila internet sempat terputus, operasional dapur tetap berjalan lancar tanpa ada data pesanan yang hilang.'
  );
}

// ==========================================
// SLIDE 11: TOUCH POS KASIR CEPAT
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 3: Kasir Touch POS', 'Touch POS Kasir: Transaksi Cepat & Kalkulator Uang Pas', 'Antarmuka layar sentuh kasir modern dengan pintasan pecahan uang tunai dan cetak struk termal');

  // Left Details
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 4.4,
    h: 3.65,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });

  s.addText('⚡ Dirancang Khusus untuk Jam Sibuk Kasir', {
    x: 1.0,
    y: 1.65,
    w: 4.0,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const posFeatures = [
    { title: 'One-Touch Grid Menu', desc: 'Tombol menu berukuran besar dioptimalkan untuk layar sentuh tablet/laptop tanpa perlu menggunakan mouse rumit.' },
    { title: 'Tombol Pecahan Cepat (Quick Cash)', desc: 'Tombol instan pecahan Rp 20.000, Rp 50.000, Rp 100.000, serta tombol "Uang Pas" untuk checkout seketika.' },
    { title: 'Kalkulator Kembalian Otomatis', desc: 'Sistem langsung menghitung nilai kembalian uang secara akurat, mengeliminasi human error saat kasir kelelahan.' },
    { title: 'Input Nomor WhatsApp Pelanggan', desc: 'Kasir dapat menginput nomor WA pembeli untuk mengirimkan e-struk ramah lingkungan sekaligus menambah stempel otomatis.' },
  ];

  posFeatures.forEach((pf, idx) => {
    const yP = 2.05 + idx * 0.72;
    s.addText(`✔  ${pf.title}`, {
      x: 1.0,
      y: yP,
      w: 4.0,
      h: 0.22,
      fontSize: 10,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_MID,
    });
    s.addText(pf.desc, {
      x: 1.25,
      y: yP + 0.22,
      w: 3.75,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  // Right: Screenshot
  if (fs.existsSync(IMG.TOUCH_POS)) {
    s.addImage({
      path: IMG.TOUCH_POS,
      x: 5.4,
      y: 1.45,
      w: 3.8,
      h: 3.65,
      sizing: { type: 'contain' },
    });
  }

  addFooter(s, 11);
  s.addNotes(
    'Pada Modul 3, kami menyediakan antarmuka Touch POS Kasir Cepat di halaman /admin/pos. Bagi pelanggan yang memesan langsung di meja kasir secara konvensional (walk-in atau takeaway), kasir dapat memasukkan pesanan dengan satu sentuhan. Fitur unggulan di sini adalah Tombol Uang Cepat (Rp 50k, 100k, dan Uang Pas) yang otomatis menghitung nilai kembalian tanpa perlu kalkulator terpisah, sehingga waktu transaksi di kasir terpangkas dari 2 menit menjadi kurang dari 15 detik.'
  );
}

// ==========================================
// SLIDE 12: MULTI-PAYMENT & STRUK TERMAL
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 3: Pembayaran & Struk', 'Multi-Payment Gateway & Integrasi Struk Termal', 'Dukungan pembayaran fleksibel Tunai / QRIS serta pencetakan struk fisik dan e-struk digital');

  const paymentCards = [
    {
      title: 'Pembayaran Tunai (Cash) Terkendali',
      desc: 'Mencatat nominal uang yang diterima dari pelanggan secara presisi. Transaksi tunai langsung dialokasikan ke pembukuan kas harian tanpa risiko selisih hitung.',
      icon: '💵',
    },
    {
      title: 'QRIS Resmi Dinamis & Terstandarisasi',
      desc: 'Mendukung pembayaran cashless via QRIS resmi Mie Baso Kartika Sari (BCA, Mandiri, GoPay, OVO, Dana, ShopeePay) dengan nominal tagihan yang tertera jelas.',
      icon: '📱',
    },
    {
      title: 'Pencetakan Struk Termal (58mm / 80mm)',
      desc: 'Terintegrasi langsung dengan printer thermal USB atau Bluetooth melalui Web Print API standar. Struk rapi memuat kop toko, rincian menu, dan kode pesanan.',
      icon: '🖨️',
    },
    {
      title: 'E-Struk Digital Ramah Lingkungan',
      desc: 'Pilihan opsi tanpa kertas (paperless): struk digital otomatis tersimpan di riwayat pesanan smartphone pelanggan dan dapat dikirimkan melalui pesan WhatsApp.',
      icon: '🌱',
    },
  ];

  paymentCards.forEach((pc, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xP = 0.8 + col * 4.3;
    const yP = 1.45 + row * 1.8;

    s.addShape(pres.ShapeType.roundRect, {
      x: xP,
      y: yP,
      w: 4.1,
      h: 1.65,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });

    s.addText(`${pc.icon}  ${pc.title}`, {
      x: xP + 0.2,
      y: yP + 0.18,
      w: 3.7,
      h: 0.3,
      fontSize: 11.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });

    s.addText(pc.desc, {
      x: xP + 0.2,
      y: yP + 0.55,
      w: 3.7,
      h: 0.95,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      valign: 'top',
    });
  });

  addFooter(s, 12);
  s.addNotes(
    'Untuk metode pembayaran, sistem mendukung transaksi ganda: Tunai maupun QRIS digital resmi. Struk belanja dapat dicetak secara fisik ke printer thermal ukuran 58mm atau 80mm yang umum digunakan di restoran, ataupun diberikan sebagai e-struk digital. Ini memberikan fleksibilitas maksimal baik bagi pelanggan generasi tua yang terbiasa tunai maupun generasi muda yang mengandalkan QRIS.'
  );
}

// ==========================================
// SLIDE 13: DIGITAL STAMP LOYALTY ENGINE
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 4: Loyalitas Stempel', 'Kartu Stempel Digital: Modernisasi Promo "Beli 10 Gratis 1"', 'Gamifikasi loyalitas pelanggan tanpa kartu fisik: 1 porsi mie = 1 stempel otomatis');

  // Left Details
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 4.4,
    h: 3.65,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });

  s.addText('🎁 Mekanisme Reward Transparan & Menyenangkan', {
    x: 1.0,
    y: 1.65,
    w: 4.0,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const stampRules = [
    { title: '1 Porsi Mie = 1 Stempel Real-Time', desc: 'Setiap pembelian 1 porsi mie kuah atau yamin otomatis menambah 1 poin stempel saat pembayaran lunas.' },
    { title: 'Audit Perhitungan Akurat', desc: 'Jika pelanggan membeli 2 porsi mie baso sekaligus, sistem langsung menambahkan 2 stempel secara real-time tanpa tertinggal.' },
    { title: 'Visual Kartu Member 10 Slot', desc: 'Tampilan interaktif 10 slot mangkok mie dengan animasi progres bar yang memotivasi pelanggan untuk berkunjung kembali.' },
    { title: 'Klaim Hadiah Porsi ke-10 Gratis', desc: 'Saat stempel mencapai angka 10, muncul ikon kado reward spesial: 1 Porsi Mie Kuah / Yamin GRATIS.' },
  ];

  stampRules.forEach((sr, idx) => {
    const yP = 2.05 + idx * 0.72;
    s.addText(`★  ${sr.title}`, {
      x: 1.0,
      y: yP,
      w: 4.0,
      h: 0.22,
      fontSize: 10,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.GOLD,
    });
    s.addText(sr.desc, {
      x: 1.25,
      y: yP + 0.22,
      w: 3.75,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  // Right: Screenshot
  if (fs.existsSync(IMG.STAMP_CARD)) {
    s.addImage({
      path: IMG.STAMP_CARD,
      x: 5.4,
      y: 1.45,
      w: 3.8,
      h: 3.65,
      sizing: { type: 'contain' },
    });
  }

  addFooter(s, 13);
  s.addNotes(
    'Masuk ke Modul 4: Digital Stamp Loyalty Engine. Ini adalah salah satu fitur paling inovatif dalam aplikasi ini. Sebelumnya, rumah makan menggunakan kupon stempel kertas yang sering hilang dari dompet pelanggan. Kini, stempel otomatis terisi secara digital. Rumusnya sederhana dan adil: setiap 1 porsi mie baso bernilai 1 stempel. Beli 2 porsi mie, otomatis bertambah 2 stempel. Begitu mencapai 10 stempel, pelanggan berhak mengklaim 1 porsi mie kuah atau yamin gratis!'
  );
}

// ==========================================
// SLIDE 14: VERIFIKASI STEMPEL TANPA LOGIN
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 4: Aksesibilitas Stempel', 'Verifikasi Stempel Instan: Cukup Nama atau WhatsApp', 'Pelanggan dapat memeriksa saldo stempel kapan saja secara mandiri tanpa perlu membuat akun');

  // Left Details
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 4.4,
    h: 3.65,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });

  s.addText('🔍 Kemudahan Akses Tanpa Registrasi Rumit', {
    x: 1.0,
    y: 1.65,
    w: 4.0,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const checkPoints = [
    { title: 'Pencarian Berbasis Nama / WhatsApp', desc: 'Cukup masukkan nama lengkap atau nomor WhatsApp (misal "Muhammad Fanza Yuseftian"), data stempel langsung tampil.' },
    { title: 'Normalisasi Nomor HP Cerdas', desc: 'Sistem otomatis mengenali nomor format 08xxx maupun +62xxx tanpa error, memastikan akun pelanggan tidak terduplikasi.' },
    { title: 'Privasi & Keamanan Terjaga', desc: 'Hanya menampilkan nama depan, inisial nomor, dan jumlah stempel, menjaga kerahasiaan data pembeli.' },
    { title: 'Sinkronisasi Real-Time Dua Arah', desc: 'Begitu kasir menyelesaikan transaksi pembayaran di kasir, stempel pada modal pencarian pelanggan langsung terupdate detik itu juga.' },
  ];

  checkPoints.forEach((cp, idx) => {
    const yP = 2.05 + idx * 0.72;
    s.addText(`✔  ${cp.title}`, {
      x: 1.0,
      y: yP,
      w: 4.0,
      h: 0.22,
      fontSize: 10,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.EMERALD,
    });
    s.addText(cp.desc, {
      x: 1.25,
      y: yP + 0.22,
      w: 3.75,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  // Right: Screenshot
  if (fs.existsSync(IMG.STAMP_SEARCH)) {
    s.addImage({
      path: IMG.STAMP_SEARCH,
      x: 5.4,
      y: 1.45,
      w: 3.8,
      h: 3.65,
      sizing: { type: 'contain' },
    });
  }

  addFooter(s, 14);
  s.addNotes(
    'Bagaimana cara pelanggan memeriksa stempel mereka? Sangat mudah! Mereka tidak perlu mendaftar akun dengan password yang membingungkan. Cukup klik tombol "Cek Stempel" di halaman utama, masukkan nama atau nomor WhatsApp, dan kartu loyalitas digital mereka langsung muncul di layar. Sistem juga dilengkapi algoritma cerdas yang menormalisasi format nomor telepon, sehingga pembeli yang mengetik 0899 atau 62899 tetap terhubung ke akun yang sama secara akurat.'
  );
}

// ==========================================
// SLIDE 15: CRM & SEGMENTASI PELANGGAN OTOMATIS
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 5: CRM Pelanggan', 'Manajemen CRM Cerdas & Segmentasi Pelanggan Otomatis', 'Klasifikasi otomatis database pembeli untuk strategi pemasaran dan peningkatan retensi kunjungan');

  const crmTiers = [
    {
      tier: '👑 Segmen VIP',
      criteria: 'Belanja >5 kali atau total transaksi >Rp 300.000',
      action: 'Diberikan layanan prioritas, diskon eksklusif, dan bonus topping gratis pada kunjungan berikutnya.',
      color: COLOR.GOLD,
      bg: COLOR.GOLD_LIGHT,
    },
    {
      tier: '🟢 Segmen Reguler (Setia)',
      criteria: 'Kunjungan rutin 2-4 kali dalam sebulan terakhir',
      action: 'Dipertahankan loyalitasnya dengan pengingat stempel yang hampir penuh menuju reward gratis.',
      color: COLOR.FOREST_DARK,
      bg: 'DCFCE7',
    },
    {
      tier: '🟡 Pelanggan Baru (New)',
      criteria: 'Transaksi pertama kali di Rumah Makan Kartika Sari',
      action: 'Diberikan sambutan hangat dan edukasi kemudahan program stempel digital perdana.',
      color: COLOR.BLUE_ACCENT,
      bg: 'DBEAFE',
    },
    {
      tier: '🔴 Segmen At-Risk (Pasif)',
      criteria: 'Tidak pernah berkunjung kembali lebih dari 30 hari',
      action: 'Ditargetkan dengan pesan sapaan rindu dan voucher promo khusus agar kembali datang makan.',
      color: COLOR.RED_ACCENT,
      bg: 'FEE2E2',
    },
  ];

  crmTiers.forEach((ct, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xP = 0.8 + col * 4.3;
    const yP = 1.45 + row * 1.8;

    s.addShape(pres.ShapeType.roundRect, {
      x: xP,
      y: yP,
      w: 4.1,
      h: 1.65,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: xP + 0.15,
      y: yP + 0.15,
      w: 1.8,
      h: 0.28,
      rectRadius: 0.14,
      fill: { color: ct.bg },
      line: { color: ct.color, width: 1 },
    });
    s.addText(ct.tier, {
      x: xP + 0.15,
      y: yP + 0.15,
      w: 1.8,
      h: 0.28,
      fontSize: 9,
      fontFace: 'Calibri',
      bold: true,
      color: ct.color,
      align: 'center',
      valign: 'middle',
    });

    s.addText(`Kriteria: ${ct.criteria}`, {
      x: xP + 0.18,
      y: yP + 0.5,
      w: 3.75,
      h: 0.35,
      fontSize: 8.8,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.SLATE_DARK,
    });

    s.addText(`Strategi: ${ct.action}`, {
      x: xP + 0.18,
      y: yP + 0.85,
      w: 3.75,
      h: 0.65,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      valign: 'top',
    });
  });

  addFooter(s, 15);
  s.addNotes(
    'Pada Modul 5, kami mengimplementasikan sistem CRM (Customer Relationship Management) otomatis. Seluruh database pelanggan dikelompokkan ke dalam 4 segmen: Pelanggan Baru, Reguler, VIP, dan At-Risk. Pelanggan VIP adalah mereka yang belanja lebih dari 5 kali, sementara At-Risk adalah pelanggan yang tidak kembali selama lebih dari 30 hari. Klasifikasi otomatis ini memungkinkan pemilik toko menjalankan strategi pemasaran yang tepat sasaran.'
  );
}

// ==========================================
// SLIDE 16: DIRECT WHATSAPP & QRIS DINAMIS
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 5: Interaksi Pelanggan', 'Integrasi WhatsApp 1-Klik & Pembayaran QRIS Resmi', 'Komunikasi pemasaran personal via WhatsApp resmi dan standarisasi pembayaran non-tunai');

  // Left: WhatsApp Feature
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 4.4,
    h: 3.65,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });

  s.addText('💬 Direct WhatsApp Messaging (1-Klik)', {
    x: 1.0,
    y: 1.65,
    w: 4.0,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_DARK,
  });

  const waPoints = [
    { title: 'Template Pesan Terpersonalisasi', desc: 'Pesan langsung menyebut nama pelanggan dan sisa stempel mereka secara otomatis (contoh: "Halo Kak Fanza, stempel kamu sudah 8/10 lho!").' },
    { title: 'Kirim Struk & Bukti Promo', desc: 'Memungkinkan kasir mengirimkan nota digital langsung ke WhatsApp pelanggan tanpa biaya SMS gateway mahal.' },
    { title: 'Re-engagement Pelanggan Pasif', desc: '1 klik untuk menyapa segmen pelanggan At-Risk dengan pesan promo akhir pekan untuk mengundang mereka datang kembali.' },
    { title: 'Nol Biaya Tambahan', desc: 'Memanfaatkan protokol wa.me langsung dari browser, 100% gratis tanpa berlangganan API pihak ketiga.' },
  ];

  waPoints.forEach((w, idx) => {
    const yP = 2.05 + idx * 0.72;
    s.addText(`★  ${w.title}`, {
      x: 1.0,
      y: yP,
      w: 4.0,
      h: 0.22,
      fontSize: 10,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.EMERALD,
    });
    s.addText(w.desc, {
      x: 1.25,
      y: yP + 0.22,
      w: 3.75,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  // Right: QRIS Barcode Image
  if (fs.existsSync(IMG.QRIS_BARCODE)) {
    s.addImage({
      path: IMG.QRIS_BARCODE,
      x: 5.4,
      y: 1.45,
      w: 3.8,
      h: 3.65,
      sizing: { type: 'contain' },
    });
  }

  addFooter(s, 16);
  s.addNotes(
    'Sebagai pelengkap CRM, kami menyediakan tombol Direct WhatsApp 1-Klik. Kasir atau owner dapat langsung mengirimkan sapaan personal atau promosi ke WhatsApp pelanggan dengan template yang sudah memuat nama dan saldo stempel mereka secara otomatis. Di sebelah kanan, Anda bisa melihat barcode QRIS resmi toko yang terpasang di meja kasir maupun di layar smartphone pelanggan untuk memudahkan pembayaran non-tunai.'
  );
}

// ==========================================
// SLIDE 17: DASHBOARD FINANSIAL & ANALITIK
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 6: Finansial & Analitik', 'Dashboard Laporan Penjualan & Analitik Toko', 'Visibilitas data keuangan real-time untuk pengambilan keputusan strategis pemilik usaha');

  const metrics = [
    {
      title: 'Total Omset Bersih Real-Time',
      desc: 'Terkalkulasi otomatis dari seluruh pesanan yang berstatus lunas. Membedakan secara transparan penerimaan Tunai vs QRIS Digital.',
      metric: 'Real-Time Update',
      icon: '📈',
    },
    {
      title: 'Rata-rata Belanja (Basket Size)',
      desc: 'Mengukur rata-rata pengeluaran pelanggan per transaksi. Menjadi indikator keberhasilan upselling menu topping ekstra.',
      metric: 'Key KPI Retail',
      icon: '🛒',
    },
    {
      title: 'Total Porsi Terjual per Kategori',
      desc: 'Rincian detail volume penjualan Mie Kuah, Yamin Manis, Yamin Asin, Topping Baso Urat Jumbo, dan Aneka Jus Segar.',
      metric: 'Kategori Lengkap',
      icon: '🍜',
    },
    {
      title: 'Menu Paling Laris (Best Seller)',
      desc: 'Menampilkan ranking produk paling favorit. Membantu juru masak mempersiapkan stok bahan baku daging baso secara tepat.',
      metric: 'Prediksi Bahan Baku',
      icon: '🏆',
    },
  ];

  metrics.forEach((met, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xP = 0.8 + col * 4.3;
    const yP = 1.45 + row * 1.8;

    s.addShape(pres.ShapeType.roundRect, {
      x: xP,
      y: yP,
      w: 4.1,
      h: 1.65,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });

    s.addText(`${met.icon}  ${met.title}`, {
      x: xP + 0.2,
      y: yP + 0.18,
      w: 3.7,
      h: 0.3,
      fontSize: 11.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });

    s.addText(met.desc, {
      x: xP + 0.2,
      y: yP + 0.55,
      w: 3.7,
      h: 0.65,
      fontSize: 8.8,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      valign: 'top',
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: xP + 0.2,
      y: yP + 1.25,
      w: 1.8,
      h: 0.26,
      rectRadius: 0.13,
      fill: { color: COLOR.GOLD_LIGHT },
      line: { color: COLOR.GOLD, width: 1 },
    });
    s.addText(met.metric, {
      x: xP + 0.2,
      y: yP + 1.25,
      w: 1.8,
      h: 0.26,
      fontSize: 8,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.GOLD,
      align: 'center',
      valign: 'middle',
    });
  });

  addFooter(s, 17);
  s.addNotes(
    'Pada Modul 6, kami menghadirkan Dashboard Laporan Finansial & Analitik Toko di halaman /admin/reports. Pemilik rumah makan dapat memantau empat metrik kunci: Total Omset Bersih, Rata-rata Nilai Belanja (Basket Size), Total Porsi Terjual, dan Menu Terlaris. Data ini diperbarui secara otomatis setiap kali kasir menyelesaikan transaksi, sehingga owner tahu persis berapa porsi bakso yang terjual hari ini tanpa harus menunggu malam tiba.'
  );
}

// ==========================================
// SLIDE 18: EKSPOR LAPORAN PDF A4 & CSV EXCEL
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Modul 6: Ekspor Data', 'Fitur Ekspor Laporan Finansial: Dokumen PDF A4 & CSV', 'Menjawab kebutuhan pembukuan UMKM dengan dokumen resmi siap cetak dan file data Excel');

  // Left: PDF Export Card
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 4.1,
    h: 3.65,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 1.0,
    y: 1.65,
    w: 2.2,
    h: 0.28,
    rectRadius: 0.14,
    fill: { color: 'FEE2E2' },
    line: { color: COLOR.RED_ACCENT, width: 1 },
  });
  s.addText('📄 EXPORT PDF A4 RESMI', {
    x: 1.0,
    y: 1.65,
    w: 2.2,
    h: 0.28,
    fontSize: 8.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.RED_ACCENT,
    align: 'center',
    valign: 'middle',
  });

  const pdfPoints = [
    { title: 'Format Tata Letak A4 Standar', desc: 'Disusun presisi dengan margin rapi dan siap cetak menggunakan printer dokumen standar.' },
    { title: 'Kop Surat Resmi Toko', desc: 'Memuat logo Mie Baso Kartika Sari, alamat Jl. Otista Garut, serta nomor kontak resmi.' },
    { title: 'Komparasi Metode Pembayaran', desc: 'Tabel rincian omset tunai vs QRIS, total diskon, dan volume porsi terjual.' },
    { title: 'Kolom Tanda Tangan Owner', desc: 'Dilengkapi kolom pengesahan dan tanggal tutup buku resmi untuk audit pembukuan.' },
  ];
  pdfPoints.forEach((p, idx) => {
    const yP = 2.1 + idx * 0.72;
    s.addText(`•  ${p.title}`, {
      x: 1.0,
      y: yP,
      w: 3.7,
      h: 0.22,
      fontSize: 9.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });
    s.addText(p.desc, {
      x: 1.2,
      y: yP + 0.22,
      w: 3.5,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  // Right: CSV Export Card
  s.addShape(pres.ShapeType.roundRect, {
    x: 5.1,
    y: 1.45,
    w: 4.1,
    h: 3.65,
    rectRadius: 0.12,
    fill: { color: COLOR.CARD_BG },
    line: { color: COLOR.CARD_BORDER, width: 1 },
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 5.3,
    y: 1.65,
    w: 2.2,
    h: 0.28,
    rectRadius: 0.14,
    fill: { color: 'DCFCE7' },
    line: { color: COLOR.FOREST_MID, width: 1 },
  });
  s.addText('📊 EXPORT CSV / EXCEL', {
    x: 5.3,
    y: 1.65,
    w: 2.2,
    h: 0.28,
    fontSize: 8.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.FOREST_MID,
    align: 'center',
    valign: 'middle',
  });

  const csvPoints = [
    { title: 'Standar Encoding UTF-8 BOM', desc: 'Bebas error karakter dan tanda kutip saat dibuka langsung di Microsoft Excel Windows.' },
    { title: 'Kolom Data Transaksi Lengkap', desc: 'ID Pesanan, Tanggal/Jam, Nama Pembeli, Nomor Meja, Rincian Item, Metode Bayar, & Status.' },
    { title: 'Format Angka Siap Olah', desc: 'Nominal rupiah diformat sebagai nilai numerik bersih sehingga mudah dibuat rumus sum/pivot.' },
    { title: 'Fleksibilitas Filter Tanggal', desc: 'Dapat diekspor per hari ini, 7 hari terakhir, 30 hari, atau rentang tanggal bulan kustom.' },
  ];
  csvPoints.forEach((c, idx) => {
    const yP = 2.1 + idx * 0.72;
    s.addText(`•  ${c.title}`, {
      x: 5.3,
      y: yP,
      w: 3.7,
      h: 0.22,
      fontSize: 9.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });
    s.addText(c.desc, {
      x: 5.5,
      y: yP + 0.22,
      w: 3.5,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
    });
  });

  addFooter(s, 18);
  s.addNotes(
    'Salah satu fitur yang baru saja kami tambahkan sesuai kebutuhan pemilik adalah ekspor laporan dalam dua format standar industri: PDF A4 Resmi dan file CSV Excel. File PDF diformat rapi dengan kop toko dan kolom tanda tangan owner yang siap dicetak untuk arsip fisik. Sementara itu, file CSV diformat khusus dengan UTF-8 BOM sehingga langsung terbuka rapi di Microsoft Excel tanpa masalah teks rusak, memudahkan akuntan toko melakukan analisis lebih lanjut.'
  );
}

// ==========================================
// SLIDE 19: ARSITEKTUR TEKNIS & 277 UNIT TESTS
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Spesifikasi & Keandalan Teknis', 'Teknologi Modern & Ketahanan Sistem Teruji 100%', 'Dibangun dengan standar perangkat lunak enterprise untuk menjamin zero-downtime');

  const techCards = [
    {
      title: 'Frontend: React 18 & TypeScript',
      desc: 'UI komponen ultra-responsif dengan Vite bundler. Pengetikan ketat (type-safety) mencegah terjadinya bug pada kalkulasi nominal rupiah dan status transaksi.',
      badge: '100% Type-Safe',
      color: COLOR.BLUE_ACCENT,
    },
    {
      title: 'Backend & Cloud: Supabase PostgreSQL',
      desc: 'Database cloud kelas industri dengan Row Level Security (RLS) dan engine WebSocket Realtime native untuk sinkronisasi sub-detik (<100ms) tanpa delay.',
      badge: 'PostgreSQL Realtime',
      color: COLOR.EMERALD,
    },
    {
      title: 'Offline-First & PWA Service Worker',
      desc: 'Menjamin Zero-Downtime: jika koneksi internet terputus, kasir tetap bisa menginput pesanan dan mencetak struk karena data di-cache lokal di IndexedDB.',
      badge: 'Zero-Downtime Guarantee',
      color: COLOR.GOLD,
    },
    {
      title: '277 Automated Unit Tests (100% Passing)',
      desc: 'Teruji secara otomatis dengan 24 file test suites (Vitest) mencakup validasi matematis kasir, formatting nomor telepon 08/62, dan stress test antrean ganda.',
      badge: '277 Tests Passed',
      color: COLOR.FOREST_DARK,
    },
  ];

  techCards.forEach((tc, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xP = 0.8 + col * 4.3;
    const yP = 1.45 + row * 1.8;

    s.addShape(pres.ShapeType.roundRect, {
      x: xP,
      y: yP,
      w: 4.1,
      h: 1.65,
      rectRadius: 0.12,
      fill: { color: COLOR.CARD_BG },
      line: { color: COLOR.CARD_BORDER, width: 1 },
    });

    s.addText(tc.title, {
      x: xP + 0.2,
      y: yP + 0.18,
      w: 3.7,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.FOREST_DARK,
    });

    s.addText(tc.desc, {
      x: xP + 0.2,
      y: yP + 0.52,
      w: 3.7,
      h: 0.68,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLOR.SLATE_TEXT,
      valign: 'top',
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: xP + 0.2,
      y: yP + 1.25,
      w: 1.9,
      h: 0.26,
      rectRadius: 0.13,
      fill: { color: COLOR.GOLD_LIGHT },
      line: { color: tc.color, width: 1 },
    });
    s.addText(tc.badge, {
      x: xP + 0.2,
      y: yP + 1.25,
      w: 1.9,
      h: 0.26,
      fontSize: 8,
      fontFace: 'Calibri',
      bold: true,
      color: tc.color,
      align: 'center',
      valign: 'middle',
    });
  });

  addFooter(s, 19);
  s.addNotes(
    'Dari sisi teknologi dan keandalan, aplikasi ini dibangun dengan standar perangkat lunak modern: React 18, TypeScript, dan Supabase PostgreSQL. Kami menerapkan arsitektur Offline-First, sehingga kasir tetap bisa beroperasi meski sinyal internet sempat down. Yang paling membanggakan, seluruh sistem ini telah diverifikasi dengan 277 Automated Unit Tests menggunakan Vitest dengan tingkat kelulusan 100%, membuktikan keandalan logika bisnisnya.'
  );
}

// ==========================================
// SLIDE 20: EVALUASI BISNIS: SEBELUM VS SESUDAH
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.BG_LIGHT };
  addHeader(s, 'Evaluasi & Dampak Bisnis', 'Dampak Terukur: Sebelum vs Sesudah Implementasi', 'Perbandingan nyata efisiensi operasional, kepuasan pelanggan, dan akurasi keuangan');

  // Table Data
  const tableRows = [
    [
      { text: 'Aspek Operasional', options: { bold: true, color: COLOR.WHITE, fill: COLOR.FOREST_DARK, fontSize: 9.5 } },
      { text: 'Sebelum (Sistem Konvensional / Kertas)', options: { bold: true, color: COLOR.WHITE, fill: COLOR.RED_ACCENT, fontSize: 9.5 } },
      { text: 'Sesudah (Ekosistem Digital Kartika Sari)', options: { bold: true, color: COLOR.WHITE, fill: COLOR.FOREST_MID, fontSize: 9.5 } },
      { text: 'Dampak Bisnis Terukur', options: { bold: true, color: COLOR.WHITE, fill: COLOR.GOLD, fontSize: 9.5 } },
    ],
    [
      { text: 'Waktu Antre Pesanan', options: { bold: true, fontSize: 9 } },
      { text: '5 - 10 menit mengantre di depan meja kasir', options: { fontSize: 8.5 } },
      { text: '< 1 menit (Pesan mandiri instan dari smartphone di meja)', options: { fontSize: 8.5, bold: true, color: COLOR.FOREST_MID } },
      { text: 'Pangkas antrean 85%', options: { fontSize: 8.5, bold: true, color: COLOR.GOLD } },
    ],
    [
      { text: 'Akurasi Dapur & Resep', options: { bold: true, fontSize: 9 } },
      { text: 'Salah dengar / nota kertas basah & hilang (10 - 15%)', options: { fontSize: 8.5 } },
      { text: 'Akurasi 99.9% tercatat digital dengan audio chime alert', options: { fontSize: 8.5, bold: true, color: COLOR.FOREST_MID } },
      { text: 'Zero pesanan hilang', options: { fontSize: 8.5, bold: true, color: COLOR.GOLD } },
    ],
    [
      { text: 'Program Stempel Loyalitas', options: { bold: true, fontSize: 9 } },
      { text: 'Kupon kertas sering tertinggal di rumah / basah / hilang', options: { fontSize: 8.5 } },
      { text: 'Stempel digital otomatis tersimpan di nomor WhatsApp', options: { fontSize: 8.5, bold: true, color: COLOR.FOREST_MID } },
      { text: 'Retensi naik 40%', options: { fontSize: 8.5, bold: true, color: COLOR.GOLD } },
    ],
    [
      { text: 'Waktu Tutup Buku Kasir', options: { bold: true, fontSize: 9 } },
      { text: '45 - 60 menit menghitung sobekan kertas bon harian', options: { fontSize: 8.5 } },
      { text: '1 Detik: Sekali klik ekspor PDF A4 resmi atau CSV Excel', options: { fontSize: 8.5, bold: true, color: COLOR.FOREST_MID } },
      { text: 'Efisiensi waktu 98%', options: { fontSize: 8.5, bold: true, color: COLOR.GOLD } },
    ],
    [
      { text: 'Database & Profil Pelanggan', options: { bold: true, fontSize: 9 } },
      { text: 'Nol data pembeli (pemilik tidak mengenali pelanggan)', options: { fontSize: 8.5 } },
      { text: 'Database CRM otomatis (Segmentasi VIP, Reguler, Baru, At-Risk)', options: { fontSize: 8.5, bold: true, color: COLOR.FOREST_MID } },
      { text: 'Database aset bisnis', options: { fontSize: 8.5, bold: true, color: COLOR.GOLD } },
    ],
  ];

  s.addTable(tableRows, {
    x: 0.8,
    y: 1.45,
    w: 8.4,
    h: 3.65,
    colW: [1.8, 2.5, 2.6, 1.5],
    border: { pt: 1, color: COLOR.CARD_BORDER },
    valign: 'middle',
  });

  addFooter(s, 20);
  s.addNotes(
    'Slide ini merangkum evaluasi dampak bisnis secara kuantitatif. Waktu antrean pelanggan dipangkas hingga 85 persen, dari 10 menit menjadi di bawah 1 menit. Akurasi pesanan di dapur meningkat menjadi 99.9 persen berkat notifikasi audio dan kartu digital. Program stempel kertas yang sering hilang kini tersimpan rapi di nomor WhatsApp, meningkatkan retensi pelanggan hingga 40 persen. Dan waktu tutup buku kasir yang tadinya memakan waktu 1 jam setiap malam, kini selesai dalam 1 detik dengan sekali klik ekspor PDF atau CSV.'
  );
}

// ==========================================
// SLIDE 21: KESIMPULAN, DEMO & PENUTUP
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.FOREST_DARK };

  // Decorative Accent
  s.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.25,
    h: 5.625,
    fill: { color: COLOR.GOLD },
    line: { color: COLOR.GOLD },
  });

  // Brand Logo
  if (fs.existsSync(IMG.LOGO)) {
    s.addImage({
      path: IMG.LOGO,
      x: 0.9,
      y: 0.6,
      w: 1.25,
      h: 1.25,
      rounding: true,
    });
  }

  s.addShape(pres.ShapeType.roundRect, {
    x: 2.35,
    y: 0.65,
    w: 2.8,
    h: 0.3,
    rectRadius: 0.15,
    fill: { color: COLOR.FOREST_MID },
    line: { color: COLOR.GOLD, width: 1 },
  });
  s.addText('KESIMPULAN & PENUTUP RESMI', {
    x: 2.35,
    y: 0.65,
    w: 2.8,
    h: 0.3,
    fontSize: 8.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.GOLD_LIGHT,
    align: 'center',
    valign: 'middle',
  });

  s.addText('Siap Mewujudkan Kuliner Garut\nMenjadi Bisnis Modern Berdaya Saing', {
    x: 2.35,
    y: 1.05,
    w: 6.8,
    h: 0.85,
    fontSize: 22,
    fontFace: 'Calibri',
    bold: true,
    color: COLOR.WHITE,
    valign: 'top',
  });

  // 3 Takeaway Cards
  const takeaways = [
    { title: '✓ Solusi End-to-End', desc: 'Menghubungkan Self-Ordering Meja, Touch POS Kasir, Dapur Realtime, Loyalty Stempel, & Laporan Keuangan.' },
    { title: '✓ Tanpa Investasi Alat Mahal', desc: '100% berbasis cloud dan PWA: cukup menggunakan smartphone dan tablet/laptop yang sudah ada di toko.' },
    { title: '✓ Live Production & Teruji', desc: 'Sudah aktif di Vercel & Supabase, teruji dengan 277 Unit Tests bebas bug, siap digunakan penuh di outlet.' },
  ];

  takeaways.forEach((t, idx) => {
    const xP = 0.9 + idx * 2.75;
    s.addShape(pres.ShapeType.roundRect, {
      x: xP,
      y: 2.05,
      w: 2.6,
      h: 1.35,
      rectRadius: 0.12,
      fill: { color: '1A4D31' },
      line: { color: '2D6A4F', width: 1 },
    });
    s.addText(t.title, {
      x: xP + 0.15,
      y: 2.15,
      w: 2.3,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: COLOR.GOLD_LIGHT,
      valign: 'top',
    });
    s.addText(t.desc, {
      x: xP + 0.15,
      y: 2.5,
      w: 2.3,
      h: 0.8,
      fontSize: 9,
      fontFace: 'Calibri',
      color: 'E2E8F0',
      valign: 'top',
    });
  });

  // Live Access Box
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.9,
    y: 3.6,
    w: 8.2,
    h: 1.35,
    rectRadius: 0.1,
    fill: { color: '0D2417' },
    line: { color: COLOR.GOLD, width: 1 },
  });

  s.addText('🔗 Akses Live Aplikasi:  https://kartikasari-pos-crm.vercel.app', {
    x: 1.1,
    y: 3.75,
    w: 7.8,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: 'FBBF24',
  });

  s.addText('📂 Repositori GitHub:  https://github.com/fanza4/kartikasari-pos-crm\n👤 Presenter: Muhammad Fanza Yuseftian  •  Mie Baso & Aneka Jus Kartika Sari Garut\nTerima Kasih Banyak • Sesi Tanya Jawab (Q&A) Dibuka', {
    x: 1.1,
    y: 4.1,
    w: 7.8,
    h: 0.75,
    fontSize: 9.5,
    fontFace: 'Calibri',
    color: COLOR.WHITE,
  });

  s.addNotes(
    'Sebagai penutup, sistem digital yang kami bangun ini membuktikan bahwa UMKM kuliner lokal seperti Mie Baso Kartika Sari Garut dapat bertransformasi menjadi bisnis modern yang efisien dan berdaya saing tinggi tanpa perlu membeli perangkat keras yang mahal. Aplikasi ini telah aktif secara live di Vercel dan siap mendampingi operasional rumah makan setiap hari. Terima kasih atas perhatian bapak/ibu sekalian, sesi tanya jawab sekarang saya buka.'
  );
}

// ==========================================
// SANITIZE & GENERATE PPTX FILE
// ==========================================
const outputPath = path.resolve(__dirname, '../Presentasi_Detail_Mie_Baso_Kartika_Sari.pptx');

console.log('Generating detailed 21-slide presentation...');
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
      console.log('  -> Patched notesMaster1.xml successfully.');
    }

    // 2. Remove phantom empty directories flagged by PowerPoint
    const emptyDirs = ['ppt/charts/', 'ppt/charts/_rels/', 'ppt/embeddings/'];
    for (const dir of emptyDirs) {
      if (zip.files[dir]) {
        zip.remove(dir);
        console.log(`  -> Removed phantom empty directory: ${dir}`);
      }
    }

    const cleanBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    fs.writeFileSync(outputPath, cleanBuffer);
    console.log(`✅ File presentasi detail (21 Slide) berhasil dibuat dan disanitasi di: ${outputPath} (${cleanBuffer.length} bytes)`);
  })
  .catch((err) => {
    console.error('❌ Gagal membuat presentasi detail:', err);
    process.exit(1);
  });
