import React, { useState } from 'react';
import { useCustomerOrder } from '../context/CustomerOrderContext';
import { OrderPaymentMethod, OrderType } from '../types';
import { formatRupiah } from '../services/storage';
import {
  X,
  User,
  Phone,
  Banknote,
  QrCode,
  UtensilsCrossed,
  Package,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface CustomerCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (orderId: string) => void;
}

export const CustomerCheckoutModal: React.FC<CustomerCheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const { cart, cartTotal, createOrder } = useCustomerOrder();

  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>('cash');
  const [orderNotes, setOrderNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Mohon isi Nama Pemesan terlebih dahulu.');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Keranjang Anda kosong. Silakan pilih menu terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newOrder = createOrder({
        customerName: customerName.trim(),
        customerWhatsapp: customerWhatsapp.trim() || undefined,
        orderType,
        tableNumber: orderType === 'dine_in' ? tableNumber.trim() : undefined,
        items: cart,
        paymentMethod,
        notes: orderNotes.trim() || undefined,
      });

      setIsSubmitting(false);
      onOrderCreated(newOrder.id);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Gagal membuat pesanan. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-800 to-forest-900 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight">Konfirmasi Pemesanan</h3>
            <p className="text-xs text-forest-200 mt-0.5">
              Mie Baso & Aneka Jus Kartika Sari (KS) Garut
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <p className="text-xs font-bold text-rose-800">{errorMessage}</p>
            </div>
          )}

          {/* Bagian 1: Identitas Pemesan */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              1. Identitas Pemesan (Wajib)
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pemesan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm font-semibold"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Nama ini dipanggil kasir saat makanan siap diambil.
              </p>
            </div>

            {/* Tipe Pesanan: Makan di Tempat / Bawa Pulang */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  orderType === 'dine_in'
                    ? 'border-forest-600 bg-forest-50/70 text-forest-900 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    orderType === 'dine_in'
                      ? 'bg-forest-800 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold">Makan di Tempat</p>
                  <p className="text-[10px] text-slate-500">Dine In di Toko</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  orderType === 'takeaway'
                    ? 'border-forest-600 bg-forest-50/70 text-forest-900 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    orderType === 'takeaway'
                      ? 'bg-forest-800 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold">Bawa Pulang</p>
                  <p className="text-[10px] text-slate-500">Takeaway dibungkus</p>
                </div>
              </button>
            </div>

            {/* Nomor Meja jika Makan di Tempat */}
            {orderType === 'dine_in' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Meja (Opsional)
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Contoh: Meja 05"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm font-semibold"
                />
              </div>
            )}

            {/* No. WhatsApp (Opsional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No. WhatsApp (Opsional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  placeholder="08123456789 (untuk struk & stempel)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm font-semibold"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Bagian 2: Ringkasan Pesanan */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              2. Ringkasan Menu ({cart.length} Item)
            </h4>
            <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 border border-slate-200/70 text-xs">
              {cart.map((item) => (
                <div key={item.cartItemId} className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-800">
                      {item.quantity}x {item.name}
                    </span>
                    {item.selectedToppings.length > 0 && (
                      <p className="text-[10px] text-slate-500">
                        + {item.selectedToppings.map((t) => t.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-extrabold text-slate-900">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black">
                <span className="text-xs text-slate-700">Total Pembayaran:</span>
                <span className="text-base text-forest-800">{formatRupiah(cartTotal)}</span>
              </div>
            </div>
          </div>

          {/* Bagian 3: Metode Pembayaran */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              3. Pilih Metode Pembayaran
            </h4>

            {/* Pilihan Cash */}
            <div
              onClick={() => setPaymentMethod('cash')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'cash'
                  ? 'border-forest-600 bg-forest-50/80 shadow-md ring-2 ring-forest-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === 'cash'
                      ? 'bg-forest-800 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900">
                      CASH (Bayar Langsung ke Kasir)
                    </h5>
                    {paymentMethod === 'cash' && (
                      <CheckCircle2 className="w-4 h-4 text-forest-700" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Pesanan dibuat terlebih dahulu. Setelah itu menuju meja kasir dan sebutkan{' '}
                    <strong className="text-slate-800">Nama Pemesan</strong> untuk pembayaran tunai.
                  </p>
                </div>
              </div>
            </div>

            {/* Pilihan QRIS */}
            <div
              onClick={() => setPaymentMethod('qris')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'qris'
                  ? 'border-forest-600 bg-forest-50/80 shadow-md ring-2 ring-forest-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === 'qris'
                      ? 'bg-forest-800 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-gold-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900">
                      QRIS Digital (BCA, GoPay, OVO, Dana, m-Banking)
                    </h5>
                    {paymentMethod === 'qris' && (
                      <CheckCircle2 className="w-4 h-4 text-forest-700" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Tampilkan QR Code di layar HP untuk dipindai. Pesanan langsung diproses otomatis
                    setelah verifikasi pembayaran valid.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Catatan Tambahan (Opsional) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Pesanan Toko (Opsional)
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Contoh: Jangan terlalu pedas, kuah dipisah, dll."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs font-medium"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-forest-800 hover:bg-forest-900 active:scale-[0.99] text-white font-extrabold text-sm shadow-xl shadow-forest-800/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-gold-400" />
                  <span>Konfirmasi & Buat Pesanan ({formatRupiah(cartTotal)})</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
