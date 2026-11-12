const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const JSZip = require('jszip');

const BASE_URL = 'https://kartikasari-pos-crm.vercel.app';
const LOGO_PATH = path.resolve(__dirname, '../presentation_assets/logo_kartikasari.jpg');

const OUTPUT_DIRS = [
  path.resolve(__dirname, '../public/table_qr'),
  'C:/Users/mfanz/Downloads/Tugas CRM APK/TUGAS FANZA CRM/QR_Meja_Makan',
];

// Ensure directories exist
OUTPUT_DIRS.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const tables = [
  { id: '01', name: 'MEJA 01', url: `${BASE_URL}/?table=01` },
  { id: '02', name: 'MEJA 02', url: `${BASE_URL}/?table=02` },
  { id: '03', name: 'MEJA 03', url: `${BASE_URL}/?table=03` },
  { id: '04', name: 'MEJA 04', url: `${BASE_URL}/?table=04` },
  { id: '05', name: 'MEJA 05', url: `${BASE_URL}/?table=05` },
  { id: '06', name: 'MEJA 06', url: `${BASE_URL}/?table=06` },
  { id: '07', name: 'MEJA 07', url: `${BASE_URL}/?table=07` },
  { id: '08', name: 'MEJA 08', url: `${BASE_URL}/?table=08` },
  { id: '09', name: 'MEJA 09', url: `${BASE_URL}/?table=09` },
  { id: '10', name: 'MEJA 10', url: `${BASE_URL}/?table=10` },
  { id: 'umum', name: 'MEJA MAKAN', url: `${BASE_URL}/` },
];

