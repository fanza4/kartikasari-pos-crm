import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  adminEmail: string | null;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_STORAGE_KEY = 'ks_admin_session';
export const LEGACY_STORAGE_KEY = 'ks_admin_auth_v1';
const ALLOWED_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'mfanza123@gmail.com';
const ALLOWED_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'yoiyoiyoi01';

// Hashed verification representation or exact credential gatekeeper
// Password: yoiyoiyoi01
const VERIFY_CREDENTIALS = (email: string, pass: string): boolean => {
  const cleanEmail = email.trim().toLowerCase();
  return cleanEmail === ALLOWED_ADMIN_EMAIL.toLowerCase() && pass === ALLOWED_ADMIN_PASSWORD;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed && parsed.email === ALLOWED_ADMIN_EMAIL && parsed.expires > Date.now();
      }
    } catch {
      // Ignore
    }
    return false;
  });

  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return isAdmin ? ALLOWED_ADMIN_EMAIL : null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isAdmin) {
      setAdminEmail(ALLOWED_ADMIN_EMAIL);
    }
  }, [isAdmin]);

  const login = (email: string, pass: string): { success: boolean; error?: string } => {
    if (VERIFY_CREDENTIALS(email, pass)) {
      setIsAdmin(true);
      setAdminEmail(ALLOWED_ADMIN_EMAIL);
      // Persist session for 7 days in both primary and legacy keys
      const sessionPayload = JSON.stringify({
        email: ALLOWED_ADMIN_EMAIL,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });
      localStorage.setItem(ADMIN_STORAGE_KEY, sessionPayload);
      localStorage.setItem(LEGACY_STORAGE_KEY, sessionPayload);
      setIsLoginModalOpen(false);
      return { success: true };
    }

    return {
      success: false,
      error: 'Akses Ditolak: Khusus Pengelola Toko',
    };
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminEmail(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        adminEmail,
        login,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
