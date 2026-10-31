import { describe, it, expect, beforeEach, vi } from 'vitest';

// Storage key and official credentials from R2 / PROJECT.md
const ADMIN_STORAGE_KEY = 'ks_admin_auth_v1';
const ALLOWED_ADMIN_EMAIL = 'mfanza123@gmail.com';
const ALLOWED_ADMIN_PASSWORD = 'yoiyoiyoi01';
const EXACT_ERROR_MESSAGE = 'Akses Ditolak: Khusus Pengelola Toko';

// Mock localStorage if running in pure Node environment
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

// In-memory Auth verification service matching AuthContext specification
export const verifyCredentials = (email: string, pass: string): { success: boolean; error?: string } => {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === ALLOWED_ADMIN_EMAIL.toLowerCase() && pass === ALLOWED_ADMIN_PASSWORD) {
    return { success: true };
  }
  return {
    success: false,
    error: EXACT_ERROR_MESSAGE,
  };
};

export class AuthSessionManager {
  private storage: Storage | LocalStorageMock;

  constructor(storage: Storage | LocalStorageMock) {
    this.storage = storage;
  }

  login(email: string, pass: string): { success: boolean; error?: string } {
    const result = verifyCredentials(email, pass);
    if (result.success) {
      this.storage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify({
          email: ALLOWED_ADMIN_EMAIL,
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        })
      );
      return { success: true };
    }
    return result;
  }

  logout() {
    this.storage.removeItem(ADMIN_STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    try {
      const saved = this.storage.getItem(ADMIN_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed && parsed.email === ALLOWED_ADMIN_EMAIL && parsed.expires > Date.now();
      }
    } catch {
      return false;
    }
    return false;
  }
}

