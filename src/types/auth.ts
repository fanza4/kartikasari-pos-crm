export interface AuthUser {
  email: string;
  role: 'store_manager';
  name: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
  token?: string;
}
