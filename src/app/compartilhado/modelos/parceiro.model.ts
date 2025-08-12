export interface Parceiro {
  id: number;
  nome: string;
  nome_fantasia?: string;
  razao_social?: string;
  cnpj: string;
  email: string;
  telefone: string;
  status: ParceiroStatus;
  totalUsuarios: number;
  total_usuarios?: number; // Alias for compatibility
  criadaEm: string;
  created_at?: string;
  responsavel_id?: number;
}

export type ParceiroStatus = 'Ativa' | 'Inativa' | 'Pendente' | 'ativo' | 'inativo' | 'suspenso';

export interface ParceiroCreateRequest {
  nome: string;
  nome_fantasia?: string;
  razao_social?: string;
  cnpj: string;
  email: string;
  telefone: string;
  status?: ParceiroStatus;
  responsavel_id?: string | number;
}

export interface ParceiroUpdateRequest extends Partial<ParceiroCreateRequest> {
  id?: number;
  nome_fantasia?: string;
  razao_social?: string;
}
