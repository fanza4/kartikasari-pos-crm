import React, { useState, useEffect, useRef } from 'react';
import { MENU_ITEMS } from '../data/menuData';
import { MenuItem, MenuCategory } from '../types';
import {
  getCustomMenuPhotos,
  saveCustomMenuPhoto,
  removeCustomMenuPhoto,
  resetAllCustomMenuPhotos,
  formatRupiah,
} from '../services/storage';
import { compressImageFile } from '../utils/imageCompressor';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Search,
  X,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface AdminMenuPhotoManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminMenuPhotoManager: React.FC<AdminMenuPhotoManagerProps> = ({
  isOpen = true,
  onClose,
}) => {
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>(() => getCustomMenuPhotos());
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemForUpload, setActiveItemForUpload] = useState<MenuItem | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [useUrlMode, setUseUrlMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewFullPhoto, setViewFullPhoto] = useState<{ name: string; url: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', label: 'Semua Menu' },
    { id: 'mie_kuah', label: 'Mie Kuah' },
    { id: 'yamin_manis', label: 'Yamin Manis' },
    { id: 'yamin_asin', label: 'Yamin Asin' },
    { id: 'topping', label: 'Topping' },
    { id: 'minuman', label: 'Minuman & Jus' },
  ];

  const refreshPhotos = () => {
    setCustomPhotos(getCustomMenuPhotos());
  };

  useEffect(() => {
    const handleUpdate = () => refreshPhotos();
    window.addEventListener('ks_menu_photos_updated', handleUpdate);
    return () => window.removeEventListener('ks_menu_photos_updated', handleUpdate);
  }, []);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const filteredItems = MENU_ITEMS.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.composition.toString().toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenUploadModal = (item: MenuItem) => {
    setActiveItemForUpload(item);
    setPreviewDataUrl(customPhotos[item.id] || item.image);
    setInputUrl(customPhotos[item.id] || '');
    setUseUrlMode(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const compressedBase64 = await compressImageFile(file, 600, 600, 0.82);
      setPreviewDataUrl(compressedBase64);
      showStatus('success', 'Foto berhasil diproses & dikompresi!');
    } catch (err: any) {
      showStatus('error', err.message || 'Gagal memproses gambar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavePhoto = () => {
    if (!activeItemForUpload) return;

    const finalPhoto = useUrlMode ? inputUrl.trim() : previewDataUrl;
    if (!finalPhoto) {
      showStatus('error', 'Silakan pilih foto terlebih dahulu.');
      return;
    }

    saveCustomMenuPhoto(activeItemForUpload.id, finalPhoto);
    showStatus('success', `Foto untuk "${activeItemForUpload.name}" berhasil disimpan!`);
    refreshPhotos();
    setActiveItemForUpload(null);
  };

  const handleResetToDefault = (itemId: string, itemName: string) => {
    removeCustomMenuPhoto(itemId);
    showStatus('success', `Foto "${itemName}" dikembalikan ke default.`);
    refreshPhotos();
    if (activeItemForUpload?.id === itemId) {
      setActiveItemForUpload(null);
    }
  };

  const handleResetAll = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh foto menu ke foto bawaan?')) {
      resetAllCustomMenuPhotos();
      refreshPhotos();
      showStatus('success', 'Seluruh foto menu telah dikembalikan ke bawaan.');
    }
  };

  const customCount = Object.keys(customPhotos).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Notice */}
      {statusMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-bold animate-slide-up ${
            statusMessage.type === 'success'
              ? 'bg-forest-900 text-white border-forest-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-gold-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-300" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Kelola Foto Menu Makanan & Minuman
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unggah dan ganti foto setiap menu mie baso langsung dari kamera HP atau file galeri. Foto otomatis muncul di katalog pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-xs font-bold">
            <span>{customCount} dari {MENU_ITEMS.length} foto kustom terpasang</span>
          </div>

          {customCount > 0 && (
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold transition-all"
              title="Reset Semua ke Default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Category & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as MenuCategory)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-forest-800 text-white shadow-md shadow-forest-800/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu baso / minuman..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Grid of Menu Cards with Photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const currentPhoto = customPhotos[item.id] || item.image;
          const isCustom = !!customPhotos[item.id];

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo Display Card with Hover Actions */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-3.5 group">
                  <img
                    src={currentPhoto}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.svg';
                    }}
                  />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm ${
                        isCustom
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/95 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isCustom ? 'Foto Kustom' : 'Foto Bawaan'}
                    </span>
                  </div>

                  {/* Zoom Full Photo Button */}
                  <button
                    onClick={() => setViewFullPhoto({ name: item.name, url: currentPhoto })}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-all"
                    title="Lihat Foto Ukuran Penuh"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Title & Price */}
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {item.name}
                </h3>
                <p className="text-xs text-forest-800 font-black mt-0.5">
                  {formatRupiah(item.price)}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {item.description || (Array.isArray(item.composition) ? item.composition.join(', ') : item.composition)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenUploadModal(item)}
                  className="flex-1 py-2 px-3 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-95 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-gold-400" />
                  <span>{isCustom ? 'Ganti Foto' : 'Unggah Foto'}</span>
                </button>

                {isCustom && (
                  <button
                    onClick={() => handleResetToDefault(item.id, item.name)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                    title="Kembalikan ke Foto Default"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL UPLOAD / GANTI FOTO */}
      {activeItemForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-forest-800 to-forest-900 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">Unggah Foto Menu</h3>
                <p className="text-xs text-forest-200 mt-0.5">{activeItemForUpload.name}</p>
              </div>
              <button
                onClick={() => setActiveItemForUpload(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              {/* Preview Box */}
              <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group">
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Preview Menu"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold">Pilih foto dari galeri atau kamera HP</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-xs font-bold">
                    <span>Mengompresi foto...</span>
                  </div>
                )}
              </div>

              {/* Mode Toggle: File vs URL */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setUseUrlMode(false)}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    !useUrlMode ? 'bg-white text-forest-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>File / Kamera HP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUseUrlMode(true)}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    useUrlMode ? 'bg-white text-forest-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Input Link / URL</span>
                </button>
              </div>

              {/* File Input Form */}
              {!useUrlMode ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-forest-600 bg-forest-50/60 hover:bg-forest-50 text-forest-800 text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4 text-forest-700" />
                    <span>Pilih Foto dari Perangkat / Kamera</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-1.5">
                    Mendukung JPG, PNG, WebP (otomatis dioptimalkan untuk HP)
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Foto Online:
                  </label>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      setPreviewDataUrl(e.target.value);
                    }}
                    placeholder="https://example.com/foto-mie-baso.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveItemForUpload(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={!previewDataUrl || isProcessing}
                  onClick={handleSavePhoto}
                  className="flex-1 py-3 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-95 text-white text-xs font-extrabold shadow-lg shadow-forest-800/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-gold-400" />
                  <span>Simpan Foto</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* FULL PHOTO PREVIEW MODAL */}
      {viewFullPhoto && (
        <div
          onClick={() => setViewFullPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden p-3 shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">{viewFullPhoto.name}</h4>
              <button
                onClick={() => setViewFullPhoto(null)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden mt-2 bg-slate-100">
              <img
                src={viewFullPhoto.url}
                alt={viewFullPhoto.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
