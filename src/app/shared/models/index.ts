// User related models
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: PerfilUsuario;
  status: 'ativo' | 'inativo';
  departamento?: string;
  created_at: string;
  updated_at: string;
}

export type PerfilUsuario = 'admin' | 'parceiro' | 'admin_parceiro' | 'interno';

export interface UsuarioCreateRequest {
  nome: string;
  email: string;
  senha: string;
  papel: PerfilUsuario;
  departamento?: string;
  parceiro_id?: number;
}

export interface DepartamentoOption {
  label: string;
  value: string;
}

// Partner related models  
export interface Parceiro {
  id: string;
  nome: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  status: ParceiroStatus;
  total_usuarios?: number;
  created_at: string;
  updated_at: string;
}

export type ParceiroStatus = 'Ativa' | 'Inativa' | 'Pendente';

// Dashboard related models
export interface Estatistica {
  id: string;
  titulo: string;
  valor: number;
  porcentagem?: number;
  tipo: 'crescimento' | 'decrescimento' | 'neutro';
  icon: string;
  cor: string;
}

export interface AtividadeRecente {
  id: string;
  tipo: string;
  descricao: string;
  usuario: string;
  timestamp: string;
  icon: string;
  cor: string;
}

export interface DocumentoPendente {
  id: string;
  nome: string;
  tipo: string;
  parceiro: string;
  status: 'pendente' | 'processando' | 'aprovado' | 'rejeitado';
  created_at: string;
}

export interface Documento {
  id: string;
  nome: string;
  tipo: TipoDocumento;
  status: StatusDocumento;
  created_at: string;
  observacoes?: string;
}

export type StatusDocumento = 'pendente' | 'aprovado' | 'rejeitado';
export type TipoDocumento = 'cnpj' | 'contrato_social' | 'certificado_digital' | 'comprovante_endereco' | 'outros';

export interface StatusIntegracao {
  status: 'online' | 'offline' | 'warning';
  ultima_sincronizacao: string;
  total_sincronizacoes: number;
  erros_recentes: number;
}

export interface AcessoRapido {
  id: string;
  titulo: string;
  descricao: string;
  icon: string;
  cor: string;
  rota?: string;
  acao?: string;
}

// Common models
export interface RespostaPaginada<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    last_page: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// Authentication models
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  papel: PerfilUsuario;
  token: string;
  expires_at: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  expires_at: string;
}

// Re-export from parceiro.model.ts
export * from './parceiro.model';

// Re-export from parceiro-dashboard.model.ts
export * from './parceiro-dashboard.model';

// Re-export from parceiro-api.model.ts
export * from './parceiro-api.model';

// Interface para usuário responsável de parceiro
export interface UsuarioResponsavel {
  id: number;
  nome: string;
  email: string;
  departamento?: string;
  responsavel_principal: boolean;
  created_at: string;
}

// Interface para definir responsável principal
export interface DefinirResponsavelRequest {
  usuario_id: number;
}
