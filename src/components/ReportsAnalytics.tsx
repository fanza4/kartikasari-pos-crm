import React, { useState } from 'react';
import { getTransactions, formatRupiah, formatDateIndo } from '../services/storage';
import { Transaction } from '../types';
import { BarChart3, TrendingUp, CreditCard, Banknote, Calendar, ArrowUpRight, DollarSign, Receipt, PieChart, FileSpreadsheet, Printer, Download } from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<'today' | '7days' | '30days'>('today');
  const transactions = getTransactions();

  // Filter transactions by period
  const now = Date.now();
  const filteredTx = transactions.filter((tx) => {
    const txTime = new Date(tx.createdAt).getTime();
    if (period === 'today') {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      return txTime >= todayStart;
    }
    if (period === '7days') {
      return txTime >= now - 7 * 24 * 60 * 60 * 1000;
    }
    if (period === '30days') {
      return txTime >= now - 30 * 24 * 60 * 60 * 1000;
    }
    return true;
  });

  const periodLabel = period === 'today' ? 'Hari Ini' : period === '7days' ? '7 Hari Terakhir' : '30 Hari Terakhir';

  // Calculate metrics
  const totalRevenue = filteredTx.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalCount = filteredTx.length;
  const aov = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

  // Cash vs QRIS reconciliation
  const cashTx = filteredTx.filter((tx) => tx.paymentMethod === 'cash');
  const qrisTx = filteredTx.filter((tx) => tx.paymentMethod === 'qris');

  const cashTotal = cashTx.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const qrisTotal = qrisTx.reduce((sum, tx) => sum + tx.totalAmount, 0);

  const cashPercentage = totalRevenue > 0 ? Math.round((cashTotal / totalRevenue) * 100) : 0;
  const qrisPercentage = totalRevenue > 0 ? 100 - cashPercentage : 0;

  // Best-selling menu Pareto
  const itemCounts: { [name: string]: { count: number; revenue: number } } = {};
  filteredTx.forEach((tx) => {
    tx.items.forEach((item) => {
      const name = item.menuItem.name;
      if (!itemCounts[name]) {
        itemCounts[name] = { count: 0, revenue: 0 };
      }
      itemCounts[name].count += item.quantity;
      itemCounts[name].revenue += item.itemTotal;
    });
  });

  const paretoItems = Object.entries(itemCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 1. Ekspor ke CSV (Spreadsheet Excel)
  const handleExportCSV = () => {
    if (filteredTx.length === 0) {
      alert('Belum ada transaksi untuk diekspor pada periode ini.');
      return;
    }

    const headers = [
      'No. Nota',
      'Tanggal & Waktu',
      'Nama Pelanggan',
      'No. WhatsApp',
      'Metode Pembayaran',
      'Rincian Menu',
      'Total Omset (Rp)',
      'Stempel Diperoleh',
    ];

    const escapeCsv = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = filteredTx.map((tx) => {
      const itemsSummary = tx.items
        .map((i) => {
          const topStr = i.selectedToppings?.length ? ` (+${i.selectedToppings.map((t) => t.name).join(', ')})` : '';
          return `${i.quantity}x ${i.menuItem.name}${topStr}`;
        })
        .join('; ');

      return [
        escapeCsv(tx.invoiceNumber),
        escapeCsv(formatDateIndo(tx.createdAt)),
        escapeCsv(tx.customerName || 'Tamu Kasir'),
        escapeCsv(tx.customerWhatsapp || tx.customerPhone || '-'),
        escapeCsv(tx.paymentMethod.toUpperCase()),
        escapeCsv(itemsSummary),
        escapeCsv(tx.totalAmount),
        escapeCsv(tx.stampsEarned || 0),
      ].join(',');
    });

    const totalStamps = filteredTx.reduce((sum, tx) => sum + (tx.stampsEarned || 0), 0);
    const summaryRow = [
      'TOTAL OMSET KESELURUHAN',
      escapeCsv(periodLabel),
      escapeCsv(`${totalCount} Nota`),
      '',
      '',
      '',
      escapeCsv(totalRevenue),
      escapeCsv(totalStamps),
    ].join(',');

    const csvContent = '\uFEFF' + [headers.join(','), ...rows, summaryRow].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Penjualan_Kartika_Sari_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Ekspor ke PDF (Print-to-PDF Window)
  const handleExportPDF = () => {
    if (filteredTx.length === 0) {
      alert('Belum ada transaksi untuk diekspor pada periode ini.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan browser Anda mengizinkan pop-up.');
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Laporan Penjualan - Mie Baso Kartika Sari</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; font-size: 10pt; line-height: 1.4; }
          .header { text-align: center; border-bottom: 3px double #166534; padding-bottom: 12px; margin-bottom: 18px; }
          .store-name { font-size: 18pt; font-weight: 900; color: #166534; margin: 0; letter-spacing: -0.5px; }
          .store-sub { font-size: 9pt; color: #64748b; margin-top: 3px; }
          .report-title { font-size: 13pt; font-weight: 800; color: #0f172a; margin: 14px 0 2px; text-transform: uppercase; }
          .report-meta { font-size: 9pt; color: #475569; }
          
          .kpi-container { display: flex; gap: 10px; margin-bottom: 20px; }
          .kpi-box { flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; background: #f8fafc; text-align: center; }
          .kpi-title { font-size: 7.5pt; text-transform: uppercase; font-weight: 700; color: #64748b; }
          .kpi-value { font-size: 12pt; font-weight: 900; color: #166534; margin-top: 3px; }
          
          h3 { font-size: 10pt; font-weight: 800; color: #0f172a; margin: 16px 0 6px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 9pt; }
          th { background: #f1f5f9; color: #334155; text-align: left; padding: 6px 8px; font-weight: 700; border: 1px solid #cbd5e1; font-size: 8pt; text-transform: uppercase; }
          td { padding: 6px 8px; border: 1px solid #e2e8f0; vertical-align: top; }
          tr:nth-child(even) td { background: #fcfcfc; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 7pt; font-weight: 700; text-transform: uppercase; }
          .badge-cash { background: #dcfce7; color: #166534; }
          .badge-qris { background: #fef3c7; color: #92400e; }
          .total-row td { font-weight: 900; background: #f1f5f9; font-size: 9.5pt; border-top: 2px solid #94a3b8; }
          
          .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 8.5pt; color: #64748b; page-break-inside: avoid; }
          .sign-box { text-align: center; width: 160px; }
          .sign-line { margin-top: 45px; border-top: 1px solid #64748b; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">MIE BASO KARTIKA SARI (KS)</div>
          <div class="store-sub">Jln. Otista No 127 Paseban (Depan Rumah Beku), Garut Satu, Jawa Barat • WhatsApp: 08122334455</div>
          <div class="report-title">Laporan Penjualan & Analitik Toko</div>
          <div class="report-meta">Periode: <strong>${periodLabel}</strong> • Dicetak: ${formatDateIndo(new Date().toISOString())}</div>
        </div>

        <div class="kpi-container">
          <div class="kpi-box">
            <div class="kpi-title">Total Omset</div>
            <div class="kpi-value">${formatRupiah(totalRevenue)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-title">Jumlah Transaksi</div>
            <div class="kpi-value">${totalCount} Nota</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-title">Uang Tunai (Cash)</div>
            <div class="kpi-value">${formatRupiah(cashTotal)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-title">Non-Tunai (QRIS)</div>
            <div class="kpi-value">${formatRupiah(qrisTotal)}</div>
          </div>
        </div>

        <h3>Menu Terlaris (Top 5 Pareto)</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 30px;" class="text-center">No</th>
              <th>Nama Menu</th>
              <th class="text-right" style="width: 100px;">Jumlah Porsi</th>
              <th class="text-right" style="width: 140px;">Total Omset</th>
            </tr>
          </thead>
          <tbody>
            ${paretoItems.map((item, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td><strong>${item.name}</strong></td>
                <td class="text-right">${item.count} porsi</td>
                <td class="text-right">${formatRupiah(item.revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Rincian Nota Penjualan (${filteredTx.length} Transaksi)</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 90px;">No. Nota</th>
              <th style="width: 120px;">Waktu</th>
              <th>Pelanggan</th>
              <th style="width: 60px;" class="text-center">Metode</th>
              <th>Rincian Item</th>
              <th class="text-right" style="width: 100px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTx.map(tx => {
              const itemsList = tx.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ');
              return `
                <tr>
                  <td><strong>${tx.invoiceNumber}</strong></td>
                  <td>${formatDateIndo(tx.createdAt)}</td>
                  <td>${tx.customerName || 'Tamu Kasir'}</td>
                  <td class="text-center">
                    <span class="badge ${tx.paymentMethod === 'cash' ? 'badge-cash' : 'badge-qris'}">
                      ${tx.paymentMethod.toUpperCase()}
                    </span>
                  </td>
                  <td><small>${itemsList}</small></td>
                  <td class="text-right"><strong>${formatRupiah(tx.totalAmount)}</strong></td>
                </tr>
              `;
            }).join('')}
            <tr class="total-row">
              <td colspan="5" class="text-right">TOTAL OMSET:</td>
              <td class="text-right">${formatRupiah(totalRevenue)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div>
            Dicetak otomatis dari Sistem Kasir POS & CRM Toko Mie Baso Kartika Sari Garut.<br>
            Dokumen resmi rekonsiliasi keuangan kasir & owner toko.
          </div>
          <div class="sign-box">
            <div>Pengelola Toko,</div>
            <div class="sign-line"></div>
            <div>Mie Baso Kartika Sari</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Period Filter */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-forest-800" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Laporan Penjualan & Analitik Toko
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekonsiliasi omset harian, pembayaran Cash vs QRIS, dan evaluasi menu terlaris.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === 'today'
                  ? 'bg-forest-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setPeriod('7days')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === '7days'
                  ? 'bg-forest-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => setPeriod('30days')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === '30days'
                  ? 'bg-forest-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Hari Terakhir
            </button>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold shadow-sm transition-all active:scale-95"
              title="Unduh Data Penjualan ke Format CSV (Excel)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-extrabold shadow-md shadow-forest-800/20 transition-all active:scale-95"
              title="Cetak atau Simpan Laporan sebagai Dokumen PDF Resmi"
            >
              <Printer className="w-4 h-4 text-gold-400" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Total Omset */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Total Omset</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatRupiah(totalRevenue)}
            </h3>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>{totalCount} transaksi tercatat</span>
            </span>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-700 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Jumlah Transaksi</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {totalCount} Nota
            </h3>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
              Volume penjualan periode ini
            </span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Rata-rata Nota (AOV)</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatRupiah(aov)}
            </h3>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
              Rata-rata belanja per pelanggan
            </span>
          </div>
        </div>

      </div>

      {/* Two-Column: Cash vs QRIS & Best-Selling Pareto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Cash vs QRIS Reconciliation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-forest-800" />
                <span>Rekonsiliasi Cash vs QRIS</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemisahan uang tunai fisik di laci kasir vs saldo bank QRIS.
              </p>
            </div>
          </div>

          {/* Bar comparison visualization */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full transition-all duration-700"
                style={{ width: `${cashPercentage}%` }}
                title={`Tunai: ${cashPercentage}%`}
              ></div>
              <div
                className="bg-gold-500 h-full transition-all duration-700"
                style={{ width: `${qrisPercentage}%` }}
                title={`QRIS: ${qrisPercentage}%`}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span className="text-emerald-700">Tunai: {cashPercentage}%</span>
              <span className="text-amber-700">QRIS: {qrisPercentage}%</span>
            </div>
          </div>

          {/* Detail Cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                <Banknote className="w-4 h-4" />
                <span>Uang Tunai (Cash)</span>
              </div>
              <p className="text-lg font-black text-emerald-950">
                {formatRupiah(cashTotal)}
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {cashTx.length} transaksi fisik
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
                <CreditCard className="w-4 h-4" />
                <span>Non-Tunai (QRIS)</span>
              </div>
              <p className="text-lg font-black text-amber-950">
                {formatRupiah(qrisTotal)}
              </p>
              <span className="text-[10px] text-amber-700 font-semibold">
                {qrisTx.length} transaksi digital
              </span>
            </div>
          </div>
        </div>

        {/* Right: Best-Selling Menu Pareto Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-forest-800" />
              <span>Menu Terlaris (Pareto Analisis)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              5 menu dengan penjualan tertinggi untuk estimasi belanja bahan baku.
            </p>
          </div>

          <div className="space-y-3">
            {paretoItems.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                Belum ada data penjualan pada periode ini.
              </p>
            ) : (
              paretoItems.map((item, idx) => {
                const maxCount = paretoItems[0]?.count || 1;
                const percent = Math.round((item.count / maxCount) * 100);

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-forest-100 text-forest-800 text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span>{item.name}</span>
                      </span>
                      <span className="font-extrabold text-forest-800">
                        {item.count} porsi ({formatRupiah(item.revenue)})
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="bg-forest-700 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Transaction History Log */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
          Riwayat Nota Penjualan Terakhir
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">No. Nota</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3">Metode</th>
                <th className="py-2.5 px-3 text-right">Total Tagihan</th>
                <th className="py-2.5 px-3 text-center">Stempel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada transaksi di periode ini.
                  </td>
                </tr>
              ) : (
                filteredTx.slice(0, 8).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {tx.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {formatDateIndo(tx.createdAt)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {tx.customerName || 'Tamu Kasir'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.paymentMethod === 'cash'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {tx.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-forest-800">
                      {formatRupiah(tx.totalAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                      +{tx.stampsEarned}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
