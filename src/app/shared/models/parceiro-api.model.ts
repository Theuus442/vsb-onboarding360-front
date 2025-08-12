// Modelos exatos conforme especificações da API

/**
 * 👤 PERFIL
 * GET /api/meu-perfil
 */
export interface MeuPerfil {
  id: number;
  nome: string;
  email: string;
  papel: string;
  ultimo_acesso?: string;
  created_at: string;
}

/**
 * GET /api/parceiro/me
 */
export interface EmpresaParceiraAPI {
  id: number;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  status: string;
  created_at: string;
  updated_at: string;
  email?: string;
  telefone?: string;
  responsavel_id?: number;
}

/**
 * 📂 DOCUMENTOS
 * GET /api/documentos
 */
export interface DocumentoAPI {
  id: number;
  parceiro_id: number;
  nome: string;
  tipo: 'Jurídica' | 'Financeiro' | 'Contratual';
  arquivo: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'em_analise';
  setor_destino: string;
  created_at: string;
  updated_at: string;
}

/**
 * POST /api/documentos
 */
export interface DocumentoUploadAPI {
  arquivo: File;
  nome: string;
  tipo: 'Jurídica' | 'Financeiro' | 'Contratual';
  setor_destino: string;
}

/**
 * 👥 USUÁRIOS VINCULADOS
 * GET /api/parceiro/usuarios
 */
export interface UsuarioVinculado {
  id: number;
  nome: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
  parceiro_id: number;
  papel?: string;
  ultimo_acesso?: string;
}

/**
 * POST /api/parceiro/usuarios
 */
export interface UsuarioVinculadoCreate {
  nome: string;
  email: string;
  senha: string;
}

/**
 * Interface combinada para o dashboard
 */
export interface DashboardParceiroAPI {
  perfil: MeuPerfil;
  empresa: EmpresaParceiraAPI;
  documentos: DocumentoAPI[];
  usuarios: UsuarioVinculado[];
}

// Types para dropdowns
export const TIPOS_DOCUMENTO = ['Jurídica', 'Financeiro', 'Contratual'] as const;
export const SETORES_DESTINO = [
  'Jurídico',
  'Financeiro', 
  'Comercial',
  'Operações',
  'Administrativo',
  'Compliance'
] as const;

export type TipoDocumento = typeof TIPOS_DOCUMENTO[number];
export type SetorDestino = typeof SETORES_DESTINO[number];
