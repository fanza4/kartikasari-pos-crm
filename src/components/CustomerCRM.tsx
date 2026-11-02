import React, { useState, useEffect, useMemo } from 'react';
import { Customer, CustomerSegment, Order, Transaction } from '../types';
import {
  getCustomers,
  saveCustomer,
  deleteCustomer,
  updateCustomerStamps,
  getCustomerOrderHistory,
  subscribeToCrmChanges,
  formatRupiah,
  formatDateIndo,
  getCustomerSegment,
  getSegmentBadge,
  getPromoWhatsAppUrl,
} from '../services/storage';
import { fetchCloudCustomers, subscribeToCloudCustomers } from '../services/supabaseCustomers';
import {
  Users,
  Search,
  MessageSquare,
  Award,
  Clock,
  DollarSign,
  Plus,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Eye,
  TrendingUp,
  Phone,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const CustomerCRM: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<'all' | CustomerSegment>('all');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Baru saja');
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [realtimeNotice, setRealtimeNotice] = useState<string | null>(null);

  // Selected customer for detail drawer
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);
  const [customerHistory, setCustomerHistory] = useState<{ orders: Order[]; transactions: Transaction[] }>({
    orders: [],
    transactions: [],
  });

  // WhatsApp promo dialog state
  const [selectedCustomerForPromo, setSelectedCustomerForPromo] = useState<Customer | null>(null);
  const [promoMessageTemplate, setPromoMessageTemplate] = useState(
    'Sampurasun Kak {nama}! 🍜\nAda promo spesial *GRATIS Es Jeruk Segar* untuk kunjungan Kakak minggu ini di Mie Baso Kartika Sari Otista Garut pada pembelian mie komplit!\n\nTunjukkan pesan ini ke kasir ya Kak. Ditunggu kedatangannya! 🙏'
  );

  // New Customer Modal
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // 1. REAL-TIME SUBSCRIPTION
  useEffect(() => {
    // Initial fetch from cloud
    fetchCloudCustomers()
      .then((cloudCusts) => {
        if (cloudCusts && cloudCusts.length > 0) {
          setCustomers((prev) => {
            const map = new Map<string, Customer>();
            prev.forEach((c) => map.set(c.id, c));
            cloudCusts.forEach((c) => {
              const ex = map.get(c.id);
              if (!ex || (c.stampsCount || 0) >= (ex.stampsCount || 0)) {
                map.set(c.id, c);
              }
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    const unsubscribeLocal = subscribeToCrmChanges(() => {
      const latest = getCustomers();
      setCustomers((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(latest)) {
          return latest;
        }
        return prev;
      });
    });

    const unsubscribeCloud = subscribeToCloudCustomers((cloudCust) => {
      setCustomers((prev) => {
        const index = prev.findIndex((c) => c.id === cloudCust.id || (c.whatsapp && c.whatsapp === cloudCust.whatsapp));
        const updated = [...prev];
        if (index >= 0) {
          updated[index] = cloudCust;
        } else {
          updated.unshift(cloudCust);
        }
        const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(`Pukul ${nowStr}`);
        setRealtimeNotice('⚡ Data CRM berhasil disinkronkan secara real-time!');
        setTimeout(() => setRealtimeNotice(null), 3500);
        return updated;
      });
    });

    return () => {
      unsubscribeLocal();
      unsubscribeCloud();
    };
  }, []);

  // Update customer detail history when a customer is selected
  useEffect(() => {
    if (selectedCustomerForDetail) {
      const history = getCustomerOrderHistory(selectedCustomerForDetail.whatsapp || selectedCustomerForDetail.name);
      setCustomerHistory(history);
    }
  }, [selectedCustomerForDetail, customers]);

  const refreshCustomers = () => {
    setIsManualRefreshing(true);
    const updated = getCustomers();
    setCustomers(updated);
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSyncTime(`Pukul ${nowStr}`);
    setTimeout(() => {
      setIsManualRefreshing(false);
    }, 400);
  };

  // KPI calculations
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalLTV = customers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0);
    const totalStamps = customers.reduce((sum, c) => sum + (c.stampsCount || 0), 0);
    const vips = customers.filter((c) => getCustomerSegment(c) === 'vip').length;
    const newCustomers = customers.filter((c) => getCustomerSegment(c) === 'new').length;
    const atRisk = customers.filter((c) => getCustomerSegment(c) === 'at_risk').length;

    return { totalCustomers, totalLTV, totalStamps, vips, newCustomers, atRisk };
  }, [customers]);

  // Filter logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const segment = getCustomerSegment(cust);
      if (selectedSegmentFilter !== 'all' && segment !== selectedSegmentFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const phone = (cust.whatsapp || cust.phone || '').toLowerCase();
        return cust.name.toLowerCase().includes(q) || phone.includes(q);
      }
      return true;
    });
  }, [customers, selectedSegmentFilter, searchQuery]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name: newCustName.trim(),
      whatsapp: newCustPhone.trim(),
      phone: newCustPhone.trim(),
      totalVisits: 1,
      lifetimeValue: 26000,
      stampsCount: 1,
      rewardsClaimed: 0,
      lastVisit: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    saveCustomer(newCust);
    refreshCustomers();
    setIsNewCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  const handleStampChange = (customerId: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    updateCustomerStamps(customerId, delta);
    refreshCustomers();
  };

  const handleDeleteCustomer = (customerId: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Hapus pelanggan "${name}" dari direktori CRM?`)) {
      deleteCustomer(customerId);
      if (selectedCustomerForDetail?.id === customerId) {
        setSelectedCustomerForDetail(null);
      }
      refreshCustomers();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Realtime Alert Banner */}
      {realtimeNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-md flex items-center justify-between text-xs font-bold transition-all animate-fade-in">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold-300 animate-bounce" />
            <span>{realtimeNotice}</span>
          </div>
          <button onClick={() => setRealtimeNotice(null)} className="opacity-80 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CRM Header with Real-Time Badge */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-forest-50 border border-forest-100 text-forest-800 shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Customer Directory & Retensi CRM
                </h2>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-Time Live</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Pembaruan otomatis • Sinkron: <span className="font-semibold text-slate-700">{lastSyncTime}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={refreshCustomers}
            title="Segarkan data CRM sekarang"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isManualRefreshing ? 'animate-spin text-forest-700' : ''}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={() => setIsNewCustomerModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Pelanggan</span>
          </button>
        </div>
      </div>

      {/* Real-Time KPI Cards (Responsive for Phone 2-Col Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-bold">
            <span>Total Pelanggan</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-forest-700" />
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalCustomers}</span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
              +{stats.newCustomers} baru
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 sm:mt-1 truncate">Direktori terdaftar</p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-bold">
            <span>Akumulasi LTV</span>
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <span className="text-base sm:text-2xl font-black text-slate-900 truncate block">
              {formatRupiah(stats.totalLTV)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 sm:mt-1 truncate">Total nilai belanja</p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-bold">
            <span>Stempel Beredar</span>
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalStamps}</span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200">
              Aktif
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 sm:mt-1 truncate">Loyalitas mie</p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-bold">
            <span>Pelanggan VIP</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900">{stats.vips}</span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-full">
              {stats.atRisk} sapaan
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 sm:mt-1 truncate">&gt; 5 kunjungan</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau no. WhatsApp pelanggan..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-forest-600 outline-none bg-white shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Segment Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedSegmentFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              selectedSegmentFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua ({customers.length})
          </button>
          <button
            onClick={() => setSelectedSegmentFilter('vip')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              selectedSegmentFilter === 'vip'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            👑 VIP
          </button>
          <button
            onClick={() => setSelectedSegmentFilter('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              selectedSegmentFilter === 'new'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🌱 Baru
          </button>
          <button
            onClick={() => setSelectedSegmentFilter('at_risk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              selectedSegmentFilter === 'at_risk'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            ⚠️ At-Risk
          </button>
        </div>
      </div>

      {/* Customers Mobile Card View (Optimized for Smartphones) */}
      <div className="sm:hidden space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
            Tidak ada pelanggan yang cocok dengan pencarian / filter.
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const segment = getCustomerSegment(cust);
            const badge = getSegmentBadge(segment);

            return (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomerForDetail(cust)}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3 active:scale-[0.99] transition-all cursor-pointer"
              >
                {/* Header: Name, Segment, WA */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
                      <span>{cust.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {cust.whatsapp || cust.phone || '-'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${badge.bg}`}>
                    {badge.badge}
                  </span>
                </div>

                {/* 3 Quick Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Kunjungan</span>
                    <span className="font-extrabold text-slate-800">{cust.totalVisits}x</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Stempel</span>
                    <span className="font-extrabold text-forest-800">🍜 {cust.stampsCount}/10</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Total LTV</span>
                    <span className="font-extrabold text-slate-900 truncate block">{formatRupiah(cust.lifetimeValue)}</span>
                  </div>
                </div>

                {/* 1-Tap Stamp Controls & Actions */}
                <div className="flex items-center justify-between pt-1 gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="inline-flex items-center gap-1.5 bg-forest-50 border border-forest-200 px-2 py-1 rounded-xl">
                    <button
                      onClick={(e) => handleStampChange(cust.id, -1, e)}
                      disabled={cust.stampsCount <= 0}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center active:scale-90 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="text-[11px] font-bold text-forest-900 px-1">
                      Stempel
                    </span>
                    <button
                      onClick={(e) => handleStampChange(cust.id, 1, e)}
                      disabled={cust.stampsCount >= 10}
                      className="w-6 h-6 rounded-lg bg-forest-800 text-white font-bold text-xs flex items-center justify-center active:scale-90 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedCustomerForPromo(cust)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Promo WA</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteCustomer(cust.id, cust.name, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 active:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Customers Table View (Tablet & Desktop) */}
      <div className="hidden sm:block bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Status & Label</th>
                <th className="py-3.5 px-4 text-center">Kunjungan</th>
                <th className="py-3.5 px-4 text-center">Stempel</th>
                <th className="py-3.5 px-4 text-right">Total Belanja (LTV)</th>
                <th className="py-3.5 px-4">Kunjungan Terakhir</th>
                <th className="py-3.5 px-4 text-right">Aksi Real-Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada pelanggan yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const segment = getCustomerSegment(cust);
                  const badge = getSegmentBadge(segment);

                  return (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedCustomerForDetail(cust)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Name & Phone */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 group-hover:text-forest-800 transition-colors flex items-center gap-1.5">
                          <span>{cust.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">{cust.whatsapp || cust.phone || '-'}</p>
                      </td>

                      {/* Status Label */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${badge.bg}`}>
                          {badge.badge}
                        </span>
                      </td>

                      {/* Total Visits */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {cust.totalVisits}x
                      </td>

                      {/* Stamps with 1-Click Interactive Controls */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-forest-50/80 border border-forest-200/80 px-2 py-1 rounded-xl">
                          <button
                            onClick={(e) => handleStampChange(cust.id, -1, e)}
                            title="Kurangi 1 stempel"
                            disabled={cust.stampsCount <= 0}
                            className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="font-bold text-forest-800 text-xs px-1">
                            🍜 {cust.stampsCount}/10
                          </span>
                          <button
                            onClick={(e) => handleStampChange(cust.id, 1, e)}
                            title="Tambah 1 stempel real-time"
                            disabled={cust.stampsCount >= 10}
                            className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* LTV */}
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatRupiah(cust.lifetimeValue)}
                      </td>

                      {/* Last Visit */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDateIndo(cust.lastVisit || cust.lastVisitDate || '')}
                      </td>

                      {/* Actions: Detail, WhatsApp Promo & Delete */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedCustomerForDetail(cust)}
                            title="Lihat riwayat pesanan & profil"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedCustomerForPromo(cust)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-sm transition-all active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Promo 1-Klik</span>
                          </button>

                          <button
                            onClick={(e) => handleDeleteCustomer(cust.id, cust.name, e)}
                            title="Hapus data pelanggan"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail & Real-Time History Slide-over Modal */}
      {selectedCustomerForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-forest-800 to-forest-900 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-gold-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    Profil Pelanggan & Riwayat Transaksi
                  </h3>
                  <p className="text-xs text-forest-200">
                    ID: {selectedCustomerForDetail.id} • Terdaftar sejak {formatDateIndo(selectedCustomerForDetail.createdAt || selectedCustomerForDetail.lastVisit || '')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerForDetail(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Profile Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Nama Pelanggan</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedCustomerForDetail.name}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">No. WhatsApp</span>
                  <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {selectedCustomerForDetail.whatsapp || selectedCustomerForDetail.phone || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Total Kunjungan</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedCustomerForDetail.totalVisits} kali</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Lifetime Value (LTV)</span>
                  <p className="font-bold text-forest-800 text-sm mt-0.5">{formatRupiah(selectedCustomerForDetail.lifetimeValue)}</p>
                </div>
              </div>

              {/* Visual 10-Stamp Card */}
              <div className="bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 p-5 rounded-2xl text-white shadow-lg border border-forest-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-gold-400" />
                    <span className="font-black text-sm tracking-wide">KARTU STEMPEL DIGITAL PELANGGAN</span>
                  </div>
                  <span className="text-xs bg-gold-400/20 text-gold-300 px-2.5 py-0.5 rounded-full font-bold border border-gold-400/40">
                    {selectedCustomerForDetail.stampsCount} / 10 Stempel
                  </span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 my-4">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const isCollected = idx < selectedCustomerForDetail.stampsCount;
                    const isReward = idx === 9;

                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 border text-center transition-all ${
                          isCollected
                            ? 'bg-gold-400 text-forest-950 border-gold-300 font-black shadow-md scale-105'
                            : isReward
                            ? 'bg-white/10 border-gold-400/50 text-gold-300 font-bold'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                      >
                        {isCollected ? (
                          <span className="text-base">🍜</span>
                        ) : isReward ? (
                          <span className="text-xs font-black">GRATIS</span>
                        ) : (
                          <span className="text-xs font-semibold">{idx + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-forest-200">
                    {selectedCustomerForDetail.stampsCount >= 10
                      ? '🎉 Berhak mengklaim 1 porsi mie gratis!'
                      : `Kurang ${10 - selectedCustomerForDetail.stampsCount} stempel lagi untuk reward gratis.`}
                  </span>

                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => handleStampChange(selectedCustomerForDetail.id, -1, e)}
                      disabled={selectedCustomerForDetail.stampsCount <= 0}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 font-bold"
                    >
                      -1 Stempel
                    </button>
                    <button
                      onClick={(e) => handleStampChange(selectedCustomerForDetail.id, 1, e)}
                      disabled={selectedCustomerForDetail.stampsCount >= 10}
                      className="px-2 py-1 rounded bg-gold-500 text-forest-950 hover:bg-gold-400 disabled:opacity-30 font-bold"
                    >
                      +1 Stempel
                    </button>
                  </div>
                </div>
              </div>

              {/* Order & Transaction History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-forest-800" />
                    <span>Riwayat Pesanan & Transaksi Real-Time</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    {customerHistory.orders.length} pesanan online, {customerHistory.transactions.length} struk kasir
                  </span>
                </div>

                {customerHistory.orders.length === 0 && customerHistory.transactions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    Belum ada riwayat transaksi detail tercatat untuk pelanggan ini.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {/* Orders */}
                    {customerHistory.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{ord.id}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {ord.orderType === 'dine_in' ? 'Makan di Tempat' : 'Bungkus / Takeaway'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.paymentStatus === 'Sudah Dibayar'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.paymentStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {formatDateIndo(ord.createdAt)} • {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">{formatRupiah(ord.totalAmount)}</p>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">{ord.paymentMethod}</span>
                        </div>
                      </div>
                    ))}

                    {/* Transactions */}
                    {customerHistory.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 shadow-sm flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">Nota #{tx.invoiceNumber}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Kasir POS Selesai
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {formatDateIndo(tx.createdAt)} • +{tx.stampsEarned} stempel diperoleh
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">{formatRupiah(tx.totalAmount)}</p>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">{tx.paymentMethod}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCustomerForDetail(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = selectedCustomerForDetail;
                  setSelectedCustomerForDetail(null);
                  setSelectedCustomerForPromo(target);
                }}
                className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kirim Promo WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 1-Click WhatsApp Promo Modal */}
      {selectedCustomerForPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            <div className="bg-gradient-to-r from-forest-800 to-forest-900 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-gold-400" />
                <h3 className="text-base font-bold tracking-tight">
                  Kirim Promo WhatsApp Personal
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomerForPromo(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500">Tujuan Penerima:</span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedCustomerForPromo.name} ({selectedCustomerForPromo.whatsapp || selectedCustomerForPromo.phone})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pesan Promo (Bisa Diedit):
                </label>
                <textarea
                  rows={6}
                  value={promoMessageTemplate}
                  onChange={(e) => setPromoMessageTemplate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-forest-600 outline-none"
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tag <code>{`{nama}`}</code> akan otomatis diganti dengan nama pelanggan.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForPromo(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <a
                  href={getPromoWhatsAppUrl(selectedCustomerForPromo, promoMessageTemplate)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setSelectedCustomerForPromo(null)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Buka di WhatsApp & Kirim</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-forest-800 p-5 text-white flex justify-between items-center">
              <h3 className="text-base font-bold">Tambah Pelanggan Baru</h3>
              <button
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pelanggan
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
