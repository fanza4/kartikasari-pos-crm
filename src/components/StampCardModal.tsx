import React, { useState } from 'react';
import { Customer } from '../types';
import { findCustomerByPhoneOrName, getCustomers, saveCustomer } from '../services/storage';
import { Award, Search, X, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StampCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StampCardModal: React.FC<StampCardModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const found = findCustomerByPhoneOrName(searchQuery);
    setCustomer(found || null);
    setHasSearched(true);

    if (found && found.stampsCount >= 10) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !phoneInput.trim()) return;

    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name: nameInput.trim(),
      whatsapp: phoneInput.trim(),
      totalVisits: 1,
      lifetimeValue: 26000,
      stampsCount: 1,
      rewardsClaimed: 0,
      lastVisit: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    saveCustomer(newCust);
    setCustomer(newCust);
    setIsRegistering(false);
    setHasSearched(true);
    setSearchQuery(phoneInput.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-800 to-forest-900 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-400/20 border border-gold-400/40 flex items-center justify-center text-gold-400 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Kartu Stempel Loyalitas
              </h3>
              <p className="text-xs text-forest-200">
                Mie Baso & Aneka Jus Kartika Sari Garut
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Lookup Input Form */}
          {!customer && !isRegistering && (
            <form onSubmit={handleSearch} className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Cek Stempel dengan No. WhatsApp atau Nama:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Contoh: 081223456789 atau Asep"
                    className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  Cari
                </button>
              </div>

              {/* Sample list hint */}
              <div className="pt-2 text-[11px] text-slate-500">
                <span>Coba nomor sampel: </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('081223456789')}
                  className="font-mono text-forest-800 underline mr-2"
                >
                  081223456789 (Kang Asep)
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery('082155443322')}
                  className="font-mono text-forest-800 underline"
                >
                  082155443322 (Ibu Hj. Siti)
                </button>
              </div>
            </form>
          )}

          {/* Not Found -> Registration prompt */}
          {hasSearched && !customer && !isRegistering && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <div>
                <p className="text-sm font-bold text-amber-900">
                  Data Pelanggan Belum Ditemukan
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Belum punya kartu stempel? Daftarkan nomor WhatsApp kamu sekarang untuk mulai kumpulkan stempel mie gratis!
                </p>
              </div>
              <button
                onClick={() => setIsRegistering(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-900 font-bold text-xs shadow transition-all"
              >
                + Buka Kartu Stempel Baru
              </button>
            </div>
          )}

          {/* Registration Form */}
          {isRegistering && (
            <form onSubmit={handleRegister} className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pendaftaran Kartu Stempel Baru
              </h4>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Nama kamu..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nomor WhatsApp Aktif
                </label>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-600 outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-forest-800 text-white text-xs font-bold shadow"
                >
                  Simpan & Dapatkan 1 Stempel
                </button>
              </div>
            </form>
          )}

          {/* Found Customer Stamp Card Display */}
          {customer && (
            <div className="space-y-5 animate-fade-in">
              {/* Member Card Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-forest-800 to-forest-950 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-gold-400 text-slate-900 mb-1">
                      KARTU MEMBER SETIA
                    </span>
                    <h4 className="text-lg font-bold tracking-tight">{customer.name}</h4>
                    <p className="text-xs text-forest-200 font-mono mt-0.5">{customer.whatsapp}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-gold-400">
                      {customer.stampsCount}
                      <span className="text-xs text-white/70 font-normal"> / 10</span>
                    </span>
                    <p className="text-[10px] text-forest-300">Stempel Terkumpul</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-gold-400 to-amber-300 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (customer.stampsCount / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 10 Stamps Grid */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Koleksi Stempel Mangkok Mie 🍜
                  </span>
                  <span className="text-xs text-forest-800 font-semibold">
                    {10 - customer.stampsCount > 0
                      ? `${10 - customer.stampsCount} stempel lagi menuju GRATIS`
                      : 'SIAP KLAIM PORSI GRATIS!'}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const isCollected = idx < customer.stampsCount;
                    const isTenth = idx === 9;

                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 text-center border-2 transition-all ${
                          isCollected
                            ? 'bg-forest-50 border-forest-600 text-forest-800 shadow-sm scale-100'
                            : 'bg-slate-50 border-dashed border-slate-300 text-slate-300'
                        } ${isTenth && isCollected ? 'ring-2 ring-gold-400 bg-gold-50 border-gold-500' : ''}`}
                      >
                        <span className="text-xl sm:text-2xl">
                          {isCollected ? '🍜' : isTenth ? '🎁' : '⭕'}
                        </span>
                        <span className="text-[9px] font-bold mt-1">
                          {isTenth ? 'GRATIS' : `#${idx + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reward status alert */}
              {customer.stampsCount >= 10 ? (
                <div className="p-3.5 rounded-2xl bg-gold-50 border border-gold-300 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-gold-600 flex-shrink-0" />
                  <div className="text-xs text-gold-900">
                    <p className="font-extrabold text-sm">SELAMAT! STAMPS PENUH! 🎉</p>
                    <p className="text-[11px] mt-0.5">
                      Tunjukkan kartu ini kepada kasir saat memesan untuk menikmati <strong>1 porsi Mie Kuah / Yamin GRATIS</strong>!
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Reset Search Button */}
              <button
                type="button"
                onClick={() => {
                  setCustomer(null);
                  setSearchQuery('');
                  setHasSearched(false);
                }}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 underline text-center"
              >
                Cek Nomor Lain
              </button>
            </div>
          )}

          {/* Stamp Explanation */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
            <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />
              Aturan Program Loyalitas Kartika Sari:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              <li>Setiap pembelian 1 porsi mie baso otomatis mendapat <strong>1 stempel</strong>.</li>
              <li>Stempel ke-10 berhak mendapatkan <strong>1 porsi Mie Kuah / Yamin GRATIS</strong>.</li>
              <li>Cukup sebutkan nama / nomor WhatsApp saat membayar di kasir.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
