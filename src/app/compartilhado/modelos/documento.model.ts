// Enums para documentos
export type StatusDocumento = 
  | 'pendente' 
  | 'em_analise' 
  | 'aprovado' 
  | 'rejeitado' 
  | 'expirado';

export type TipoDocumento = 
  | 'cnpj' 
  | 'contrato_social' 
  | 'certificado_digital' 
  | 'comprovante_endereco' 
  | 'outros';

// Interface para documento
export interface Documento {
  id: string;
  nome: string;
  tipo: TipoDocumento;
  status: StatusDocumento;
  created_at: string;
  updated_at?: string;
  parceiro_id?: number;
  parceiro?: string;
  tamanho?: number;
  url?: string;
  observacoes?: string;
  data_vencimento?: string;
  arquivo_nome?: string;
  data_upload?: string;
}

// Interface para filtros de documentos
export interface DocumentoFilter {
  busca?: string;
  status?: StatusDocumento | string;
  tipo?: TipoDocumento | string;
  parceiro_id?: number | string;
  data_inicio?: Date;
  data_fim?: Date;
}

// Interface para upload de documento
export interface DocumentoUpload {
  arquivo: File;
  tipo: TipoDocumento;
  parceiro_id?: number;
  observacoes?: string;
  data_vencimento?: string;
}

// Interface para criar documento
export interface DocumentoCreateRequest {
  nome: string;
  tipo: TipoDocumento;
  parceiro_id: number;
  observacoes?: string;
  data_vencimento?: string;
}

// Interface para atualizar documento
export interface DocumentoUpdateRequest {
  nome?: string;
  tipo?: TipoDocumento;
  status?: StatusDocumento | string;
  observacoes?: string;
  data_vencimento?: string;
}

// Interface para resposta de aprovação/rejeição
export interface DocumentoAcaoRequest {
  motivo?: string;
  observacoes?: string;
}

// Tipos adicionais para gestão administrativa
export type PrioridadeDocumento = 'baixa' | 'media' | 'alta' | 'critica';

// Interface estendida para documento com informações do parceiro
export interface DocumentoAdmin extends Omit<Documento, 'parceiro'> {
  parceiro?: {
    id: number;
    nome: string;
    cnpj: string;
    email?: string;
    telefone?: string;
    status: 'ativo' | 'inativo' | 'suspenso';
    responsavel_principal?: string;
  };
  parceiro_nome?: string; // Para compatibilidade com a interface base
  prioridade?: PrioridadeDocumento;
  dias_ate_vencimento?: number;
  responsavel_analise?: string;
  historico_aprovacao?: {
    data: string;
    usuario: string;
    acao: 'aprovado' | 'rejeitado' | 'solicitado';
    motivo?: string;
  }[];
}

// Interface para documentos agrupados por parceiro (para visão administrativa)
export interface DocumentosPorParceiro {
  parceiro: {
    id: number;
    nome: string;
    cnpj: string;
    email?: string;
    telefone?: string;
    status: 'ativo' | 'inativo' | 'suspenso';
    responsavel_principal?: string;
  };
  documentos: DocumentoAdmin[];
  estatisticas: {
    total: number;
    pendentes: number;
    aprovados: number;
    rejeitados: number;
    expirados: number;
    vencendo_em_7_dias: number;
    vencendo_em_30_dias: number;
  };
  documentos_obrigatorios: {
    tipo: TipoDocumento;
    nome: string;
    obrigatorio: boolean;
    presente: boolean;
    status?: StatusDocumento;
    data_vencimento?: string;
  }[];
}

// Interface para relatório de documentos
export interface RelatorioDocumentos {
  parceiros_com_pendencias: DocumentosPorParceiro[];
  parceiros_com_expiracoes: DocumentosPorParceiro[];
  estatisticas_gerais: {
    total_parceiros: number;
    parceiros_em_dia: number;
    parceiros_com_pendencias: number;
    parceiros_com_expiracoes: number;
    documentos_pendentes: number;
    documentos_expirando: number;
  };
}

// Interface para solicitação de documentos via email
export interface SolicitacaoDocumento {
  parceiro_id: number;
  tipos_documentos: TipoDocumento[];
  assunto?: string;
  mensagem_personalizada?: string;
  prazo_dias?: number;
}

// Interface para notificação de email
export interface NotificacaoEmail {
  para: string[];
  copia?: string[];
  assunto: string;
  corpo: string;
  tipo: 'solicitacao' | 'lembrete' | 'vencimento' | 'aprovacao' | 'rejeicao';
  anexos?: {
    nome: string;
    url: string;
  }[];
}
