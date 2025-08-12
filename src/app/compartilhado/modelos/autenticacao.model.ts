// Interfaces para autenticação

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

export interface LoginRequest {
  email: string;
  senha: string;
  lembrar?: boolean;
}

export interface LoginResponse {
  usuario: AuthUser;
  token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  token?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  nova_senha: string;
  confirmar_senha: string;
}

export interface ChangePasswordRequest {
  senha_atual: string;
  nova_senha: string;
  confirmar_senha: string;
}

// Interface para dados do JWT
export interface JwtPayload {
  sub: string;
  email: string;
  papel: string;
  iat: number;
  exp: number;
  iss?: string;
}

// Interface para validação de sessão
export interface SessionValidation {
  valida: boolean;
  usuario?: AuthUser;
  message?: string;
}

// Aliases for compatibility
export type LoginCredentials = LoginRequest;
export type AuthResponse = LoginResponse;