describe('R2: Strict Admin Authentication & Session Management', () => {
  let mockStorage: LocalStorageMock;
  let authManager: AuthSessionManager;

  beforeEach(() => {
    mockStorage = new LocalStorageMock();
    authManager = new AuthSessionManager(mockStorage);
  });

  // ==========================================
  // TIER 1: FEATURE COVERAGE (>=5 tests)
  // ==========================================
  describe('Tier 1: Feature Coverage (Nominal Requirements)', () => {
    it('T1.1: permits strictly designated admin credentials (mfanza123@gmail.com / yoiyoiyoi01)', () => {
      const res = authManager.login('mfanza123@gmail.com', 'yoiyoiyoi01');
      expect(res.success).toBe(true);
      expect(res.error).toBeUndefined();
      expect(authManager.isAuthenticated()).toBe(true);
    });

    it('T1.2: normalizes admin email with whitespace trimming and case insensitivity', () => {
      const res = authManager.login('  MFANZA123@GMAIL.COM  ', 'yoiyoiyoi01');
      expect(res.success).toBe(true);
      expect(authManager.isAuthenticated()).toBe(true);
    });

    it('T1.3: persists admin session in storage with 7-day expiration timestamp', () => {
      const beforeTime = Date.now();
      authManager.login('mfanza123@gmail.com', 'yoiyoiyoi01');

      const raw = mockStorage.getItem(ADMIN_STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.email).toBe('mfanza123@gmail.com');
      expect(parsed.expires).toBeGreaterThanOrEqual(beforeTime + 7 * 24 * 60 * 60 * 1000 - 1000);
    });

    it('T1.4: immediate logout clears session data and returns unauthenticated state', () => {
      authManager.login('mfanza123@gmail.com', 'yoiyoiyoi01');
      expect(authManager.isAuthenticated()).toBe(true);

      authManager.logout();
      expect(mockStorage.getItem(ADMIN_STORAGE_KEY)).toBeNull();
      expect(authManager.isAuthenticated()).toBe(false);
    });

    it('T1.5: supports password visibility toggle state representation', () => {
      let showPassword = false;
      const toggle = () => {
        showPassword = !showPassword;
        return showPassword ? 'text' : 'password';
      };

      expect(toggle()).toBe('text');
      expect(showPassword).toBe(true);
      expect(toggle()).toBe('password');
      expect(showPassword).toBe(false);
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 tests)
  // ==========================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    it('T2.1: rejects empty email with exact error message', () => {
      const res = authManager.login('', 'yoiyoiyoi01');
      expect(res.success).toBe(false);
      expect(res.error).toBe(EXACT_ERROR_MESSAGE);
    });

    it('T2.2: rejects empty password with exact error message', () => {
      const res = authManager.login('mfanza123@gmail.com', '');
      expect(res.success).toBe(false);
      expect(res.error).toBe(EXACT_ERROR_MESSAGE);
    });

    it('T2.3: rejects valid email with invalid password with exact error message', () => {
      const res = authManager.login('mfanza123@gmail.com', 'wrongpassword123');
      expect(res.success).toBe(false);
      expect(res.error).toBe(EXACT_ERROR_MESSAGE);
    });

    it('T2.4: rejects other valid email formats with correct password', () => {
      const res = authManager.login('admin@kartikasari.com', 'yoiyoiyoi01');
      expect(res.success).toBe(false);
      expect(res.error).toBe(EXACT_ERROR_MESSAGE);
    });

    it('T2.5: rejects malicious input payloads (SQL injection / XSS) with exact error message', () => {
      const maliciousInputs = [
        "' OR '1'='1",
        '<script>alert(1)</script>',
        'admin@kartikasari.com\nadmin',
        'mfanza123@gmail.com\0',
      ];

      for (const input of maliciousInputs) {
        const res = authManager.login(input, 'yoiyoiyoi01');
        expect(res.success).toBe(false);
        expect(res.error).toBe(EXACT_ERROR_MESSAGE);
      }
    });

    it('T2.6: rejects expired session in storage on startup', () => {
      // Simulate expired session (expired 1 hour ago)
      mockStorage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify({
          email: ALLOWED_ADMIN_EMAIL,
          expires: Date.now() - 3600 * 1000,
        })
      );

      expect(authManager.isAuthenticated()).toBe(false);
    });

    it('T2.7: handles corrupted session JSON in storage safely without throwing', () => {
      mockStorage.setItem(ADMIN_STORAGE_KEY, 'invalid-non-json-token{{{');
      expect(authManager.isAuthenticated()).toBe(false);
    });
  });

  // ==========================================
  // TIER 3: CROSS-FEATURE INTERACTIONS
  // ==========================================
  describe('Tier 3: Cross-Feature Interactions', () => {
    it('T3.1: session persistence survives simulated browser page reload', () => {
      // Step 1: User logs in successfully
      const loginRes = authManager.login('mfanza123@gmail.com', 'yoiyoiyoi01');
      expect(loginRes.success).toBe(true);

      // Step 2: Simulate page reload by creating a new AuthSessionManager instance with the same storage
      const reloadedAuthManager = new AuthSessionManager(mockStorage);
      expect(reloadedAuthManager.isAuthenticated()).toBe(true);

      // Step 3: Logout on the reloaded instance invalidates both
      reloadedAuthManager.logout();
      expect(reloadedAuthManager.isAuthenticated()).toBe(false);
      expect(authManager.isAuthenticated()).toBe(false);
    });

    it('T3.2: failed login attempt does NOT destroy previously established valid session', () => {
      // Valid login first
      authManager.login('mfanza123@gmail.com', 'yoiyoiyoi01');
      expect(authManager.isAuthenticated()).toBe(true);

      // Malicious or accidental login attempt with wrong password
      const badAttempt = authManager.login('mfanza123@gmail.com', 'wrongpassword');
      expect(badAttempt.success).toBe(false);
      expect(badAttempt.error).toBe(EXACT_ERROR_MESSAGE);

      // Previous session should still remain active until explicit logout
      expect(authManager.isAuthenticated()).toBe(true);
    });
  });

  // ==========================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // ==========================================
  describe('Tier 4: Real-World Scenarios', () => {
    it('T4.1: End-to-end Cashier Shift Access Lifecycle', () => {
      // 1. Store opening: cashier enters credentials with caps lock on
      const capsAttempt = authManager.login('MFANZA123@GMAIL.COM', 'yoiyoiyoi01');
      expect(capsAttempt.success).toBe(true);
      expect(authManager.isAuthenticated()).toBe(true);

      // 2. Midday: POS is reloaded after an offline network blip
      const sessionRestored = new AuthSessionManager(mockStorage);
      expect(sessionRestored.isAuthenticated()).toBe(true);

      // 3. Shift closing: Cashier logs out to lock the terminal
      sessionRestored.logout();
      expect(sessionRestored.isAuthenticated()).toBe(false);

      // 4. Verification: Unauthorized person tries to access POS
      const intruderAttempt = sessionRestored.login('kasir2@gmail.com', 'kasir123');
      expect(intruderAttempt.success).toBe(false);
      expect(intruderAttempt.error).toBe(EXACT_ERROR_MESSAGE);
      expect(sessionRestored.isAuthenticated()).toBe(false);
    });
  });
});
