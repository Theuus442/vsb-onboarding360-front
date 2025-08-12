// Modelos específicos para o painel do parceiro baseados nas APIs especificadas

/**
 * 👤 PERFIL
 * Interface para GET /api/meu-perfil
 * Retorna informações básicas do parceiro logado (usuário, nome, email, papel)
 */
export interface PerfilUsuarioParceiro {
  id: string;
  nome: string;
  email: string;
  papel: 'parceiro' | 'admin_parceiro';
  ultimo_acesso?: string;
  created_at: string;
  ativo: boolean;
  permissions?: string[];
}

/**
 * Interface para GET /api/parceiro/me
 * Retorna dados completos da empresa parceira (razão social, CNPJ, status, data de criação, etc.)
 */
export interface DadosEmpresaParceira {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  status: 'ativo' | 'inativo' | 'pendente' | 'suspenso' | 'aprovado' | 'rejeitado';
  created_at: string;
  updated_at: string;
  responsavel_id?: string;
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
}

/**
 * 📂 DOCUMENTOS
 * Interface para GET /api/documentos
 * Lista documentos enviados pelo parceiro, com campos como: id, nome, status, arquivo, created_at
 */
export interface DocumentoParceiro {
  id: string;
  nome: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'em_analise';
  arquivo: string;
  created_at: string;
  updated_at?: string;
  tipo?: string;
  tamanho?: number;
  observacoes?: string;
  data_upload?: string;
  arquivo_nome?: string;
  url_download?: string;
}

/**
 * Interface para POST /api/documentos
 * Body: FormData com arquivo (file) e nome (string)
 */
export interface DocumentoUploadRequest {
  arquivo: File;
  nome: string;
  tipo?: string;
}

/**
 * 👥 USUÁRIOS VINCULADOS
 * Interface para GET /api/parceiro/usuarios
 * Lista todos os usuários vinculados à empresa parceira
 */
export interface UsuarioVinculadoParceiro {
  id: string;
  nome: string;
  email: string;
  papel: 'parceiro' | 'admin_parceiro';
  status: 'ativo' | 'inativo' | 'pendente';
  created_at: string;
  ultimo_acesso?: string;
  departamento?: string;
  ativo: boolean;
}

/**
 * Interface para POST /api/parceiro/usuarios
 * Body: { nome, email, senha }
 */
export interface UsuarioVinculadoCreateRequest {
  nome: string;
  email: string;
  senha: string;
  papel?: 'parceiro' | 'admin_parceiro';
  departamento?: string;
}

/**
 * Interface combinada para o dashboard completo
 */
export interface DadosParceiroDashboard {
  perfil: PerfilUsuarioParceiro;
  empresa: DadosEmpresaParceira;
  documentos: DocumentoParceiro[];
  usuarios: UsuarioVinculadoParceiro[];
  checklist?: ChecklistItemParceiro[];
  estatisticas?: EstatisticasParceiro;
}

/**
 * Interface para itens do checklist de onboarding
 */
export interface ChecklistItemParceiro {
  id: string;
  titulo: string;
  descricao?: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'bloqueado';
  obrigatorio: boolean;
  created_at: string;
  updated_at?: string;
  ordem?: number;
}

/**
 * Interface para estatísticas do parceiro
 */
export interface EstatisticasParceiro {
  total_documentos: number;
  documentos_aprovados: number;
  documentos_pendentes: number;
  documentos_rejeitados: number;
  total_usuarios: number;
  usuarios_ativos: number;
  progresso_onboarding: number;
  ultima_atividade?: string;
}

// Types auxiliares
export type StatusDocumento = 'pendente' | 'aprovado' | 'rejeitado' | 'em_analise';
export type StatusEmpresa = 'ativo' | 'inativo' | 'pendente' | 'suspenso' | 'aprovado' | 'rejeitado';
export type StatusUsuario = 'ativo' | 'inativo' | 'pendente';
export type PapelUsuario = 'parceiro' | 'admin_parceiro';
export type StatusChecklist = 'pendente' | 'em_andamento' | 'concluido' | 'bloqueado';

// Interfaces para compatibilidade com código existente
export interface Usuario extends UsuarioVinculadoParceiro {}
export interface Documento extends DocumentoParceiro {}
export interface ChecklistItem extends ChecklistItemParceiro {}

// Re-export para facilitar importação
export type {
  PerfilUsuarioParceiro as PerfilUsuario,
  UsuarioVinculadoCreateRequest as UsuarioCreateRequest,
  DadosEmpresaParceira as Parceiro
};
