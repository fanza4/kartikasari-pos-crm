import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCustomerOrder } from '../context/CustomerOrderContext';
import {
  Lock,
  LogOut,
  Award,
  Store,
  Users,
  BarChart3,
  ShoppingBag,
  Bell,
  Clock,
  ListOrdered,
  Camera,
} from 'lucide-react';

interface NavbarProps {
  activeAdminTab: 'orders' | 'pos' | 'menu' | 'crm' | 'reports';
  setActiveAdminTab: (tab: 'orders' | 'pos' | 'menu' | 'crm' | 'reports') => void;
  onOpenStampModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeAdminTab,
  setActiveAdminTab,
  onOpenStampModal,
}) => {
  const { isAdmin, logout, openLoginModal } = useAuth();
  const { newOrderCount, cartItemCount, activeOrder } = useCustomerOrder();

  return (
    <>
      <header className="sticky top-0 z-40 glass-nav border-b border-forest-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            
            {/* Logo & Store Branding */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative group cursor-pointer shrink-0">
                <img
                  src="/logo.jpg"
                  alt="Mie Baso Kartika Sari KS Logo"
                  className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 border-gold-400 shadow-md object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-forest-600 border border-white flex items-center justify-center text-[7px] sm:text-[8px] text-white font-bold">
                  KS
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-xl font-extrabold text-forest-800 tracking-tight leading-tight">
                    Mie Baso Kartika Sari
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-gold-100 text-gold-800 border border-gold-300">
                    Garut
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate max-w-[150px] xs:max-w-[200px] sm:max-w-xs">
                  Jl. Otista No 127 Paseban • Garut
                </p>
              </div>
            </div>

            {/* Desktop Admin Navigation Tabs (if logged in) */}
            {isAdmin ? (
              <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                {/* Order Queue with Live Badge */}
                <button
                  onClick={() => setActiveAdminTab('orders')}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeAdminTab === 'orders'
                      ? 'bg-forest-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-forest-800 hover:bg-white/50'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Antrean Pesanan</span>
                  {newOrderCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                      {newOrderCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveAdminTab('pos')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeAdminTab === 'pos'
                      ? 'bg-forest-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-forest-800 hover:bg-white/50'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Touch POS Kasir</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('menu')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeAdminTab === 'menu'
                      ? 'bg-forest-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-forest-800 hover:bg-white/50'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Foto Menu</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('crm')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeAdminTab === 'crm'
                      ? 'bg-forest-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-forest-800 hover:bg-white/50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>CRM Pelanggan</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('reports')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeAdminTab === 'reports'
                      ? 'bg-forest-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-forest-800 hover:bg-white/50'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Laporan & Omset</span>
                </button>
              </div>
            ) : null}

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              
              {/* Stamp Card Button (For public customer) */}
              {!isAdmin && (
                <button
                  onClick={onOpenStampModal}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gold-50 hover:bg-gold-100 text-gold-900 border border-gold-300 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
                >
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
                  <span className="hidden sm:inline">Kartu Stempel</span>
                  <span className="sm:hidden">Stempel</span>
                </button>
              )}

              {/* Admin Toggle / Gatekeeper */}
              {isAdmin ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-forest-100 text-forest-800">
                    <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse"></span>
                    Kasir Aktif
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-semibold transition-all active:scale-95"
                    title="Kembali ke Mode Pelanggan"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Keluar Kasir</span>
                    <span className="sm:hidden">Keluar</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs sm:text-sm font-bold shadow-md shadow-forest-800/20 transition-all active:scale-95"
                >
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-400" />
                  <span className="hidden xs:inline">Akses Kasir / Admin</span>
                  <span className="xs:hidden">Kasir</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Native Mobile App Fixed Bottom Tab Bar for Admin (Smartphone View) */}
      {isAdmin && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 flex items-center justify-around shadow-2xl pb-safe">
          <button
            onClick={() => setActiveAdminTab('orders')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all relative ${
              activeAdminTab === 'orders' ? 'text-forest-800' : 'text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${activeAdminTab === 'orders' ? 'bg-forest-100' : ''}`}>
              <ListOrdered className="w-4 h-4" />
            </div>
            <span>Antrean</span>
            {newOrderCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1 right-2 ring-2 ring-white"></span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('pos')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
              activeAdminTab === 'pos' ? 'text-forest-800' : 'text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${activeAdminTab === 'pos' ? 'bg-forest-100' : ''}`}>
              <Store className="w-4 h-4" />
            </div>
            <span>Kasir</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('menu')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
              activeAdminTab === 'menu' ? 'text-forest-800' : 'text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${activeAdminTab === 'menu' ? 'bg-forest-100' : ''}`}>
              <Camera className="w-4 h-4" />
            </div>
            <span>Foto</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('crm')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
              activeAdminTab === 'crm' ? 'text-forest-800' : 'text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${activeAdminTab === 'crm' ? 'bg-forest-100' : ''}`}>
              <Users className="w-4 h-4" />
            </div>
            <span>CRM</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('reports')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
              activeAdminTab === 'reports' ? 'text-forest-800' : 'text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${activeAdminTab === 'reports' ? 'bg-forest-100' : ''}`}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <span>Laporan</span>
          </button>
        </nav>
      )}
    </>
  );
};
