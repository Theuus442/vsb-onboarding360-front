// Tipos para perfis de usuário
export type PerfilUsuario = 'admin' | 'parceiro' | 'interno' | 'admin_parceiro';

// Interface para usuário
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: PerfilUsuario;
  departamento?: string;
  ativo: boolean;
  status: 'ativo' | 'inativo' | 'suspenso';
  created_at: string;
  updated_at?: string;
  ultimo_acesso?: string;
}

// Interface para criar usuário
export interface UsuarioCreateRequest {
  nome: string;
  email: string;
  senha: string;
  papel: PerfilUsuario;
  departamento?: string;
  parceiro_id?: number;
}

// Interface para atualizar usuário
export interface UsuarioUpdateRequest {
  nome?: string;
  email?: string;
  papel?: PerfilUsuario;
  departamento?: string;
  status?: string;
  ativo?: boolean;
}

// Interface para opções de departamento
export interface DepartamentoOption {
  label: string;
  value: string;
}

// Interface para filtros de usuário
export interface UsuarioFilter {
  busca?: string;
  papel?: PerfilUsuario;
  departamento?: string;
  ativo?: boolean;
}

// Interface para estatísticas de usuários
export interface EstatisticasUsuarios {
  total: number;
  ativos: number;
  inativos: number;
  por_perfil: {
    [key in PerfilUsuario]: number;
  };
}

// Interface para mudança de senha
export interface AlterarSenhaRequest {
  senha_atual: string;
  nova_senha: string;
  confirmar_senha: string;
}

// Interface para reset de senha
export interface ResetSenhaRequest {
  email: string;
}

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
