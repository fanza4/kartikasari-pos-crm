import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth, ADMIN_STORAGE_KEY } from '../src/context/AuthContext';
import { App } from '../src/App';

const EXACT_ERROR_MESSAGE = 'Akses Ditolak: Khusus Pengelola Toko';
const VALID_EMAIL = 'mfanza123@gmail.com';
const VALID_PASSWORD = 'yoiyoiyoi01';

describe('Milestone 2 Challenger Adversarial Stress Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  // =========================================================================
  // 1. EMPIRICAL VERIFICATION: EXACT ERROR REJECTION ("Akses Ditolak: Khusus Pengelola Toko")
  // =========================================================================
  describe('1. Exact Verbatim Error Rejection Across Adversarial Credentials', () => {
    const runLoginTest = (emailInput: any, passInput: any) => {
      let authState: any;
      const TestConsumer = () => {
        authState = useAuth();
        return null;
      };

      const { unmount } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      let result: any;
      act(() => {
        result = authState.login(emailInput, passInput);
      });

      unmount();
      return result;
    };

    it('rejects incorrect emails with valid password with verbatim error message', () => {
      const badEmails = [
        'mfanza@gmail.com',
        'mfanza123@yahoo.com',
        'admin@kartikasari.com',
        'pengelola@miebaso.id',
        'user@example.com',
        'mfanza1234@gmail.com',
        'mfanza12@gmail.com',
      ];

      for (const email of badEmails) {
        const res = runLoginTest(email, VALID_PASSWORD);
        expect(res.success).toBe(false);
        expect(res.error).toBe(EXACT_ERROR_MESSAGE);
      }
    });

    it('rejects correct email with incorrect passwords with verbatim error message', () => {
      const badPasswords = [
        'yoiyoiyoi02',
        'yoiyoiyoi',
        'yoiyoiyoio1',
        'admin123',
        'password',
        '12345678',
        'yoiyoiyoi01!',
        'yoiyoiyoi0',
        'yoiyoiyoi010',
      ];

      for (const pass of badPasswords) {
        const res = runLoginTest(VALID_EMAIL, pass);
        expect(res.success).toBe(false);
        expect(res.error).toBe(EXACT_ERROR_MESSAGE);
      }
    });

    it('rejects casing variations in password strictly (passwords are case-sensitive)', () => {
      const casingVariations = [
        'YOIYOIYOI01',
        'Yoiyoiyoi01',
        'yoiYoiyoi01',
        'yoiyoiyoI01',
        'YoIyOiYoI01',
      ];

      for (const pass of casingVariations) {
        const res = runLoginTest(VALID_EMAIL, pass);
        expect(res.success).toBe(false);
        expect(res.error).toBe(EXACT_ERROR_MESSAGE);
      }
    });

    it('rejects whitespace variations in password strictly', () => {
      const whitespacePasswords = [
        ' yoiyoiyoi01',
        'yoiyoiyoi01 ',
        ' yoiyoiyoi01 ',
        'yoiyoi yoi01',
        '\tyoiyoiyoi01',
        'yoiyoiyoi01\n',
      ];

      for (const pass of whitespacePasswords) {
        const res = runLoginTest(VALID_EMAIL, pass);
        expect(res.success).toBe(false);
        expect(res.error).toBe(EXACT_ERROR_MESSAGE);
      }
    });

    it('rejects empty and whitespace-only credentials with verbatim error message', () => {
      const emptyPairs = [
        { email: '', pass: '' },
        { email: '', pass: VALID_PASSWORD },
        { email: VALID_EMAIL, pass: '' },
        { email: '   ', pass: '   ' },
        { email: '   ', pass: VALID_PASSWORD },
        { email: VALID_EMAIL, pass: '   ' },
        { email: '\t\n\r', pass: '\t\n\r' },
      ];

      for (const { email, pass } of emptyPairs) {
        const res = runLoginTest(email, pass);
        expect(res.success).toBe(false);
        expect(res.error).toBe(EXACT_ERROR_MESSAGE);
      }
    });

    it('rejects SQL injection, XSS, NoSQL, and null-byte payloads with verbatim error message', () => {
      const injectionPayloads = [
        "' OR '1'='1",
        "' OR 1=1 --",
        "admin'--",
        "UNION SELECT null, 'admin'--",
        "<script>alert('xss')</script>",
        '"><svg onload=alert(1)>',
        'javascript:alert(1)',
        '{"$gt": ""}',
        '{"$ne": null}',
        'mfanza123@gmail.com\0',
        'yoiyoiyoi01\0',
        'mfanza123@gmail.com\r\nSet-Cookie: session=evil',
        'A'.repeat(10000), // Buffer overflow attempt
      ];

      for (const payload of injectionPayloads) {
        // As email
        const res1 = runLoginTest(payload, VALID_PASSWORD);
        expect(res1.success).toBe(false);
        expect(res1.error).toBe(EXACT_ERROR_MESSAGE);

        // As password
        const res2 = runLoginTest(VALID_EMAIL, payload);
        expect(res2.success).toBe(false);
        expect(res2.error).toBe(EXACT_ERROR_MESSAGE);

        // As both
        const res3 = runLoginTest(payload, payload);
        expect(res3.success).toBe(false);
        expect(res3.error).toBe(EXACT_ERROR_MESSAGE);
      }
    });

    it('accepts correct credentials even with email casing and trimming variations', () => {
      const validEmailVariations = [
        'mfanza123@gmail.com',
        'MFANZA123@GMAIL.COM',
        '  mfanza123@gmail.com  ',
        'MfAnZa123@GmAiL.cOm',
        '\tmfanza123@gmail.com\n',
      ];

      for (const email of validEmailVariations) {
        const res = runLoginTest(email, VALID_PASSWORD);
        expect(res.success).toBe(true);
        expect(res.error).toBeUndefined();
      }
    });
  });

  // =========================================================================
  // 2. EMPIRICAL VERIFICATION: SESSION PERSISTENCE & CORRUPTION RESILIENCE
  // =========================================================================
  describe('2. Session Persistence Resilience Under Corrupted or Expired Storage', () => {
    const testSessionRestoration = (storedValue: string | null) => {
      if (storedValue !== null) {
        localStorage.setItem(ADMIN_STORAGE_KEY, storedValue);
      }
      let authState: any;
      const TestConsumer = () => {
        authState = useAuth();
        return null;
      };

      const { unmount } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      const isAuthenticated = authState.isAdmin;
      unmount();
      return isAuthenticated;
    };

    it('handles malformed / non-JSON strings in ks_admin_session safely without throwing', () => {
      const corruptPayloads = [
        '{bad_json',
        'undefined',
        '[object Object]',
        'NaN',
        '<<<xml>>>',
        '{"email": ',
        '{"email": "mfanza123@gmail.com", "expires": }',
        'null\x00corrupt',
      ];

      for (const payload of corruptPayloads) {
        expect(() => {
          const isAuthed = testSessionRestoration(payload);
          expect(isAuthed).toBe(false);
        }).not.toThrow();
      }
    });

    it('handles unexpected JSON non-object primitives in ks_admin_session safely without crashing', () => {
      const nonObjectJson = [
        JSON.stringify(null),
        JSON.stringify(true),
        JSON.stringify(false),
        JSON.stringify(42),
        JSON.stringify('a random string'),
        JSON.stringify([1, 2, 3]),
      ];

      for (const json of nonObjectJson) {
        expect(() => {
          const isAuthed = testSessionRestoration(json);
          // Safe handling: no unauthorized admin grant, zero crash
          expect(Boolean(isAuthed)).toBe(false);
        }).not.toThrow();
      }
    });

    it('rejects expired session timestamps safely', () => {
      const expiredPayloads = [
        JSON.stringify({ email: VALID_EMAIL, expires: Date.now() - 1 }),
        JSON.stringify({ email: VALID_EMAIL, expires: Date.now() - 86400000 }), // 1 day ago
        JSON.stringify({ email: VALID_EMAIL, expires: 0 }),
        JSON.stringify({ email: VALID_EMAIL, expires: -100000 }),
        JSON.stringify({ email: VALID_EMAIL, expires: 'forever' }),
        JSON.stringify({ email: VALID_EMAIL, expires: null }),
        JSON.stringify({ email: VALID_EMAIL }), // missing expires
      ];

      for (const payload of expiredPayloads) {
        const isAuthed = testSessionRestoration(payload);
        expect(isAuthed).toBe(false);
      }
    });

    it('rejects sessions with mismatching email safely', () => {
      const mismatchedPayloads = [
        JSON.stringify({ email: 'hacker@store.com', expires: Date.now() + 1000000 }),
        JSON.stringify({ email: '', expires: Date.now() + 1000000 }),
        JSON.stringify({ email: null, expires: Date.now() + 1000000 }),
        JSON.stringify({ expires: Date.now() + 1000000 }),
      ];

      for (const payload of mismatchedPayloads) {
        const isAuthed = testSessionRestoration(payload);
        expect(isAuthed).toBe(false);
      }
    });

    it('survives localStorage.getItem throwing an exception (e.g., Storage disabled / SecurityError)', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('SecurityError: The operation is insecure.');
      });

      expect(() => {
        let authState: any;
        const TestConsumer = () => {
          authState = useAuth();
          return null;
        };
        const { unmount } = render(
          <AuthProvider>
            <TestConsumer />
          </AuthProvider>
        );
        expect(authState.isAdmin).toBe(false);
        unmount();
      }).not.toThrow();

      localStorage.getItem = originalGetItem;
    });
  });

  // =========================================================================
  // 3. EMPIRICAL VERIFICATION: ROUTE GUARDS UNDER RAPID PUSHSTATE / POPSTATE
  // =========================================================================
  describe('3. Route Guards Under Rapid History Navigation Events', () => {
    it('sanitizes URL to / and triggers login modal across rapid unauthenticated popstate events', () => {
      const { container, unmount } = render(<App />);

      const testPaths = [
        '/admin/pos',
        '/admin/crm',
        '/admin/reports',
        '/admin/orders',
        '/admin/unknown-section',
        '/admin/nested/deep/route',
        '/admin/../admin/pos',
        '/login',
      ];

      // Fire 40 rapid route changes
      for (let i = 0; i < 40; i++) {
        const targetPath = testPaths[i % testPaths.length];
        act(() => {
          window.history.pushState({}, '', targetPath);
          window.dispatchEvent(new PopStateEvent('popstate'));
        });

        // If target was an admin path, route guard must immediately bounce to /
        if (targetPath.startsWith('/admin')) {
          expect(window.location.pathname).toBe('/');
        }
      }

      // Login modal must be open and rendered without errors
      expect(screen.getByText('Akses Kasir & Manajemen')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Masukkan kata sandi...')).toBeInTheDocument();

      unmount();
    });

    it('synchronizes active tab accurately during rapid tab switching when authenticated', () => {
      // Simulate authenticated session
      localStorage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify({
          email: VALID_EMAIL,
          expires: Date.now() + 1000000,
        })
      );

      const { unmount } = render(<App />);

      const adminRoutes = [
        { path: '/admin/pos', expectedText: /Touch POS Kasir|Daftar Menu Kasir/i },
        { path: '/admin/crm', expectedText: /Customer Directory & Retensi CRM/i },
        { path: '/admin/reports', expectedText: /Laporan Penjualan & Analitik Toko/i },
        { path: '/admin/orders', expectedText: /Antrean Pesanan Masuk/i },
      ];

      // Rapidly toggle between routes 20 times
      for (let i = 0; i < 20; i++) {
        const route = adminRoutes[i % adminRoutes.length];
        act(() => {
          window.history.pushState({}, '', route.path);
          window.dispatchEvent(new PopStateEvent('popstate'));
        });

        expect(window.location.pathname).toBe(route.path);
        expect(screen.getByText(route.expectedText)).toBeInTheDocument();
      }

      unmount();
    });

    it('clears admin view, resets URL to /, and locks admin routes on mid-session logout', () => {
      localStorage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify({
          email: VALID_EMAIL,
          expires: Date.now() + 1000000,
        })
      );
      window.history.replaceState({}, '', '/admin/pos');

      const { unmount } = render(<App />);
      expect(window.location.pathname).toBe('/admin/pos');

      // Click Keluar / Logout button
      const logoutBtn = screen.getByRole('button', { name: /Keluar Kasir/i });
      expect(logoutBtn).toBeInTheDocument();

      act(() => {
        logoutBtn.click();
      });

      // Storage keys must be cleared
      expect(localStorage.getItem(ADMIN_STORAGE_KEY)).toBeNull();

      // Location must be reset to root
      expect(window.location.pathname).toBe('/');

      // Public CustomerPortal elements must be rendered
      expect(screen.getByText('Klaim 1 Porsi Mie Baso Gratis!')).toBeInTheDocument();

      // Now attempting to re-navigate to /admin/pos must immediately bounce to /
      act(() => {
        window.history.pushState({}, '', '/admin/pos');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

      expect(window.location.pathname).toBe('/');
      expect(screen.getByText('Akses Kasir & Manajemen')).toBeInTheDocument();

      unmount();
    });
  });
});
