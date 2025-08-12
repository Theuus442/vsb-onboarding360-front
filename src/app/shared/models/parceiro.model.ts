export interface Parceiro {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  status: ParceiroStatus;
  totalUsuarios: number;
  criadaEm: string;
}

export type ParceiroStatus = 'Ativa' | 'Inativa' | 'Pendente';

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
  status?: ParceiroStatus;
}
