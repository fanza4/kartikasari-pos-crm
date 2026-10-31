import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth, ADMIN_STORAGE_KEY, LEGACY_STORAGE_KEY } from '../src/context/AuthContext';
import { CustomerPortal } from '../src/components/CustomerPortal';
import { CustomerOrderProvider } from '../src/context/CustomerOrderContext';
import { App } from '../src/App';
import { normalizeWhatsAppPhone, formatRupiah } from '../src/utils/formatters';
import { DEFAULT_STORE_SETTINGS } from '../src/data/menuData';

describe('Milestone 2 Enhancements Verification Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  describe('1. AuthContext: Dual Session Keys & Password Management', () => {
    it('M2.1: defines primary storage key as ks_admin_session and legacy as ks_admin_auth_v1', () => {
      expect(ADMIN_STORAGE_KEY).toBe('ks_admin_session');
      expect(LEGACY_STORAGE_KEY).toBe('ks_admin_auth_v1');
    });

    it('M2.2: successful login persists session into both ks_admin_session and ks_admin_auth_v1', () => {
      let authState: any;
      const TestConsumer = () => {
        authState = useAuth();
        return (
          <button onClick={() => authState.login('mfanza123@gmail.com', 'yoiyoiyoi01')}>
            Login
          </button>
        );
      };

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      act(() => {
        authState.login('mfanza123@gmail.com', 'yoiyoiyoi01');
      });

      expect(authState.isAdmin).toBe(true);

      const primarySession = localStorage.getItem('ks_admin_session');
      const legacySession = localStorage.getItem('ks_admin_auth_v1');

      expect(primarySession).not.toBeNull();
      expect(legacySession).not.toBeNull();

      const parsedPrimary = JSON.parse(primarySession!);
      expect(parsedPrimary.email).toBe('mfanza123@gmail.com');
      expect(parsedPrimary.expires).toBeGreaterThan(Date.now());
    });

    it('M2.3: logout removes both ks_admin_session and ks_admin_auth_v1', () => {
      let authState: any;
      const TestConsumer = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      act(() => {
        authState.login('mfanza123@gmail.com', 'yoiyoiyoi01');
      });

      expect(localStorage.getItem('ks_admin_session')).not.toBeNull();
      expect(localStorage.getItem('ks_admin_auth_v1')).not.toBeNull();

      act(() => {
        authState.logout();
      });

      expect(authState.isAdmin).toBe(false);
      expect(localStorage.getItem('ks_admin_session')).toBeNull();
      expect(localStorage.getItem('ks_admin_auth_v1')).toBeNull();
    });

    it('M2.4: initializes active session from primary key ks_admin_session on startup', () => {
      localStorage.setItem(
        'ks_admin_session',
        JSON.stringify({
          email: 'mfanza123@gmail.com',
          expires: Date.now() + 100000,
        })
      );

      let authState: any;
      const TestConsumer = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      expect(authState.isAdmin).toBe(true);
      expect(authState.adminEmail).toBe('mfanza123@gmail.com');
    });

    it('M2.5: initializes active session from legacy key ks_admin_auth_v1 as backward compatible fallback', () => {
      localStorage.setItem(
        'ks_admin_auth_v1',
        JSON.stringify({
          email: 'mfanza123@gmail.com',
          expires: Date.now() + 100000,
        })
      );

      let authState: any;
      const TestConsumer = () => {
        authState = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      expect(authState.isAdmin).toBe(true);
      expect(authState.adminEmail).toBe('mfanza123@gmail.com');
    });
  });

  describe('2. URL Route Guarding & Route Synchronization in App', () => {
    it('M2.6: unauthenticated navigation to /admin/pos redirects to / and opens login modal', () => {
      window.history.replaceState({}, '', '/admin/pos');

      render(<App />);

      expect(window.location.pathname).toBe('/');
      // Login modal elements should appear
      expect(screen.getByText('Akses Kasir & Manajemen')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Masukkan kata sandi...')).toBeInTheDocument();
    });

    it('M2.7: unauthenticated navigation to /login opens login modal', () => {
      window.history.replaceState({}, '', '/login');

      render(<App />);

      expect(screen.getByText('Akses Kasir & Manajemen')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Masukkan kata sandi...')).toBeInTheDocument();
    });

    it('M2.8: authenticated navigation to /admin/crm renders CRM dashboard directly', () => {
      localStorage.setItem(
        'ks_admin_session',
        JSON.stringify({
          email: 'mfanza123@gmail.com',
          expires: Date.now() + 100000,
        })
      );
      window.history.replaceState({}, '', '/admin/crm');

      render(<App />);

      // Should display CRM heading
      expect(screen.getByText(/Customer Directory & Retensi CRM/i)).toBeInTheDocument();
    });

    it('M2.9: authenticated navigation to /admin/reports renders Reports & Analytics dashboard', () => {
      localStorage.setItem(
        'ks_admin_session',
        JSON.stringify({
          email: 'mfanza123@gmail.com',
          expires: Date.now() + 100000,
        })
      );
      window.history.replaceState({}, '', '/admin/reports');

      render(<App />);

      // Should display Reports heading
      expect(screen.getByText(/Laporan Penjualan & Analitik Toko/i)).toBeInTheDocument();
    });
  });

  describe('3. CustomerPortal Visual & Functional Enhancements', () => {
    it('M2.10: displays verbatim digital stamp reward headline "Klaim 1 Porsi Mie Baso Gratis!"', () => {
      const onOpenStampModal = vi.fn();
      render(
        <CustomerOrderProvider>
          <CustomerPortal onOpenStampModal={onOpenStampModal} />
        </CustomerOrderProvider>
      );

      const rewardHeadline = screen.getByText('Klaim 1 Porsi Mie Baso Gratis!');
      expect(rewardHeadline).toBeInTheDocument();
      expect(rewardHeadline.tagName.toLowerCase()).toMatch(/h[1-6]/);
    });

    it('M2.11: renders mapped ingredient composition pills with emerald styling', () => {
      const onOpenStampModal = vi.fn();
      const { container } = render(
        <CustomerOrderProvider>
          <CustomerPortal onOpenStampModal={onOpenStampModal} />
        </CustomerOrderProvider>
      );

      // Look for emerald ingredient pills matching the exact specified classes
      const allSpans = Array.from(container.querySelectorAll('span'));
      const emeraldPills = allSpans.filter((span) =>
        span.className.includes('bg-emerald-50 text-emerald-800 text-xs px-2 py-0.5 rounded-full border border-emerald-200')
      );

      expect(emeraldPills.length).toBeGreaterThan(0);
      const pillTexts = emeraldPills.map((el) => el.textContent?.trim());
      expect(pillTexts).toContain('Mie');
      expect(pillTexts).toContain('1 Baso Urat');
      expect(pillTexts).toContain('3 Baso Kecil');
    });

    it('M2.12: renders food thumbnail image elements on dish cards with fallback handler', () => {
      const onOpenStampModal = vi.fn();
      const { container } = render(
        <CustomerOrderProvider>
          <CustomerPortal onOpenStampModal={onOpenStampModal} />
        </CustomerOrderProvider>
      );

      const menuImages = container.querySelectorAll('img[src^="/menu/"]');
      expect(menuImages.length).toBeGreaterThan(0);

      // Verify image attributes
      const firstImg = menuImages[0] as HTMLImageElement;
      expect(firstImg.alt).toBeDefined();
      expect(firstImg.getAttribute('loading')).toBe('lazy');
    });

    it('M2.13: constructs customer support WhatsApp link using normalizeWhatsAppPhone', () => {
      const onOpenStampModal = vi.fn();
      const { container } = render(
        <CustomerOrderProvider>
          <CustomerPortal onOpenStampModal={onOpenStampModal} />
        </CustomerOrderProvider>
      );

      const expectedPhone = normalizeWhatsAppPhone(DEFAULT_STORE_SETTINGS.phone);
      const waLink = container.querySelector(`a[href*="wa.me/${expectedPhone}"]`);

      expect(waLink).not.toBeNull();
      expect(waLink?.getAttribute('href')).toContain(`wa.me/${expectedPhone}`);
    });

    it('M2.14: formatRupiah imported from formatters formats currency accurately in customer portal', () => {
      expect(formatRupiah(26000)).toBe('Rp 26.000');
      expect(formatRupiah(40000)).toBe('Rp 40.000');
      expect(formatRupiah(48000)).toBe('Rp 48.000');
    });
  });
});
