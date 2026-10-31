import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CustomerOrderProvider } from './context/CustomerOrderContext';
import { Navbar } from './components/Navbar';
import { CustomerPortal } from './components/CustomerPortal';
import { TouchPOS } from './components/TouchPOS';
import { CustomerCRM } from './components/CustomerCRM';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { AdminOrderQueue } from './components/AdminOrderQueue';
import { AdminMenuPhotoManager } from './components/AdminMenuPhotoManager';
import { AdminLoginModal } from './components/AdminLoginModal';
import { StampCardModal } from './components/StampCardModal';
import { WifiOff, Download } from 'lucide-react';

const getInitialAdminTab = (): 'orders' | 'pos' | 'menu' | 'crm' | 'reports' => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/menu')) return 'menu';
    if (path.includes('/crm')) return 'crm';
    if (path.includes('/reports')) return 'reports';
  }
  return 'orders';
};

const AppContent: React.FC = () => {
  const { isAdmin, openLoginModal } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState<'orders' | 'pos' | 'menu' | 'crm' | 'reports'>(getInitialAdminTab);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Synchronize URL and handle Route Guard for /admin/* and /login
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin')) {
        if (!isAdmin) {
          window.history.replaceState({}, '', '/');
          openLoginModal();
        } else {
          if (path.includes('/pos')) {
            setActiveAdminTab('pos');
          } else if (path.includes('/menu')) {
            setActiveAdminTab('menu');
          } else if (path.includes('/crm')) {
            setActiveAdminTab('crm');
          } else if (path.includes('/reports')) {
            setActiveAdminTab('reports');
          } else {
            setActiveAdminTab('orders');
          }
        }
      } else if (path === '/login') {
        if (!isAdmin) {
          openLoginModal();
        }
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [isAdmin, openLoginModal]);

  // Sync route URL when switching tabs as admin or on logout
  const handleAdminTabChange = (tab: 'orders' | 'pos' | 'menu' | 'crm' | 'reports') => {
    setActiveAdminTab(tab);
    if (typeof window !== 'undefined' && isAdmin) {
      window.history.pushState({}, '', `/admin/${tab}`);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname.toLowerCase();
    if (isAdmin) {
      if (!path.startsWith('/admin')) {
        window.history.replaceState({}, '', `/admin/${activeAdminTab}`);
      }
    } else {
      if (path.startsWith('/admin')) {
        window.history.replaceState({}, '', '/');
      }
    }
  }, [isAdmin, activeAdminTab]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA Install prompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    } else {
      alert('Untuk menginstal aplikasi di Android atau iPhone:\n1. Di Chrome Android: Tap menu titik tiga (⋮) lalu pilih "Tambahkan ke Layar Utama" / "Install App".\n2. Di Safari iOS: Tap tombol Bagikan (Share) lalu pilih "Tambah ke Layar Utama" (Add to Home Screen).');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-forest-100 selection:text-forest-900">
      
      {/* Offline Mode Indicator */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-inner">
          <WifiOff className="w-4 h-4" />
          <span>Mode Offline Aktif — Transaksi Kasir tetap tersimpan aman di penyimpanan lokal dan akan tersinkronisasi otomatis.</span>
        </div>
      )}

      {/* Main App Navbar */}
      <Navbar
        activeAdminTab={activeAdminTab}
        setActiveAdminTab={handleAdminTabChange}
        onOpenStampModal={() => setIsStampModalOpen(true)}
      />

      {/* Main Body: Switch between Customer Portal and Admin Back-Office */}
      <div className="flex-1">
        {isAdmin ? (
          <div className="animate-fade-in pb-20 md:pb-6">
            {activeAdminTab === 'orders' && <AdminOrderQueue />}
            {activeAdminTab === 'pos' && <TouchPOS />}
            {activeAdminTab === 'menu' && <AdminMenuPhotoManager />}
            {activeAdminTab === 'crm' && <CustomerCRM />}
            {activeAdminTab === 'reports' && <ReportsAnalytics />}
          </div>
        ) : (
          <CustomerPortal onOpenStampModal={() => setIsStampModalOpen(true)} />
        )}
      </div>

      {/* Floating PWA Install Pill for HP Android & iPhone (Visible on Customer Portal) */}
      {!isAdmin && (
        <div className="fixed bottom-4 left-4 z-30 mb-safe">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-white text-[11px] sm:text-xs font-bold shadow-xl border border-white/20 backdrop-blur-md transition-all active:scale-95 group"
          >
            <Download className="w-3.5 h-3.5 text-gold-400 group-hover:animate-bounce" />
            <span className="hidden sm:inline">Install di HP (Android / iOS)</span>
            <span className="sm:hidden">Install App</span>
          </button>
        </div>
      )}

      {/* Global Modals */}
      <AdminLoginModal />
      <StampCardModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
      />

    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <h2 className="text-xl font-black text-slate-900">Mie Baso Kartika Sari</h2>
            <p className="text-sm text-slate-600">
              Terjadi sedikit kendala teknis saat memuat halaman. Silakan muat ulang aplikasi.
            </p>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="w-full py-3 px-4 bg-forest-800 hover:bg-forest-900 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95"
            >
              Muat Ulang Halaman Utama
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <CustomerOrderProvider>
            <AppContent />
          </CustomerOrderProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
