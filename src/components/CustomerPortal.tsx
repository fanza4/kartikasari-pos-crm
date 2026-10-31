import React, { useState, useEffect } from 'react';
import { MENU_ITEMS, DEFAULT_STORE_SETTINGS } from '../data/menuData';
import { MenuCategory, MenuItem } from '../types';
import { formatRupiah, normalizeWhatsAppPhone } from '../utils/formatters';
import { getCustomMenuPhotos, getStoreSettings } from '../services/storage';
import { useCustomerOrder } from '../context/CustomerOrderContext';
import { CustomerCartDrawer } from './CustomerCartDrawer';
import { CustomerCheckoutModal } from './CustomerCheckoutModal';
import { OrderTrackingModal } from './OrderTrackingModal';
import {
  MapPin,
  Clock,
  Phone,
  Award,
  Sparkles,
  MessageCircle,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  X,
} from 'lucide-react';

interface CustomerPortalProps {
  onOpenStampModal: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onOpenStampModal }) => {
  const {
    cart,
    cartTotal,
    cartItemCount,
    addToCart,
    updateQuantity,
    activeOrder,
    setActiveOrderById,
  } = useCustomerOrder();

  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>(() => getCustomMenuPhotos());
  const [storeSettings, setStoreSettings] = useState(() => getStoreSettings());
  const [zoomedPhoto, setZoomedPhoto] = useState<{ name: string; url: string; price: number; desc: string } | null>(null);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setCustomPhotos(getCustomMenuPhotos());
    const handleSettingsUpdate = () => setStoreSettings(getStoreSettings());

    window.addEventListener('ks_menu_photos_updated', handleUpdate);
    window.addEventListener('ks_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('ks_menu_photos_updated', handleUpdate);
      window.removeEventListener('ks_settings_updated', handleSettingsUpdate);
    };
  }, []);

  const categories = [
    { id: 'all', label: 'Semua Menu' },
    { id: 'mie_kuah', label: 'Mie Kuah' },
    { id: 'yamin_manis', label: 'Yamin Manis' },
    { id: 'yamin_asin', label: 'Yamin Asin' },
    { id: 'topping', label: 'Topping Ekstra' },
    { id: 'minuman', label: 'Minuman & Jus' },
  ];

  const filteredItems = selectedCategory === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter((item) => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
    setAddedNotice(`${item.name} berhasil ditambahkan!`);
    setTimeout(() => setAddedNotice(null), 2200);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      
      {/* Toast Notification */}
      {addedNotice && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 bg-forest-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-forest-700 animate-slide-up">
          <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold">{addedNotice}</p>
            <p className="text-[11px] text-forest-200">Menu masuk ke keranjang belanja</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-900 via-forest-800 to-forest-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          
          {/* Brand Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-gold-400/30 text-gold-300 text-xs font-bold tracking-wide uppercase mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Pesan Mandiri Praktis • Resep Asli Garut</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
            Pesan Mie Baso Favorit <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-amber-200">
              Kartika Sari Garut
            </span>
          </h1>

          <p className="text-sm sm:text-base text-forest-100 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Pilih menu, bayar di kasir atau QRIS digital, dan pantau status pesanan Anda secara langsung dari smartphone!
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {activeOrder && (
              <button
                onClick={() => setIsTrackingOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 text-slate-900 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:bg-amber-300 transition-all active:scale-95 animate-pulse"
              >
                <Clock className="w-4 h-4 text-slate-900" />
                <span>Lacak Pesanan Aktif ({activeOrder.orderStatus})</span>
              </button>
            )}

            <button
              onClick={onOpenStampModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition-all"
            >
              <Award className="w-4 h-4 text-gold-400" />
              <span>Cek Kartu Stempel Kupon</span>
            </button>

            <a
              href="#lokasi-toko"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/15 text-forest-100 font-bold text-xs sm:text-sm border border-white/10 transition-all"
            >
              <MapPin className="w-4 h-4 text-gold-400" />
              <span>Lokasi & Kontak</span>
            </a>
          </div>

          {/* Digital Stamp Reward Promo Banner */}
          <div className="mt-8 bg-forest-950/70 border border-gold-400/30 rounded-2xl p-4 max-w-lg mx-auto flex items-center justify-between gap-3 text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-gold-400">Program Loyalitas Kartika Sari</span>
              <h3 className="text-sm sm:text-base font-extrabold text-white">Klaim 1 Porsi Mie Baso Gratis!</h3>
              <p className="text-[11px] text-forest-200">Kumpulkan 10 stempel dari setiap pembelian porsi mie.</p>
            </div>
            <button
              onClick={onOpenStampModal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-amber-400 text-slate-900 font-extrabold text-xs whitespace-nowrap shadow-md active:scale-95 transition-all"
            >
              Cek Stempel
            </button>
          </div>

        </div>
      </section>

      {/* Category Tabs */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as MenuCategory)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-forest-800 text-white shadow-md shadow-forest-800/20 scale-[1.02]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Daftar Menu & Paket
            </h2>
            <p className="text-xs text-slate-500">
              Pilih menu di bawah untuk dimasukkan ke keranjang belanja
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const isSpecialPrice = item.portionType === 'komplit_khusus';
            const compositionItems = Array.isArray(item.composition)
              ? item.composition
              : typeof item.composition === 'string'
              ? item.composition.split(/[,•\n]+/).map((s) => s.trim()).filter(Boolean)
              : [];

            // Calculate quantity in customer cart
            const matchedCartItems = cart.filter((c) => c.menuItemId === item.id);
            const currentItemQty = matchedCartItems.reduce((acc, c) => acc + c.quantity, 0);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-forest-200 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Food Image Illustration / Thumbnail with fallback */}
                  <div className="relative w-full h-36 sm:h-40 rounded-2xl overflow-hidden mb-3.5 bg-gradient-to-br from-forest-50/60 via-slate-50 to-amber-50/30 flex items-center justify-center p-3 border border-slate-100 group-hover:border-forest-200 transition-colors">
                    <img
                      src={customPhotos[item.id] || item.image}
                      alt={item.name}
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      loading="lazy"
                      onClick={() =>
                        setZoomedPhoto({
                          name: item.name,
                          url: customPhotos[item.id] || item.image,
                          price: item.price,
                          desc: item.description || '',
                        })
                      }
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.svg';
                      }}
                    />
                    {item.givesStamp && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gold-800 bg-gold-400/95 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-sm">
                          🍜 +1 Stempel
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-forest-800 border border-forest-200 shadow-sm">
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Quick Zoom Pill */}
                    <button
                      type="button"
                      onClick={() =>
                        setZoomedPhoto({
                          name: item.name,
                          url: customPhotos[item.id] || item.image,
                          price: item.price,
                          desc: item.description || '',
                        })
                      }
                      className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
                      title="Lihat Foto Detail"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Title */}
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-forest-800 transition-colors">
                    {item.name}
                  </h3>

                  {/* Item Description */}
                  {item.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Ingredient Composition Pills */}
                  {compositionItems.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {compositionItems.map((comp, idx) => (
                        <span
                          key={idx}
                          className="bg-emerald-50 text-emerald-800 text-xs px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center font-medium"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Harga
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black text-forest-800 tracking-tight">
                        {formatRupiah(item.price)}
                      </span>
                      {isSpecialPrice && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Hemat 8k
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stepper or Add Button */}
                  {currentItemQty === 0 ? (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-gold-400" />
                      <span>Tambah</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-forest-50 p-1 rounded-xl border border-forest-200 shadow-sm">
                      <button
                        onClick={() => {
                          if (matchedCartItems.length > 0) {
                            updateQuantity(matchedCartItems[0].cartItemId, -1);
                          }
                        }}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold active:scale-90 border border-slate-200 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-forest-900">
                        {currentItemQty}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-7 h-7 rounded-lg bg-forest-800 hover:bg-forest-900 text-white flex items-center justify-center font-bold active:scale-90 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* FLOATING CART BAR */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-5 inset-x-4 max-w-lg mx-auto z-40 animate-slide-up">
          <div
            onClick={() => setIsCartOpen(true)}
            className="bg-forest-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl flex items-center justify-between border-2 border-gold-400/50 backdrop-blur-md cursor-pointer hover:bg-forest-800 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gold-400 text-slate-900 flex items-center justify-center font-black relative shadow-md">
                <ShoppingBag className="w-5 h-5 text-slate-900" />
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-forest-900 font-extrabold">
                  {cartItemCount}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-forest-200">
                  Total {cartItemCount} Menu Dipilih:
                </p>
                <p className="text-base font-black text-gold-300">
                  {formatRupiah(cartTotal)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-forest-800 group-hover:bg-forest-700 px-4 py-2.5 rounded-2xl text-xs font-bold border border-white/10 shadow-sm">
              <span>Lihat Keranjang</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </div>
          </div>
        </div>
      )}

      {/* Store Information & Location Section */}
      <section id="lokasi-toko" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left: Store Detail */}
            <div className="space-y-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest-100 text-forest-800">
                  Kunjungi Kedai Kami
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  {DEFAULT_STORE_SETTINGS.storeName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {DEFAULT_STORE_SETTINGS.tagline}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase">Alamat Toko</h4>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {DEFAULT_STORE_SETTINGS.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase">Jam Operasional</h4>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {DEFAULT_STORE_SETTINGS.operationalHours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase">Kontak / Pesan Antar</h4>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      WhatsApp: {DEFAULT_STORE_SETTINGS.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`https://wa.me/${normalizeWhatsAppPhone(DEFAULT_STORE_SETTINGS.phone)}?text=Halo%20Mie%20Baso%20Kartika%20Sari,%20saya%20ingin%20tanya%20menu`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat WhatsApp Toko</span>
                </a>

                <a
                  href={storeSettings.mapsDirectUrl || DEFAULT_STORE_SETTINGS.mapsDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
                >
                  <MapPin className="w-4 h-4 text-forest-800" />
                  <span>Buka di Google Maps</span>
                </a>
              </div>
            </div>

            {/* Right: Embedded Google Maps */}
            <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
              <iframe
                title="Peta Lokasi Mie Baso Kartika Sari Garut"
                src={storeSettings.mapsEmbedUrl || DEFAULT_STORE_SETTINGS.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-400 py-6 border-t border-slate-200/60">
        <p className="font-semibold text-slate-600">
          Mie Baso & Aneka Jus Kartika Sari (KS) — Paseban, Garut
        </p>
        <p className="mt-1 text-[11px]">
          Smart CRM, Touch POS & Online Ordering
        </p>
      </footer>

      {/* CUSTOMER CART DRAWER */}
      <CustomerCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* CHECKOUT MODAL */}
      <CustomerCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCreated={(orderId) => {
          setIsCheckoutOpen(false);
          setActiveOrderById(orderId);
          setIsTrackingOpen(true);
        }}
      />

      {/* LIVE ORDER TRACKING MODAL */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        orderId={activeOrder?.id || null}
        onClose={() => setIsTrackingOpen(false)}
        onOrderAgain={() => setIsTrackingOpen(false)}
      />

      {/* ZOOMED PHOTO MODAL */}
      {zoomedPhoto && (
        <div
          onClick={() => setZoomedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">{zoomedPhoto.name}</h4>
                <p className="text-xs text-forest-800 font-black">{formatRupiah(zoomedPhoto.price)}</p>
              </div>
              <button
                onClick={() => setZoomedPhoto(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden mt-3 bg-slate-100">
              <img
                src={zoomedPhoto.url}
                alt={zoomedPhoto.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.svg';
                }}
              />
            </div>

            {zoomedPhoto.desc && (
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {zoomedPhoto.desc}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
