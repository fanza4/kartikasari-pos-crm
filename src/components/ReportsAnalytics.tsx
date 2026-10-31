import React, { useState } from 'react';
import { getTransactions, formatRupiah, formatDateIndo } from '../services/storage';
import { Transaction } from '../types';
import { BarChart3, TrendingUp, CreditCard, Banknote, Calendar, ArrowUpRight, DollarSign, Receipt, PieChart } from 'lucide-react';

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
