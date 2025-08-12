import { TipoDocumento } from '../../../../compartilhado/modelos';

// Constantes para filtros
export const TIPOS_ENVIO = [
  { label: 'Parceiro Específico', value: 'individual' },
  { label: 'Múltiplos Parceiros', value: 'multiplos' },
  { label: 'Por Filtro Automático', value: 'filtro' }
] as const;

export const STATUS_OPCOES = [
  { label: 'Pendente', value: 'pendente' },
  { label: 'Em Análise', value: 'em_analise' },
  { label: 'Aprovado', value: 'aprovado' },
  { label: 'Rejeitado', value: 'rejeitado' },
  { label: 'Expirado', value: 'expirado' }
];

export const VENCIMENTO_OPCOES = [
  { label: 'Vencendo em 7 dias', value: 'vencendo_7' },
  { label: 'Vencendo em 30 dias', value: 'vencendo_30' },
  { label: 'Expirados', value: 'expirados' },
  { label: 'Sem vencimento', value: 'sem_vencimento' }
];

export const STATUS_PARCEIRO_OPCOES = [
  { label: 'Ativos', value: 'ativo' },
  { label: 'Inativos', value: 'inativo' },
  { label: 'Suspensos', value: 'suspenso' }
] as const;

export const PRIORIDADE_OPCOES = [
  { label: 'Baixa', value: 'baixa' },
  { label: 'Normal', value: 'media' },
  { label: 'Alta', value: 'alta' },
  { label: 'Crítica', value: 'critica' }
] as const;

// Documentos obrigatórios
export const DOCUMENTOS_OBRIGATORIOS: Array<{ tipo: TipoDocumento; nome: string }> = [
  { tipo: 'cnpj', nome: 'Cartão CNPJ' },
  { tipo: 'contrato_social', nome: 'Contrato Social' },
  { tipo: 'certificado_digital', nome: 'Certificado Digital' },
  { tipo: 'comprovante_endereco', nome: 'Comprovante de Endereço' }
] as const;

// Variáveis de template de email
export const VARIAVEIS_EMAIL = [
  '{{nome_parceiro}}',
  '{{cnpj_parceiro}}',
  '{{responsavel_principal}}',
  '{{prazo_dias}}',
  '{{data_limite}}',
  '{{tipos_documentos}}',
  '{{link_upload}}',
  '{{telefone_suporte}}'
] as const;

// Configurações de tempo
export const DIAS_VENCIMENTO = {
  CRITICO: 7,
  ATENCAO: 30
} as const;

// Labels de status
export const STATUS_LABELS = {
  online: 'Sistema Online',
  offline: 'Sistema Offline', 
  warning: 'Atenção Requerida'
} as const;

// Severidades do PrimeNG
export const SEVERITY_MAP = {
  ativo: 'success',
  inativo: 'danger',
  suspenso: 'warning',
  aprovado: 'success',
  pendente: 'warning',
  em_analise: 'warning',
  rejeitado: 'danger',
  expirado: 'danger'
} as const;
