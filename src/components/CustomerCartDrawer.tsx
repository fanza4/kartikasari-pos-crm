import React from 'react';
import { useCustomerOrder } from '../context/CustomerOrderContext';
import { formatRupiah } from '../services/storage';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Utensils } from 'lucide-react';

interface CustomerCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CustomerCartDrawer: React.FC<CustomerCartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { cart, cartTotal, cartItemCount, updateQuantity, removeFromCart, clearCart } =
    useCustomerOrder();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform animate-slide-left">
          
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-forest-800 to-forest-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <ShoppingBag className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Keranjang Pesanan</h3>
                <p className="text-xs text-forest-200">
                  {cartItemCount} item makanan & minuman
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-200 hover:text-white transition-colors"
                  title="Kosongkan Keranjang"
                >
                  Kosongkan
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                  <Utensils className="w-10 h-10" />
                </div>
                <h4 className="text-base font-bold text-slate-700">Keranjang Masih Kosong</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Yuk pilih menu mie baso, topping gurih, atau minuman segar favorit Anda dari katalog!
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-forest-800 text-white text-xs font-bold hover:bg-forest-900 shadow-md transition-all active:scale-95"
                >
                  Lihat Menu Sekarang
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-forest-200 transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                          {item.category.replace('_', ' ')}
                        </span>
                        {item.givesStamp && (
                          <span className="text-[9px] font-bold text-gold-700 bg-gold-100 px-1.5 py-0.5 rounded">
                            🍜 +1 Stempel
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                        {item.name}
                      </h4>
                      {item.selectedToppings.length > 0 && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          + Topping: {item.selectedToppings.map((t) => t.name).join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[11px] text-amber-700 italic mt-0.5">
                          "{item.notes}"
                        </p>
                      )}
                      <p className="text-xs font-bold text-slate-500 mt-1">
                        {formatRupiah(item.unitPrice)} / porsi
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus menu ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity & Subtotal */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold active:scale-90 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-extrabold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="w-7 h-7 rounded-lg bg-forest-800 hover:bg-forest-900 text-white flex items-center justify-center font-bold active:scale-90 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Subtotal</span>
                      <span className="text-sm font-black text-forest-800">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-4 pb-safe">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal Menu</span>
                  <span className="font-bold text-slate-800">{formatRupiah(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-forest-700">
                  <span>Biaya Layanan & Pemesanan</span>
                  <span className="font-bold">GRATIS (Rp 0)</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                  <span className="text-sm font-extrabold text-slate-900">Total Pembayaran</span>
                  <span className="text-xl font-black text-forest-800">
                    {formatRupiah(cartTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-2xl bg-forest-800 hover:bg-forest-900 active:scale-[0.99] text-white font-extrabold text-sm shadow-xl shadow-forest-800/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>Lanjutkan Pemesanan</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
