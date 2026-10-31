import React, { useState, useEffect, useRef } from 'react';
import { MENU_ITEMS, TOPPINGS } from '../data/menuData';
import { MenuCategory, MenuItem, ToppingItem, Transaction, StoreSettings } from '../types';
import { useCart } from '../context/CartContext';
import {
  formatRupiah,
  saveTransaction,
  getReceiptWhatsAppUrl,
  getStoreSettings,
  updateStoreQrisImage,
  resetStoreQrisImage,
  findCustomerByPhoneOrName,
} from '../services/storage';
import { compressImageFile } from '../utils/imageCompressor';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  QrCode,
  Banknote,
  Share2,
  UserCheck,
  Search,
  Sparkles,
  ArrowRight,
  Printer,
  FileText,
  Upload,
  RefreshCw,
  Eye,
  X,
  Utensils,
  Package,
  Phone,
  User,
  Camera,
  Check,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TouchPOS: React.FC = () => {
  const {
    items,
    customer,
    customerName,
    customerWhatsapp,
    setCustomerInfo,
    setLinkedCustomer,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleTopping,
    updateNotes,
    updateCustomPrice,
    clearCart,
    totalAmount,
    totalNoodleCount,
    isRewardEligible,
    claimReward,
    setClaimReward,
  } = useCart();

  // Category & search state
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemForTopping, setActiveItemForTopping] = useState<string | null>(null);

  // Customer & Order settings
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerWhatsappInput, setCustomerWhatsappInput] = useState('');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [tableNumber, setTableNumber] = useState('01');
  const [orderNotes, setOrderNotes] = useState('');

  // Customer lookup
  const [customerSearchInput, setCustomerSearchInput] = useState('');
  const [customerFoundNotice, setCustomerFoundNotice] = useState<string | null>(null);

  // Store settings & dynamic QRIS
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(getStoreSettings());
  const [isUploadingQris, setIsUploadingQris] = useState(false);
  const [qrisSuccessNotice, setQrisSuccessNotice] = useState<string | null>(null);
  const [isQrisPreviewOpen, setIsQrisPreviewOpen] = useState(false);
  const [isManageQrisModalOpen, setIsManageQrisModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Payment checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash');
  const [cashGivenInput, setCashGivenInput] = useState<number | ''>('');
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  // Listen to store settings updates in real time
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setStoreSettings(getStoreSettings());
    };
    window.addEventListener('ks_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('ks_settings_updated', handleSettingsUpdate);
  }, []);

  // Sync customer state with local inputs
  useEffect(() => {
    if (customer) {
      setCustomerNameInput(customer.name);
      setCustomerWhatsappInput(customer.whatsapp);
    } else if (customerName) {
      setCustomerNameInput(customerName);
    }
  }, [customer, customerName]);

  const categories = [
    { id: 'all', label: 'Semua Menu' },
    { id: 'mie_kuah', label: 'Mie Kuah' },
    { id: 'yamin_manis', label: 'Yamin Manis' },
    { id: 'yamin_asin', label: 'Yamin Asin' },
    { id: 'topping', label: 'Topping' },
    { id: 'minuman', label: 'Minuman' },
  ];

  // Filtered menu items
  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  // Customer lookup handler
  const handleCustomerLookup = () => {
    if (!customerSearchInput.trim()) return;
    const found = findCustomerByPhoneOrName(customerSearchInput);
    if (found) {
      setLinkedCustomer(found);
      setCustomerNameInput(found.name);
      setCustomerWhatsappInput(found.whatsapp);
      setCustomerFoundNotice(`Member KS ditemukan: ${found.name} (${found.stampsCount}/10 stempel)`);
    } else {
      const trimmed = customerSearchInput.trim();
      const isDigits = /^[0-9]+$/.test(trimmed);
      const newName = isDigits ? 'Pelanggan Baru' : trimmed;
      const newWa = isDigits ? trimmed : '';
      setCustomerInfo(newName, newWa);
      setCustomerNameInput(newName);
      setCustomerWhatsappInput(newWa);
      setCustomerFoundNotice(`Identitas baru disimpan untuk kartu stempel.`);
    }
    setTimeout(() => setCustomerFoundNotice(null), 3500);
  };

  // QRIS Image upload handler
  const handleQrisFileSelected = async (file: File) => {
    if (!file) return;
    setIsUploadingQris(true);
    setQrisSuccessNotice(null);

    try {
      // Compress image for optimal performance and storage
      const compressedDataUrl = await compressImageFile(file, 600, 600, 0.85);
      const updated = updateStoreQrisImage(compressedDataUrl);
      setStoreSettings(updated);
      setQrisSuccessNotice('Foto QRIS Toko Berhasil Diperbarui!');
      setTimeout(() => setQrisSuccessNotice(null), 4000);
    } catch (err) {
      alert('Gagal mengunggah foto QRIS. Pastikan file berupa format gambar (JPG/PNG).');
    } finally {
      setIsUploadingQris(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (modalFileInputRef.current) modalFileInputRef.current.value = '';
    }
  };

  // Reset QRIS image to default
  const handleResetQrisToDefault = () => {
    if (confirm('Kembalikan gambar QRIS ke QR resmi default Mie Baso Kartika Sari?')) {
      const updated = resetStoreQrisImage();
      setStoreSettings(updated);
      setQrisSuccessNotice('Gambar QRIS berhasil dikembalikan ke default toko.');
      setTimeout(() => setQrisSuccessNotice(null), 3500);
    }
  };

  // Open Checkout
  const handleOpenCheckout = () => {
    if (items.length === 0) return;
    setCashGivenInput(totalAmount);
    setPaymentMethod('cash');
    setIsMobileCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Quick cash buttons
  const setQuickCash = (amount: number) => {
    setCashGivenInput(amount);
  };

  const cashGivenNumber = typeof cashGivenInput === 'number' ? cashGivenInput : 0;
  const changeAmount = Math.max(0, cashGivenNumber - totalAmount);
  const isCashSufficient = paymentMethod === 'qris' || cashGivenNumber >= totalAmount;

  // Process transaction
  const handleCompleteTransaction = () => {
    if (!isCashSufficient) return;

    const finalCustomerName = customerNameInput.trim() || (customer ? customer.name : 'Tamu Kasir');
    const finalCustomerWa = customerWhatsappInput.trim() || (customer ? customer.whatsapp : '');

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      invoiceNumber: `KS-${Date.now().toString().slice(-6)}`,
      customerName: finalCustomerName,
      customerWhatsapp: finalCustomerWa,
      customerId: customer?.id,
      orderType,
      tableNumber: orderType === 'dine_in' ? (tableNumber.trim() || '01') : undefined,
      notes: orderNotes.trim() || undefined,
      items: [...items],
      totalAmount,
      paymentMethod,
      cashGiven: paymentMethod === 'cash' ? cashGivenNumber : totalAmount,
      changeAmount: paymentMethod === 'cash' ? changeAmount : 0,
      stampsEarned: totalNoodleCount,
      rewardClaimed: claimReward && isRewardEligible,
      createdAt: new Date().toISOString(),
      status: 'completed',
    };

    saveTransaction(newTx);
    setCompletedTx(newTx);

    if (newTx.rewardClaimed) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  // Print thermal receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  // Reset and prepare new order
  const handleFinishAndNewOrder = () => {
    clearCart();
    setCompletedTx(null);
    setIsCheckoutOpen(false);
    setIsMobileCartOpen(false);
    setCustomerSearchInput('');
    setCustomerNameInput('');
    setCustomerWhatsappInput('');
    setOrderNotes('');
    setTableNumber('01');
    setOrderType('dine_in');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
      
      {/* Hidden file inputs for QRIS upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleQrisFileSelected(file);
        }}
      />
      <input
        ref={modalFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleQrisFileSelected(file);
        }}
      />

      {/* POS Top Control & Header Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Sistem Kasir Sentuh Cepat (Touch POS)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mendukung Pesanan Meja (Dine In) & Bawa Pulang (Takeaway) dengan QRIS Toko Dinamis.
          </p>
        </div>

        {/* Quick QRIS Settings & Member Lookup Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Quick QRIS Button */}
          <button
            onClick={() => setIsManageQrisModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Pengaturan Gambar QRIS Toko"
          >
            <QrCode className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Kelola QRIS</span>
            <span className="sm:hidden">QRIS</span>
          </button>

          {/* Member WA Lookup */}
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              value={customerSearchInput}
              onChange={(e) => setCustomerSearchInput(e.target.value)}
              placeholder="No. WA / Nama Pelanggan..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-forest-600 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleCustomerLookup()}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={handleCustomerLookup}
            className="px-3.5 py-2 rounded-xl bg-forest-800 text-white text-xs font-bold hover:bg-forest-900 transition-all active:scale-95 shrink-0"
          >
            Hubungkan
          </button>
        </div>
      </div>

      {/* Success Notices */}
      {customerFoundNotice && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{customerFoundNotice}</span>
        </div>
      )}

      {qrisSuccessNotice && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{qrisSuccessNotice}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* Left Column: Menu Catalog (Col 1-7 or 1-8) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Category Tabs & Quick Menu Search */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
            {/* Scrollable Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as MenuCategory)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-forest-800 text-white shadow-md shadow-forest-800/20'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Menu Filter Search */}
            <div className="relative sm:w-48 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:ring-1 focus:ring-forest-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Menu Items Touch Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredItems.map((item) => {
              const inCartCount = items
                .filter((i) => i.menuItem?.id === item.id || i.menuItemId === item.id)
                .reduce((s, i) => s + i.quantity, 0);

              return (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className={`bg-white rounded-2xl p-3 border transition-all text-left flex flex-col justify-between min-h-[118px] group relative ${
                    inCartCount > 0
                      ? 'border-forest-700 ring-2 ring-forest-600/10 shadow-md'
                      : 'border-slate-200/90 shadow-sm hover:border-forest-600 hover:shadow-md'
                  } active:scale-95`}
                >
                  {/* Badge in-cart count */}
                  {inCartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-forest-800 text-gold-300 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                      {inCartCount}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-bold uppercase text-slate-400">
                        {item.category.replace('_', ' ')}
                      </span>
                      {item.givesStamp && (
                        <span className="text-[8px] font-bold text-gold-800 bg-gold-50 px-1.5 py-0.5 rounded border border-gold-200 shrink-0">
                          +1 🍜
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-forest-800 transition-colors leading-tight line-clamp-2">
                      {item.name}
                    </h4>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-black text-forest-800">
                      {formatRupiah(item.price)}
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-forest-50 text-forest-800 flex items-center justify-center group-hover:bg-forest-800 group-hover:text-white transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
              <Utensils className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Menu tidak ditemukan</p>
              <p className="text-xs text-slate-400 mt-0.5">Coba cari dengan kata kunci lain atau pilih kategori Semua Menu.</p>
            </div>
          )}

        </div>

        {/* Right Column: Live Dynamic Cart & Customer Identity (Col 8-12) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-xl p-4 sm:p-5 lg:sticky lg:top-24 space-y-4">
          
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-forest-800" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Pesanan Kasir
              </h3>
              {items.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 text-[11px] font-black">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Customer & Order Settings Card (Sama seperti pemesanan di sisi User) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-forest-700" />
                Identitas Pemesan Kasir
              </span>
              {customer && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Member KS
                </span>
              )}
            </div>

            {/* Nama Pemesan Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                Nama Pemesan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerNameInput}
                  onChange={(e) => {
                    setCustomerNameInput(e.target.value);
                    setCustomerInfo(e.target.value, customerWhatsappInput);
                  }}
                  placeholder="Nama Pemesan (misal: Kang Asep)"
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:ring-1 focus:ring-forest-600 outline-none"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>
            </div>

            {/* Pilihan Tipe Pesanan: Dine In vs Takeaway */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  orderType === 'dine_in'
                    ? 'bg-forest-800 text-white border-forest-800 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Makan di Tempat</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  orderType === 'takeaway'
                    ? 'bg-forest-800 text-white border-forest-800 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Bungkus (Takeaway)</span>
              </button>
            </div>

            {/* Nomor Meja (jika Dine In) */}
            {orderType === 'dine_in' && (
              <div className="animate-fade-in">
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                  Nomor Meja Pelanggan:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Contoh: 01, Meja 5, VIP"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:ring-1 focus:ring-forest-600"
                  />
                  {/* Quick table tags */}
                  <div className="flex gap-1 shrink-0">
                    {['01', '02', '03', '05'].map((tbl) => (
                      <button
                        key={tbl}
                        type="button"
                        onClick={() => setTableNumber(tbl)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                          tableNumber === tbl
                            ? 'bg-forest-100 border-forest-600 text-forest-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp input for e-receipt and stamps */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                No. WhatsApp Pelanggan (Stempel & E-Struk):
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={customerWhatsappInput}
                  onChange={(e) => {
                    setCustomerWhatsappInput(e.target.value);
                    setCustomerInfo(customerNameInput, e.target.value);
                  }}
                  placeholder="08xxxxxxxxxx"
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:ring-1 focus:ring-forest-600 outline-none"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                Catatan Pesanan Toko:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Catatan pesanan koki/kasir..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-forest-600 outline-none"
                />
                <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>
            </div>

          </div>

          {/* Reward Eligible Alert (10 Stamps) */}
          {isRewardEligible && (
            <div className="p-3 rounded-2xl bg-gold-50 border border-gold-300 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-600 shrink-0" />
                <span className="text-[11px] font-bold text-gold-900">
                  Punya 10 Stempel! (Porsi Gratis)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setClaimReward(!claimReward)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  claimReward
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gold-500 hover:bg-gold-600 text-slate-900'
                }`}
              >
                {claimReward ? '✓ Diklaim (-26k)' : 'Klaim Gratis'}
              </button>
            </div>
          )}

          {/* Cart Item List */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 no-scrollbar">
            {items.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                <p className="font-bold text-slate-600">Keranjang kasir kosong.</p>
                <p className="text-[11px] text-slate-400 mt-1">Sentuh salah satu menu di sebelah kiri untuk menambahkan pesanan.</p>
              </div>
            ) : (
              items.map((cartItem) => {
                const isToppingExpanded = activeItemForTopping === cartItem.cartItemId;

                return (
                  <div
                    key={cartItem.cartItemId}
                    className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {cartItem.menuItem.name}
                        </h4>
                        <span className="text-[11px] font-black text-forest-800">
                          {formatRupiah(cartItem.itemTotal)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          (@{formatRupiah(cartItem.customPrice || cartItem.menuItem.price)})
                        </span>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
                        <button
                          onClick={() => updateQuantity(cartItem.cartItemId, -1)}
                          className="w-5 h-5 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-800">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.cartItemId, 1)}
                          className="w-5 h-5 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Custom price input for Aneka Jus */}
                    {cartItem.menuItem.isCustomPrice && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-slate-500 font-semibold">Harga Custom Jus:</span>
                        <input
                          type="number"
                          value={cartItem.customPrice || cartItem.menuItem.price}
                          onChange={(e) => updateCustomPrice(cartItem.cartItemId, Number(e.target.value) || 0)}
                          className="w-24 px-2 py-0.5 rounded border border-slate-200 text-xs font-bold text-forest-800"
                        />
                      </div>
                    )}

                    {/* Topping Tag pills already added */}
                    {cartItem.selectedToppings.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cartItem.selectedToppings.map((top) => (
                          <span
                            key={top.id}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-forest-100 text-forest-800 text-[10px] font-semibold"
                          >
                            +{top.name}
                            <button
                              onClick={() => toggleTopping(cartItem.cartItemId, top)}
                              className="hover:text-rose-700 ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick Topping Add-on Expand Button */}
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <button
                        onClick={() =>
                          setActiveItemForTopping(isToppingExpanded ? null : cartItem.cartItemId)
                        }
                        className="text-forest-800 hover:text-forest-900 font-bold underline"
                      >
                        {isToppingExpanded ? 'Tutup Topping' : '+ Tambah Topping (@5rb)'}
                      </button>

                      <button
                        onClick={() => removeFromCart(cartItem.cartItemId)}
                        className="text-slate-400 hover:text-rose-600 font-medium"
                      >
                        Hapus
                      </button>
                    </div>

                    {/* 1-Click Topping Selector Bar */}
                    {isToppingExpanded && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 space-y-2 animate-fade-in shadow-inner">
                        <span className="text-[10px] font-bold text-slate-600 block">
                          Pilih Topping Tambahan (Rp 5.000 / item):
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {TOPPINGS.map((top) => {
                            const isSelected = cartItem.selectedToppings.some((t) => t.id === top.id);
                            return (
                              <button
                                key={top.id}
                                onClick={() => toggleTopping(cartItem.cartItemId, top)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all text-left truncate ${
                                  isSelected
                                    ? 'bg-forest-800 text-white border-forest-800'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}
                                {top.name}
                              </button>
                            );
                          })}
                        </div>

                        {/* Note Input */}
                        <div className="pt-1">
                          <input
                            type="text"
                            value={cartItem.notes}
                            onChange={(e) => updateNotes(cartItem.cartItemId, e.target.value)}
                            placeholder="Catatan porsi (misal: kuah banjir)..."
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 text-[10px] outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Calculation & CTA Footer */}
          <div className="border-t border-slate-200 pt-3 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Total Porsi Mie (Stempel)</span>
              <span className="font-bold text-slate-700">+{totalNoodleCount} Stempel</span>
            </div>

            {claimReward && isRewardEligible && (
              <div className="flex justify-between text-xs text-emerald-700 font-bold">
                <span>Diskon Stempel ke-10</span>
                <span>-Rp 26.000</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-xs font-black uppercase text-slate-700">Total Bayar</span>
                <span className="text-[10px] text-slate-400 block">
                  {orderType === 'takeaway' ? 'Bungkus (Takeaway)' : `Dine In (Meja ${tableNumber || '-'})`}
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-forest-800 tracking-tight">
                {formatRupiah(totalAmount)}
              </span>
            </div>

            <button
              onClick={handleOpenCheckout}
              disabled={items.length === 0}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-forest-800/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </button>
          </div>

        </div>

      </div>

      {/* Floating Bottom Cart Action Bar for Mobile Cashier */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-16 inset-x-3 z-30 mb-safe animate-slide-up">
          <div
            onClick={() => setIsMobileCartOpen(true)}
            className="bg-forest-900 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-gold-400/50 cursor-pointer active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gold-400 text-slate-900 flex items-center justify-center font-black relative shadow-sm">
                <ShoppingBag className="w-5 h-5 text-slate-900" />
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border border-forest-900">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-forest-200">
                  {customerNameInput || 'Tamu Kasir'} • {orderType === 'takeaway' ? 'Bungkus' : `Meja ${tableNumber}`}
                </p>
                <p className="text-base font-black text-gold-300">{formatRupiah(totalAmount)}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-forest-800 px-3.5 py-2 rounded-xl text-xs font-bold text-white border border-white/10 shadow-sm">
              <span>Bayar Kasir</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cart Sheet / Drawer */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col pb-safe">
            {/* Sheet Header */}
            <div className="bg-forest-800 px-5 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold-300" />
                <h3 className="text-base font-bold">Rincian Pesanan Kasir</h3>
              </div>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content scrollable */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Customer Identitas in mobile */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Nama: {customerNameInput || 'Tamu Kasir'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-forest-100 text-forest-800 font-bold">
                    {orderType === 'takeaway' ? 'Bungkus' : `Meja ${tableNumber}`}
                  </span>
                </div>
                {customerWhatsappInput && (
                  <p className="text-[11px] text-slate-500">WA: {customerWhatsappInput}</p>
                )}
                {orderNotes && (
                  <p className="text-[11px] text-slate-600 italic">Catatan: "{orderNotes}"</p>
                )}
              </div>

              {/* Items in mobile */}
              <div className="space-y-2">
                {items.map((cartItem) => (
                  <div key={cartItem.cartItemId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{cartItem.menuItem.name}</h5>
                      <p className="text-[11px] font-black text-forest-800">{formatRupiah(cartItem.itemTotal)}</p>
                      {cartItem.selectedToppings.length > 0 && (
                        <p className="text-[10px] text-slate-500">
                          +{cartItem.selectedToppings.map((t) => t.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => updateQuantity(cartItem.cartItemId, -1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(cartItem.cartItemId, 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action in mobile sheet */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-xs font-bold text-slate-600 uppercase">Total Tagihan:</span>
                <span className="text-xl font-black text-forest-800">{formatRupiah(totalAmount)}</span>
              </div>
              <button
                onClick={handleOpenCheckout}
                className="w-full py-3.5 rounded-2xl bg-forest-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Lanjut ke Pembayaran Kasir</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment / Checkout Modal (Desktop & Mobile) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col my-auto">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-forest-800 to-forest-900 p-4 sm:p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  {completedTx ? 'Pembayaran Berhasil! 🎉' : 'Pilih Metode Pembayaran'}
                </h3>
                <p className="text-xs text-forest-200 mt-0.5">
                  Total Tagihan: <span className="font-black text-gold-300">{formatRupiah(totalAmount)}</span>
                </p>
              </div>
              {!completedTx && (
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto">
              
              {!completedTx ? (
                <div className="space-y-4">
                  
                  {/* Order summary pill */}
                  <div className="p-3 rounded-2xl bg-forest-50/80 border border-forest-200/80 text-xs text-forest-900 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-forest-950">
                        {customerNameInput.trim() || 'Tamu Kasir'}
                      </p>
                      <p className="text-[11px] text-forest-700">
                        {orderType === 'takeaway' ? '🛍️ Bungkus (Takeaway)' : `🍽️ Makan di Tempat (Meja ${tableNumber || '-'})`}
                      </p>
                    </div>
                    <span className="text-sm font-black text-forest-800">
                      {formatRupiah(totalAmount)}
                    </span>
                  </div>

                  {/* Payment Method Tabs */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-forest-800 bg-forest-50 text-forest-800 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-forest-700" />
                      <span>Tunai (Cash)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qris')}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all ${
                        paymentMethod === 'qris'
                          ? 'border-forest-800 bg-forest-50 text-forest-800 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-forest-700" />
                      <span>QRIS Kasir</span>
                    </button>
                  </div>

                  {/* Cash Flow */}
                  {paymentMethod === 'cash' ? (
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Nominal Diterima Kasir:
                        </label>
                        <input
                          type="number"
                          value={cashGivenInput}
                          onChange={(e) => setCashGivenInput(Number(e.target.value) || '')}
                          placeholder="0"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-lg sm:text-xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                        />
                      </div>

                      {/* Quick Denominations */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setQuickCash(totalAmount)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm"
                        >
                          Uang Pas
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickCash(50000)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm"
                        >
                          Rp 50.000
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickCash(100000)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm"
                        >
                          Rp 100.000
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickCash(200000)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm"
                        >
                          Rp 200.000
                        </button>
                      </div>

                      {/* Change calculation box */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 uppercase">
                          Kembalian:
                        </span>
                        <span className={`text-xl font-black ${cashGivenNumber >= totalAmount ? 'text-forest-800' : 'text-rose-600'}`}>
                          {cashGivenNumber >= totalAmount ? formatRupiah(changeAmount) : `Kurang ${formatRupiah(totalAmount - cashGivenNumber)}`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* QRIS Flow & Custom QR Replacement */
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Scan QRIS Resmi Toko:
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsQrisPreviewOpen(true)}
                          className="text-[11px] font-bold text-forest-700 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Perbesar</span>
                        </button>
                      </div>

                      {/* QR Display */}
                      <div className="w-52 h-64 mx-auto bg-white p-2.5 rounded-2xl border-2 border-slate-200 shadow-inner flex items-center justify-center relative group">
                        <img
                          src={storeSettings.qrisImageUrl || '/qris.jpg'}
                          alt="QRIS Mie Baso Kartika Sari"
                          className="max-w-full max-h-full object-contain cursor-pointer rounded-xl"
                          onClick={() => setIsQrisPreviewOpen(true)}
                        />
                      </div>

                      <p className="text-[11px] text-slate-500">
                        Scan via BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay
                      </p>

                      {/* Store QRIS Custom Upload Actions */}
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          disabled={isUploadingQris}
                          onClick={() => modalFileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isUploadingQris ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Camera className="w-3.5 h-3.5" />
                          )}
                          <span>{isUploadingQris ? 'Mengunggah...' : 'Ganti Gambar QR Toko'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetQrisToDefault}
                          className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-bold active:scale-95 transition-all"
                        >
                          Reset Default
                        </button>
                      </div>

                    </div>
                  )}

                  {/* Customer WhatsApp input for E-receipt & stamps */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Nomor WhatsApp Pelanggan (Untuk E-Struk & Stempel):
                    </label>
                    <input
                      type="tel"
                      value={customerWhatsappInput}
                      onChange={(e) => {
                        setCustomerWhatsappInput(e.target.value);
                        setCustomerInfo(customerNameInput, e.target.value);
                      }}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-600 outline-none bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCompleteTransaction}
                    disabled={!isCashSufficient}
                    className="w-full py-4 rounded-2xl bg-forest-800 hover:bg-forest-900 active:scale-95 text-white font-extrabold text-sm shadow-xl shadow-forest-800/25 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <CheckCircle2 className="w-5 h-5 text-gold-400" />
                    <span>Konfirmasi Pembayaran Selesai</span>
                  </button>

                </div>
              ) : (
                /* Completed Receipt View */
                <div className="space-y-4 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-slate-900">
                      Transaksi Tersimpan!
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      No. Nota: {completedTx.invoiceNumber}
                    </p>
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-200">
                      <p className="font-bold text-slate-900">
                        {completedTx.customerName} • {completedTx.orderType === 'takeaway' ? 'Bungkus (Takeaway)' : `Dine In Meja ${completedTx.tableNumber || '-'}`}
                      </p>
                      <p className="font-black text-forest-800 mt-1 text-base">
                        Total: {formatRupiah(completedTx.totalAmount)} ({completedTx.paymentMethod.toUpperCase()})
                      </p>
                      {completedTx.paymentMethod === 'cash' && (
                        <p className="text-xs text-slate-600">
                          Kembalian: {formatRupiah(completedTx.changeAmount || 0)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* E-receipt WhatsApp Action */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-left">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <Share2 className="w-4 h-4 text-emerald-600" />
                      <span>Kirim E-Struk ke WhatsApp Pelanggan</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Kirim nota bukti pembayaran langsung ke WhatsApp pelanggan dalam 1 kali klik.
                    </p>
                    <a
                      href={getReceiptWhatsAppUrl(completedTx, storeSettings)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Buka WhatsApp & Kirim Struk</span>
                    </a>
                  </div>

                  {/* Thermal Print Action */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handlePrintReceipt}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Cetak Struk</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleFinishAndNewOrder}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow transition-all"
                    >
                      Pesanan Baru
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* QRIS Full-Screen Preview Modal */}
      {isQrisPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-extrabold text-slate-900">QRIS Resmi Toko</h4>
              <button
                onClick={() => setIsQrisPreviewOpen(false)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center">
              <img
                src={storeSettings.qrisImageUrl || '/qris.jpg'}
                alt="QRIS Toko Full"
                className="max-w-full max-h-96 object-contain rounded-xl"
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Tunjukkan kode QR ini ke pelanggan untuk dipindai melalui aplikasi e-wallet atau m-Banking.
            </p>
            <button
              onClick={() => setIsQrisPreviewOpen(false)}
              className="w-full py-2.5 rounded-xl bg-forest-800 text-white font-bold text-xs"
            >
              Tutup Tampilan QR
            </button>
          </div>
        </div>
      )}

      {/* Manage QRIS Modal (Bisa diakses dari Header POS) */}
      {isManageQrisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-forest-800" />
                <h4 className="text-base font-bold text-slate-900">Kelola QRIS Toko</h4>
              </div>
              <button
                onClick={() => setIsManageQrisModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda dapat mengunggah foto kode QRIS toko resmi Anda (bisa berupa foto dari kamera HP atau file gambar galeri). Kode ini akan langsung tampil di sistem kasir dan halaman pelacakan pesanan pelanggan.
            </p>

            <div className="w-52 h-64 mx-auto bg-slate-50 rounded-2xl p-2.5 border-2 border-slate-200 flex items-center justify-center relative">
              <img
                src={storeSettings.qrisImageUrl || '/qris.jpg'}
                alt="QRIS Preview"
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isUploadingQris}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow transition-all active:scale-95 disabled:opacity-50"
              >
                {isUploadingQris ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-gold-300" />
                ) : (
                  <Upload className="w-4 h-4 text-gold-300" />
                )}
                <span>{isUploadingQris ? 'Mengunggah & Mengompres Foto...' : 'Pilih / Foto QRIS Toko Baru'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetQrisToDefault}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
              >
                Kembalikan ke QRIS Default
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
