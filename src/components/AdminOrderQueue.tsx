import React, { useState } from 'react';
import { useCustomerOrder } from '../context/CustomerOrderContext';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { formatRupiah, formatDateIndo, getStoreSettings, getOrderReceiptWhatsAppUrl } from '../services/storage';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  QrCode,
  Flame,
  Bell,
  Check,
  XCircle,
  Search,
  Filter,
  Share2,
  Printer,
  ChevronDown,
  RefreshCw,
  UtensilsCrossed,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminOrderQueue: React.FC = () => {
  const { orders, updateStatus, confirmPayment, refreshOrders, newOrderCount } = useCustomerOrder();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshOrders();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const settings = getStoreSettings();

  const filterTabs = [
    { id: 'all', label: 'Semua Pesanan', count: orders.length },
    {
      id: 'pending_payment',
      label: 'Menunggu Pembayaran',
      count: orders.filter((o) => o.paymentStatus === 'Menunggu Pembayaran' && o.orderStatus !== 'Dibatalkan').length,
    },
    {
      id: 'paid',
      label: 'Sudah Dibayar',
      count: orders.filter((o) => o.paymentStatus === 'Sudah Dibayar' && o.orderStatus !== 'Selesai' && o.orderStatus !== 'Dibatalkan').length,
    },
    {
      id: 'processing',
      label: 'Sedang Diproses',
      count: orders.filter((o) => o.orderStatus === 'Sedang Diproses').length,
    },
    {
      id: 'ready',
      label: 'Siap Diambil',
      count: orders.filter((o) => o.orderStatus === 'Siap Diambil').length,
    },
    {
      id: 'completed',
      label: 'Selesai',
      count: orders.filter((o) => o.orderStatus === 'Selesai').length,
    },
    {
      id: 'cancelled',
      label: 'Dibatalkan',
      count: orders.filter((o) => o.orderStatus === 'Dibatalkan').length,
    },
  ];

  // Filtering
  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (selectedFilter === 'pending_payment') {
      if (order.paymentStatus !== 'Menunggu Pembayaran' || order.orderStatus === 'Dibatalkan') return false;
    } else if (selectedFilter === 'paid') {
      if (order.paymentStatus !== 'Sudah Dibayar' || order.orderStatus === 'Selesai' || order.orderStatus === 'Dibatalkan') return false;
    } else if (selectedFilter === 'processing') {
      if (order.orderStatus !== 'Sedang Diproses') return false;
    } else if (selectedFilter === 'ready') {
      if (order.orderStatus !== 'Siap Diambil') return false;
    } else if (selectedFilter === 'completed') {
      if (order.orderStatus !== 'Selesai') return false;
    } else if (selectedFilter === 'cancelled') {
      if (order.orderStatus !== 'Dibatalkan') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchId = order.id.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchName && !matchId && !matchItem) return false;
    }

    return true;
  });

  const showNotice = (msg: string) => {
    setActionSuccessNotice(msg);
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  // 1. Kasir Terima Tunai
  const handleConfirmCashPayment = (orderId: string) => {
    const updated = confirmPayment(orderId, 'cash');
    if (updated) {
      showNotice(`Pembayaran tunai ${updated.id} berhasil dikonfirmasi! Pesanan diteruskan ke dapur.`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  // 2. Majukan status pengerjaan dapur
  const handleAdvanceStatus = (order: Order, nextStatus: OrderStatus) => {
    if (order.paymentStatus !== 'Sudah Dibayar' && nextStatus === 'Sedang Diproses') {
      alert('Peringatan: Pesanan yang belum dibayar tidak boleh masuk ke proses pengerjaan!');
      return;
    }

    const updated = updateStatus(order.id, nextStatus);
    if (updated) {
      if (nextStatus === 'Siap Diambil') {
        showNotice(`Pesanan ${updated.customerName} SIAP DIAMBIL di counter!`);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else if (nextStatus === 'Selesai') {
        showNotice(`Pesanan ${updated.id} selesai & dicatat ke sistem CRM.`);
      } else {
        showNotice(`Status pesanan ${updated.id} diubah ke ${nextStatus}.`);
      }
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      updateStatus(orderId, 'Dibatalkan');
      showNotice(`Pesanan ${orderId} telah dibatalkan.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Notice */}
      {actionSuccessNotice && (
        <div className="fixed top-20 right-6 z-50 bg-forest-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-forest-700 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-gold-400" />
          <p className="text-xs font-bold">{actionSuccessNotice}</p>
        </div>
      )}

      {/* Header & Alert Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Cloud Real-Time
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Antrean Pesanan Masuk (Order Queue)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pesanan dari HP pelanggan langsung tersinkronisasi otomatis secara instan tanpa jeda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {newOrderCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 text-amber-900 border border-amber-300 font-extrabold text-xs animate-pulse">
              <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>{newOrderCount} Pesanan Baru Butuh Tindakan</span>
            </div>
          )}

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            title="Refresh Antrean Cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-forest-700' : ''}`} />
            <span>{isRefreshing ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-forest-800 text-white shadow-md shadow-forest-800/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama pelanggan, ID pesanan, atau menu..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-sm"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      </div>

      {/* Order Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Tidak Ada Pesanan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Belum ada pesanan pada filter ini. Pesanan baru dari pelanggan akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isPaid = order.paymentStatus === 'Sudah Dibayar';
            const isProcessing = order.orderStatus === 'Sedang Diproses';
            const isReady = order.orderStatus === 'Siap Diambil';
            const isCompleted = order.orderStatus === 'Selesai';
            const isCancelled = order.orderStatus === 'Dibatalkan';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${
                  isReady
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : isProcessing
                    ? 'border-forest-400'
                    : !isPaid
                    ? 'border-amber-300'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {order.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {formatDateIndo(order.createdAt)}
                    </span>
                  </div>

                  {/* Customer Name */}
                  <div className="flex items-start justify-between gap-2 mt-1">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                        {order.customerName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {order.orderType === 'dine_in' ? (
                            <>
                              <UtensilsCrossed className="w-3 h-3 text-forest-700" />
                              <span>Makan di Tempat {order.tableNumber ? `(${order.tableNumber})` : ''}</span>
                            </>
                          ) : (
                            <>
                              <Package className="w-3 h-3 text-amber-700" />
                              <span>Bawa Pulang (Takeaway)</span>
                            </>
                          )}
                        </span>
                        {order.customerWhatsapp && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {order.customerWhatsapp}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Status Badge */}
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border block ${
                          isReady
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                            : isProcessing
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : isCompleted
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : isCancelled
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Payment Info Badge */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      {order.paymentMethod === 'cash' ? (
                        <Banknote className="w-4 h-4 text-slate-600" />
                      ) : (
                        <QrCode className="w-4 h-4 text-forest-800" />
                      )}
                      <span className="uppercase text-slate-800">{order.paymentMethod}</span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  {/* Menu Items List */}
                  <div className="mt-3 space-y-1.5 py-2 border-t border-b border-slate-100 text-xs">
                    {order.items.map((item) => (
                      <div key={item.cartItemId} className="flex justify-between items-start">
                        <div className="pr-2">
                          <span className="font-extrabold text-slate-800">
                            {item.quantity}x {item.name}
                          </span>
                          {item.selectedToppings.length > 0 && (
                            <p className="text-[10px] text-slate-500">
                              +{item.selectedToppings.map((t) => t.name).join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-[10px] text-amber-700 italic">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-slate-700 whitespace-nowrap">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total Amount */}
                  <div className="mt-2 flex justify-between items-baseline font-black">
                    <span className="text-xs text-slate-500">Total Tagihan:</span>
                    <span className="text-base text-forest-800">
                      {formatRupiah(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  
                  {/* Action 1: CASH PAYMENT CONFIRMATION (If not paid) */}
                  {!isPaid && !isCancelled && order.paymentMethod === 'cash' && (
                    <button
                      onClick={() => handleConfirmCashPayment(order.id)}
                      className="w-full py-2.5 px-3 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-[0.99] text-white text-xs font-extrabold shadow-md shadow-forest-800/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <Banknote className="w-4 h-4 text-gold-400" />
                      <span>Terima Tunai & Mulai Proses ({formatRupiah(order.totalAmount)})</span>
                    </button>
                  )}

                  {/* Action 1b: QRIS PAYMENT CONFIRMATION (If not paid) */}
                  {!isPaid && !isCancelled && order.paymentMethod === 'qris' && (
                    <button
                      onClick={() => {
                        confirmPayment(order.id, 'qris');
                        showNotice(`Pembayaran QRIS ${order.id} diverifikasi manual oleh kasir!`);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-[0.99] text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-gold-400" />
                      <span>Konfirmasi Verifikasi QRIS Valid</span>
                    </button>
                  )}

                  {/* Action 2: WORKFLOW STAGES (Only available when paid!) */}
                  {isPaid && !isCompleted && !isCancelled && (
                    <div className="grid grid-cols-2 gap-2">
                      {order.orderStatus !== 'Sedang Diproses' && order.orderStatus !== 'Siap Diambil' && (
                        <button
                          onClick={() => handleAdvanceStatus(order, 'Sedang Diproses')}
                          className="col-span-2 py-2 px-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Flame className="w-4 h-4 text-gold-400" />
                          <span>Mulai Diproses Dapur</span>
                        </button>
                      )}

                      {order.orderStatus === 'Sedang Diproses' && (
                        <button
                          onClick={() => handleAdvanceStatus(order, 'Siap Diambil')}
                          className="col-span-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-forest-700 hover:from-emerald-700 hover:to-forest-800 text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <Bell className="w-4 h-4 text-gold-300" />
                          <span>Tandai Siap Diambil di Counter</span>
                        </button>
                      )}

                      {order.orderStatus === 'Siap Diambil' && (
                        <button
                          onClick={() => handleAdvanceStatus(order, 'Selesai')}
                          className="col-span-2 py-2.5 px-3 rounded-xl bg-forest-900 hover:bg-black text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Selesaikan Pesanan</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Warning if trying to process unpaid order */}
                  {!isPaid && !isCancelled && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg text-center font-medium border border-amber-200">
                      ⚠️ Pesanan belum dibayar tidak boleh diproses ke dapur.
                    </div>
                  )}

                  {/* Share Struk WhatsApp / Batal button */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <a
                      href={getOrderReceiptWhatsAppUrl(order, settings)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Kirim Struk WA</span>
                    </a>

                    {!isCompleted && !isCancelled && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-slate-400 hover:text-rose-600 font-semibold"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
