import React, { useState, useEffect } from 'react';
import { useCustomerOrder } from '../context/CustomerOrderContext';
import { Order, OrderStatus } from '../types';
import {
  formatRupiah,
  formatDateIndo,
  getStoreSettings,
  getOrderReceiptWhatsAppUrl,
} from '../services/storage';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Banknote,
  Utensils,
  Bell,
  Share2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderTrackingModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderAgain: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onOrderAgain,
}) => {
  const { orders, simulateQrisVerification, refreshOrders } = useCustomerOrder();
  const [isVerifyingQris, setIsVerifyingQris] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);
  const [settings, setSettings] = useState(getStoreSettings());

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings(getStoreSettings());
    };
    window.addEventListener('ks_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('ks_settings_updated', handleSettingsUpdate);
  }, []);

  if (!isOpen || !orderId) return null;

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl p-6 max-w-sm text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">Pesanan Tidak Ditemukan</h4>
          <p className="text-xs text-slate-500">ID Pesanan {orderId} tidak terdaftar di sistem.</p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-forest-800 text-white text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  // Stepper logic
  const getStepState = (targetStep: number) => {
    // 1: Menunggu Pembayaran
    // 2: Sedang Diproses
    // 3: Siap Diambil
    // 4: Selesai
    let currentStep = 1;
    if (order.orderStatus === 'Dibatalkan') return 'cancelled';

    if (order.paymentStatus === 'Sudah Dibayar') {
      currentStep = 2;
    }
    if (order.orderStatus === 'Sedang Diproses') {
      currentStep = 2;
    } else if (order.orderStatus === 'Siap Diambil') {
      currentStep = 3;
    } else if (order.orderStatus === 'Selesai') {
      currentStep = 4;
    }

    if (currentStep > targetStep) return 'completed';
    if (currentStep === targetStep) return 'current';
    return 'upcoming';
  };

  const handleSimulateQris = () => {
    setIsVerifyingQris(true);
    setSimulationNotice(null);

    setTimeout(() => {
      const res = simulateQrisVerification(order.id);
      setIsVerifyingQris(false);
      setSimulationNotice(res.message);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    }, 1200);
  };

  const isPaid = order.paymentStatus === 'Sudah Dibayar';
  const isReady = order.orderStatus === 'Siap Diambil';
  const isCompleted = order.orderStatus === 'Selesai';
  const isCancelled = order.orderStatus === 'Dibatalkan';

  const waReceiptUrl = getOrderReceiptWhatsAppUrl(order, settings);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-800 to-forest-900 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-gold-300">
              Live Order Status
            </span>
            <h3 className="text-lg font-black tracking-tight mt-1">{order.id}</h3>
            <p className="text-xs text-forest-200">
              Pemesan: <strong className="text-white">{order.customerName}</strong> • {formatDateIndo(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* READY ALERT BANNER */}
          {isReady && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-forest-700 text-white shadow-lg animate-bounce flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-gold-300 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wide">
                  🍜 PESANAN SUDAH SIAP DIAMBIL!
                </h4>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Silakan menuju counter kasir dan sebutkan nama <strong>{order.customerName}</strong>. Selamat menikmati!
                </p>
              </div>
            </div>
          )}

          {/* CANCELLED BANNER */}
          {isCancelled && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase">Pesanan Dibatalkan</h4>
                <p className="text-[11px] text-rose-600 mt-0.5">
                  Pesanan ini telah dibatalkan oleh kasir atau pelanggan.
                </p>
              </div>
            </div>
          )}

          {/* Visual Status Stepper */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <h4 className="text-xs font-extrabold uppercase text-slate-500 mb-3 text-center">
              Alur Proses Pesanan
            </h4>

            <div className="relative flex items-center justify-between">
              {/* Connecting line */}
              <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0">
                <div
                  className="h-full bg-forest-600 transition-all duration-500"
                  style={{
                    width:
                      isCompleted
                        ? '100%'
                        : isReady
                        ? '70%'
                        : isPaid || order.orderStatus === 'Sedang Diproses'
                        ? '35%'
                        : '5%',
                  }}
                />
              </div>

              {/* Step 1: Bayar */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    getStepState(1) === 'completed'
                      ? 'bg-forest-800 text-white'
                      : getStepState(1) === 'current'
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {getStepState(1) === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                </div>
                <span className="text-[10px] font-bold mt-1 text-slate-700 text-center">
                  Pembayaran
                </span>
                <span className="text-[9px] text-slate-400">
                  {isPaid ? 'Lunas' : 'Menunggu'}
                </span>
              </div>

              {/* Step 2: Dapur */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    getStepState(2) === 'completed'
                      ? 'bg-forest-800 text-white'
                      : getStepState(2) === 'current'
                      ? 'bg-forest-700 text-white ring-4 ring-forest-100 animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {getStepState(2) === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                </div>
                <span className="text-[10px] font-bold mt-1 text-slate-700 text-center">
                  Diproses
                </span>
                <span className="text-[9px] text-slate-400">
                  {order.orderStatus === 'Sedang Diproses' ? 'Dimasak' : 'Dapur'}
                </span>
              </div>

              {/* Step 3: Siap Diambil */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    getStepState(3) === 'completed'
                      ? 'bg-forest-800 text-white'
                      : getStepState(3) === 'current'
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 animate-bounce'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {getStepState(3) === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                </div>
                <span className="text-[10px] font-bold mt-1 text-slate-700 text-center">
                  Siap Diambil
                </span>
                <span className="text-[9px] text-slate-400">Counter</span>
              </div>

              {/* Step 4: Selesai */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    getStepState(4) === 'completed' || isCompleted
                      ? 'bg-forest-800 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold mt-1 text-slate-700 text-center">
                  Selesai
                </span>
                <span className="text-[9px] text-slate-400">Nikmati</span>
              </div>
            </div>
          </div>

          {/* PAYMENT INSTRUCTIONS & VERIFICATIONS */}
          {!isPaid && !isCancelled && (
            <div className="p-5 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 space-y-4">
              
              {/* Method Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {order.paymentMethod === 'cash' ? (
                    <Banknote className="w-5 h-5 text-amber-700" />
                  ) : (
                    <QrCode className="w-5 h-5 text-amber-700" />
                  )}
                  <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">
                    {order.paymentMethod === 'cash'
                      ? 'Menunggu Pembayaran Cash ke Kasir'
                      : 'Menunggu Pembayaran QRIS Digital'}
                  </h4>
                </div>
                <span className="text-xs font-black text-forest-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                  Total: {formatRupiah(order.totalAmount)}
                </span>
              </div>

              {/* CASH SPECIFIC INSTRUCTIONS */}
              {order.paymentMethod === 'cash' && (
                <div className="space-y-2 text-xs text-amber-900 leading-relaxed">
                  <p>
                    Silakan menuju ke meja kasir dan sebutkan:{' '}
                    <strong>Nama "{order.customerName}"</strong> atau{' '}
                    <strong>No. Pesanan "{order.id}"</strong>.
                  </p>
                  <p className="text-[11px] text-amber-800 bg-white/70 p-2.5 rounded-xl border border-amber-200">
                    💡 Kasir akan menerima uang Anda dan mengonfirmasi pesanan di sistem kasir. Begitu pembayaran dikonfirmasi, dapur akan segera mulai memasak pesanan Anda!
                  </p>
                </div>
              )}

              {/* QRIS SPECIFIC PAYMENT & GATEWAY SIMULATOR */}
              {order.paymentMethod === 'qris' && (
                <div className="space-y-4 text-center">
                  <p className="text-xs text-amber-900">
                    Pindai QR Code di bawah menggunakan m-Banking, BCA, GoPay, OVO, Dana, atau ShopeePay:
                  </p>

                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-amber-200 inline-block mx-auto max-w-xs">
                    {/* Official KS QRIS Image or Fallback SVG */}
                    {settings.qrisImageUrl || true ? (
                      <div className="w-56 h-72 mx-auto bg-white rounded-xl p-1.5 flex flex-col items-center justify-center border border-slate-200 relative group overflow-hidden shadow-inner">
                        <img
                          src={settings.qrisImageUrl || '/qris.jpg'}
                          alt="QRIS Resmi Mie Bakso Kartika Sari"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 mx-auto bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-white relative group">
                        <QrCode className="w-32 h-32 text-white" />
                        <div className="absolute inset-x-2 bottom-2 bg-forest-800/90 text-gold-300 py-1 px-2 rounded text-[10px] font-bold">
                          QRIS MIE BAKSO KARTIKA SARI
                        </div>
                      </div>
                    )}
                    <div className="mt-3">
                      <span className="text-[11px] text-slate-500 block">Nominal Tepat:</span>
                      <span className="text-lg font-black text-forest-800">
                        {formatRupiah(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Gateway Simulator Action Button */}
                  <div className="pt-2">
                    <p className="text-[11px] text-slate-500 mb-2">
                      *Mekanisme simulasi konfirmasi webhook payment gateway:
                    </p>
                    <button
                      type="button"
                      disabled={isVerifyingQris}
                      onClick={handleSimulateQris}
                      className="w-full py-3 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isVerifyingQris ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-gold-400" />
                          <span>Menghubungi Payment Gateway...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-gold-400" />
                          <span>Simulasikan Konfirmasi Pembayaran QRIS Berhasil</span>
                        </>
                      )}
                    </button>
                    {simulationNotice && (
                      <p className="text-xs font-bold text-emerald-700 mt-2 animate-fade-in">
                        {simulationNotice}
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* PAID BADGE & NOTIFICATION */}
          {isPaid && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h5 className="text-xs font-black">Pembayaran Lunas ({order.paymentMethod.toUpperCase()})</h5>
                  <p className="text-[11px] text-emerald-700">
                    {order.paidAt ? `Diterima pada ${formatDateIndo(order.paidAt)}` : 'Terverifikasi sah'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-800">
                {formatRupiah(order.totalAmount)}
              </span>
            </div>
          )}

          {/* DETAIL MENU YANG DIPESAN */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Rincian Makanan & Minuman
            </h4>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 divide-y divide-slate-200/60">
              {order.items.map((item) => (
                <div key={item.cartItemId} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-start">
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">
                      {item.quantity}x {item.name}
                    </p>
                    {item.selectedToppings.length > 0 && (
                      <p className="text-[11px] text-slate-500">
                        + Topping: {item.selectedToppings.map((t) => t.name).join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-[11px] text-amber-700 italic">
                        Catatan: "{item.notes}"
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400">
                      @{formatRupiah(item.unitPrice)}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              ))}

              <div className="pt-3 flex justify-between items-baseline font-black">
                <span className="text-xs text-slate-600">Total Keseluruhan</span>
                <span className="text-base text-forest-800">
                  {formatRupiah(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* STORE INFO & ACTIONS */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <a
              href={waReceiptUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Simpan Struk ke WhatsApp</span>
            </a>

            <button
              onClick={() => {
                onClose();
                onOrderAgain();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
            >
              <Utensils className="w-4 h-4 text-forest-800" />
              <span>Pesan Menu Lain</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
