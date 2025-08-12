export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: User;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  parceiroId?: number;
}

export type UserRole = 'admin' | 'parceiro' | 'usuario';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