async function generateQRCodes() {
  console.log('Generating Table QR Codes...');
  const qrDataUrls = {};

  for (const t of tables) {
    // High-resolution QR Code (PNG)
    const qrBuffer = await QRCode.toBuffer(t.url, {
      width: 1000,
      margin: 2,
      color: {
        dark: '#143823', // Brand Forest Green
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    const dataUrl = await QRCode.toDataURL(t.url, {
      width: 600,
      margin: 2,
      color: {
        dark: '#143823',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    qrDataUrls[t.id] = dataUrl;

    OUTPUT_DIRS.forEach((dir) => {
      const fileName = `QR_Meja_${t.id}.png`;
      fs.writeFileSync(path.join(dir, fileName), qrBuffer);
    });
    console.log(`✓ Generated QR for ${t.name} -> ${t.url}`);
  }

  // 1. Generate Printable HTML (A4 / A5 / Stand-up Tent Card layout)
  console.log('Generating Printable HTML Tent Cards...');
  const logoBase64 = fs.existsSync(LOGO_PATH)
    ? `data:image/jpeg;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`
    : '';

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Cetak QR Meja Makan - Mie Baso Kartika Sari Garut</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      padding: 20px;
    }

    .toolbar {
      max-width: 900px;
      margin: 0 auto 24px auto;
      background: white;
      padding: 16px 24px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .toolbar h1 {
      font-size: 18px;
      font-weight: 800;
      color: #143823;
    }
    .toolbar p {
      font-size: 12px;
      color: #64748b;
    }
    .print-btn {
      background: #143823;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .print-btn:hover {
      background: #166534;
      transform: translateY(-1px);
    }

    .cards-grid {
      max-width: 900px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
    }

    /* Individual Tent Card (Stand Meja) */
    .table-card {
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(20, 56, 35, 0.08);
      border: 3px solid #143823;
      position: relative;
      display: flex;
      flex-direction: column;
      page-break-inside: avoid;
    }

    .card-header {
      background: linear-gradient(135deg, #143823 0%, #166534 100%);
      color: white;
      padding: 20px 16px 16px 16px;
      text-align: center;
      position: relative;
    }
    .card-header .logo-img {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border: 2px solid #fef3c7;
      margin-bottom: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    .card-header h2 {
      font-size: 17px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #fef3c7;
    }
    .card-header p {
      font-size: 10px;
      color: #e2e8f0;
      margin-top: 2px;
    }

    .table-badge {
      display: inline-block;
      background: #d97706;
      color: white;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 1px;
      padding: 6px 20px;
      border-radius: 999px;
      margin: -14px auto 0 auto;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35);
      border: 2px solid white;
      position: relative;
      z-index: 2;
    }

    .card-body {
      padding: 18px 24px 20px 24px;
      text-align: center;
      background: #ffffff;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .callout-title {
      font-size: 15px;
      font-weight: 800;
      color: #143823;
      margin-top: 4px;
    }
    .callout-sub {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 12px;
    }

    .qr-container {
      background: #f8fafc;
      padding: 12px;
      border-radius: 20px;
      border: 2px dashed #cbd5e1;
      display: inline-block;
      margin-bottom: 14px;
    }
    .qr-container img {
      width: 190px;
      height: 190px;
      display: block;
      border-radius: 8px;
    }

    .steps-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 14px;
      padding: 10px 14px;
      width: 100%;
      text-align: left;
      font-size: 10.5px;
      color: #92400e;
      line-height: 1.5;
      margin-bottom: 12px;
    }
    .steps-box b {
      color: #78350f;
    }

    .promo-banner {
      background: #143823;
      color: #fef3c7;
      padding: 8px 12px;
      border-radius: 12px;
      width: 100%;
      font-size: 10px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .card-footer {
      background: #f8fafc;
      padding: 10px 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 9px;
      color: #64748b;
      text-align: center;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @media print {
      body { background: white; padding: 0; }
      .toolbar { display: none; }
      .cards-grid {
        display: block;
      }
      .table-card {
        page-break-after: always;
        width: 100%;
        max-width: 420px;
        margin: 20px auto;
        box-shadow: none;
        border: 2px solid #143823;
      }
    }
  </style>
</head>
<body>

  <div class="toolbar">
    <div>
      <h1>Stand QR Meja Makan • Mie Baso Kartika Sari Garut</h1>
      <p>10 Meja Makan (Meja 01 s/d 10) + Meja Umum. Klik tombol Cetak untuk print ke kertas / stiker acrylic.</p>
    </div>
    <button class="print-btn" onclick="window.print()">
      🖨️ Cetak Semua QR Meja (Ctrl + P)
    </button>
  </div>

  <div class="cards-grid">
    ${tables
      .map(
        (t) => `
    <div class="table-card">
      <div class="card-header">
        ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Logo">` : ''}
        <h2>Mie Baso Kartika Sari</h2>
        <p>Jl. Otista No. 127 Paseban, Garut</p>
      </div>

      <div class="table-badge">${t.name}</div>

      <div class="card-body">
        <div class="callout-title">Pesan Mandiri Praktis Tanpa Antre</div>
        <div class="callout-sub">Scan QR Code di bawah menggunakan kamera smartphone Anda</div>

        <div class="qr-container">
          <img src="${qrDataUrls[t.id]}" alt="QR Code ${t.name}">
        </div>

        <div class="steps-box">
          <b>Cara Pesan Cepat:</b><br>
          1. Arahkan kamera HP ke QR Code di atas<br>
          2. Pilih menu mie & racik topping favorit<br>
          3. Bayar di kasir / scan QRIS & tunggu pesanan diantar!
        </div>

        <div class="promo-banner">
          🎁 Program Stempel: 10 Stempel = 1 Porsi Mie GRATIS!
        </div>
      </div>

      <div class="card-footer">
        <span>📶 Wi-Fi Toko: Mie Baso Kartika Sari</span>
        <span>Akses: kartikasari-pos-crm.vercel.app</span>
      </div>
    </div>
    `
      )
      .join('\n')}
  </div>

</body>
</html>`;

  OUTPUT_DIRS.forEach((dir) => {
    const htmlPath = path.join(dir, 'Cetak_QR_Meja_Mie_Baso_Kartika_Sari.html');
    fs.writeFileSync(htmlPath, htmlContent);
  });
  console.log('✓ Generated Printable HTML tent card file.');

  // 2. Generate PowerPoint Slide Deck for Table Stands
  console.log('Generating PowerPoint Table Stand Deck...');
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = 'Stand QR Meja Makan - Mie Baso Kartika Sari Garut';
  pres.author = 'Muhammad Fanza Yuseftian';

  for (const t of tables) {
    const slide = pres.addSlide();
    slide.background = { color: 'F8FAFC' };

    // Outer Card Border Container
    slide.addShape(pres.ShapeType.roundRect, {
      x: 2.2,
      y: 0.3,
      w: 5.6,
      h: 5.0,
      rectRadius: 0.15,
      fill: { color: 'FFFFFF' },
      line: { color: '143823', width: 2.5 },
    });

    // Top Header Banner
    slide.addShape(pres.ShapeType.rect, {
      x: 2.2,
      y: 0.3,
      w: 5.6,
      h: 1.15,
      fill: { color: '143823' },
      line: { color: '143823' },
    });

    // Brand Logo
    if (fs.existsSync(LOGO_PATH)) {
      slide.addImage({
        path: LOGO_PATH,
        x: 2.45,
        y: 0.42,
        w: 0.85,
        h: 0.85,
        rounding: true,
      });
    }

    slide.addText('MIE BASO & ANEKA JUS KARTIKA SARI', {
      x: 3.45,
      y: 0.42,
      w: 4.1,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Calibri',
      bold: true,
      color: 'FEF3C7',
      valign: 'middle',
    });

    slide.addText('Jl. Otista No. 127 Paseban, Garut • Resep Asli Kuliner Garut', {
      x: 3.45,
      y: 0.77,
      w: 4.1,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: 'E2E8F0',
      valign: 'top',
    });

    // Table Pill Badge
    slide.addShape(pres.ShapeType.roundRect, {
      x: 3.8,
      y: 1.25,
      w: 2.4,
      h: 0.38,
      rectRadius: 0.19,
      fill: { color: 'D97706' },
      line: { color: 'FFFFFF', width: 1.5 },
    });
    slide.addText(t.name, {
      x: 3.8,
      y: 1.25,
      w: 2.4,
      h: 0.38,
      fontSize: 12,
      fontFace: 'Calibri',
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
    });

    slide.addText('SCAN QR DI BAWAH UNTUK PESAN LANGSUNG', {
      x: 2.3,
      y: 1.72,
      w: 5.4,
      h: 0.25,
      fontSize: 10.5,
      fontFace: 'Calibri',
      bold: true,
      color: '143823',
      align: 'center',
    });

    // QR Code Image
    const qrFilePath = path.join(OUTPUT_DIRS[0], `QR_Meja_${t.id}.png`);
    if (fs.existsSync(qrFilePath)) {
      slide.addImage({
        path: qrFilePath,
        x: 3.85,
        y: 2.02,
        w: 2.3,
        h: 2.3,
      });
    }

    // Step Guide Box
    slide.addShape(pres.ShapeType.roundRect, {
      x: 2.45,
      y: 4.42,
      w: 5.1,
      h: 0.65,
      rectRadius: 0.08,
      fill: { color: 'FEF3C7' },
      line: { color: 'D97706', width: 1 },
    });
    slide.addText(
      '📱 1. Scan dengan Kamera HP   •   🍲 2. Pilih Menu & Topping   •   💳 3. Bayar di Kasir / QRIS\n🎁 Kumpulkan 10 Stempel Loyalitas & Dapatkan 1 Porsi Mie GRATIS!',
      {
        x: 2.5,
        y: 4.45,
        w: 5.0,
        h: 0.58,
        fontSize: 8.5,
        fontFace: 'Calibri',
        color: '92400E',
        align: 'center',
        valign: 'middle',
      }
    );
  }

  const pptxBuffer = await pres.write('nodebuffer');
  const zip = await JSZip.loadAsync(pptxBuffer);

  // Sanitize notesMaster1.xml
  if (zip.files['ppt/notesMasters/notesMaster1.xml']) {
    let nm = await zip.files['ppt/notesMasters/notesMaster1.xml'].async('string');
    const cleanSpTree =
      '<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree>';
    nm = nm.replace(/<p:spTree>[\s\S]*?<\/p:spTree>/, cleanSpTree);
    zip.file('ppt/notesMasters/notesMaster1.xml', nm);
  }

  // Remove empty directories
  ['ppt/charts/', 'ppt/charts/_rels/', 'ppt/embeddings/'].forEach((d) => {
    if (zip.files[d]) zip.remove(d);
  });

  const cleanPptx = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  OUTPUT_DIRS.forEach((dir) => {
    fs.writeFileSync(path.join(dir, 'Template_Stand_Meja_Kartika_Sari.pptx'), cleanPptx);
  });
  console.log('✓ Generated PowerPoint Table Stand Deck.');

  console.log('✅ ALL TABLE QR CODES GENERATED SUCCESSFULLY!');
}

generateQRCodes().catch(console.error);
