// Interfaces padronizadas para autenticação

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  papel: 'admin' | 'parceiro' | 'interno' | 'admin_parceiro';
  ativo: boolean;
  ultimo_acesso?: string;
  created_at: string;
  permissions?: string[];
}

export interface LoginCredentials {
  email: string;
  senha: string;
  lembrar?: boolean;
}

export interface AuthResponse {
  usuario: AuthUser;
  token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
}

// Aliases para compatibilidade
export type LoginRequest = LoginCredentials;
export type LoginResponse = AuthResponse;
export type User = AuthUser;
