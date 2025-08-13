// =============================================================================
// COMPARTILHADO - Index Principal
// Organiza todas as exportações dos módulos compartilhados
// =============================================================================

// -----------------------------------------------------------------------------
// COMPONENTES
// -----------------------------------------------------------------------------

// Componentes básicos
export * from './componentes/carregando/carregando.component';
export * from './componentes/campo-busca/campo-busca.component';
export * from './componentes/input-busca/input-busca.component';
export * from './componentes/offline-banner/offline-banner.component';
export * from './componentes/api-status/api-status.component';

// Componentes de formulário
export { DropdownModernoComponent, type DropdownOption } from './componentes/dropdown-moderno/dropdown-moderno.component';
export { DropdownSimplesComponent } from './componentes/dropdown-simples/dropdown-simples.component';

// Componentes de navegação e layout
export * from './componentes/paginacao/paginacao.component';

// Componentes de status e feedback
export * from './componentes/tag-status/tag-status.component';

// NOVOS COMPONENTES OTIMIZADOS
export * from './componentes/loading-spinner/loading-spinner.component';
export * from './componentes/status-badge/status-badge.component';
export * from './componentes/pagination/pagination.component';

// -----------------------------------------------------------------------------
// PIPES
// -----------------------------------------------------------------------------
export * from './pipes/date-format.pipe';

// -----------------------------------------------------------------------------
// SERVIÇOS
// -----------------------------------------------------------------------------

// Serviços de API e comunicação
export * from './servicos/api.service';
export * from './servicos/api-health.service';

// Serviços de autenticação
export * from './servicos/auth.service';
export * from './servicos/autenticacao.service';

// Serviços de domínio
export * from './servicos/painel.service';
export * from './servicos/parceiro.service';
export * from './servicos/usuario.service';
export * from './servicos/documento.service';
export * from './servicos/parceiro-dashboard.service';

// Serviços de infraestrutura
export * from './servicos/error-handling.service';
export * from './servicos/email-notification.service';

// NOVOS SERVIÇOS OTIMIZADOS
export * from './servicos/date-utils.service';
export * from './servicos/notification.service';

// -----------------------------------------------------------------------------
// MODELOS/INTERFACES
// -----------------------------------------------------------------------------
export * from './modelos/api.model';
export * from './modelos/autenticacao.model';
export * from './modelos/checklist.model';
export * from './modelos/documento.model';
export * from './modelos/painel.model';
export * from './modelos/parceiro.model';
export * from './modelos/usuario.model';

// -----------------------------------------------------------------------------
// GUARDAS DE ROTA
// -----------------------------------------------------------------------------
export * from './guardas/admin.guard';
export * from './guardas/auth.guard';
export * from './guardas/parceiro.guard';

// -----------------------------------------------------------------------------
// INTERCEPTORS
// -----------------------------------------------------------------------------
export * from './interceptors/auth.interceptor';
export * from './interceptors/error-handling.interceptor';

// -----------------------------------------------------------------------------
// COMPOSABLES/HOOKS
// -----------------------------------------------------------------------------
export * from './composables/crud-operations.composable';

// -----------------------------------------------------------------------------
// TIPOS UTILITÁRIOS
// -----------------------------------------------------------------------------

// Tipos para componentes
export type { LoadingSize, LoadingVariant } from './componentes/loading-spinner/loading-spinner.component';
export type { StatusType, StatusSize, StatusVariant } from './componentes/status-badge/status-badge.component';
export type { PaginationInfo, PageChangeEvent } from './componentes/pagination/pagination.component';

// Tipos para serviços
export type { NotificationType, NotificationOptions, ActionNotificationOptions } from './servicos/notification.service';
export type { RetryConfig } from './interceptors/error-handling.interceptor';
export type { CrudState, PaginationOptions, CrudOperations } from './composables/crud-operations.composable';

// -----------------------------------------------------------------------------
// CONSTANTES E CONFIGURAÇÕES
// -----------------------------------------------------------------------------

// Configurações padrão para componentes
export const DEFAULT_PAGINATION_CONFIG = {
  itemsPerPage: 10,
  itemsPerPageOptions: [5, 10, 25, 50, 100],
  maxVisiblePages: 7,
  showInfo: true,
  showItemsPerPage: true,
  showFirstLast: true,
  showQuickJump: true,
  quickJumpThreshold: 10
} as const;

export const DEFAULT_LOADING_CONFIG = {
  variant: 'spinner' as const,
  size: 'medium' as const,
  showOverlay: false,
  fullscreen: false,
  centered: true
} as const;

export const DEFAULT_STATUS_BADGE_CONFIG = {
  variant: 'subtle' as const,
  size: 'medium' as const,
  showIcon: true,
  showDot: false
} as const;

// Configurações de notificação
export const NOTIFICATION_DURATIONS = {
  success: 4000,
  info: 5000,
  warn: 6000,
  error: 8000
} as const;

// Mapeamentos de status comuns
export const STATUS_MAPPINGS = {
  // Status gerais
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  SUSPENSO: 'suspenso',
  
  // Status de documentos
  PENDENTE: 'pendente',
  EM_ANALISE: 'em_analise',
  APROVADO: 'aprovado',
  REJEITADO: 'rejeitado',
  EXPIRADO: 'expirado',
  
  // Status de usuários
  ONLINE: 'online',
  OFFLINE: 'offline',
  BLOQUEADO: 'bloqueado'
} as const;

// Roles/Papéis do sistema
export const USER_ROLES = {
  ADMIN: 'admin',
  PARCEIRO: 'parceiro',
  INTERNO: 'interno',
  ADMIN_PARCEIRO: 'admin_parceiro'
} as const;

// Tipos de documento
export const DOCUMENT_TYPES = {
  CNPJ: 'cnpj',
  CONTRATO_SOCIAL: 'contrato_social',
  CERTIFICADO_DIGITAL: 'certificado_digital',
  COMPROVANTE_ENDERECO: 'comprovante_endereco',
  OUTROS: 'outros'
} as const;

// -----------------------------------------------------------------------------
// UTILITÁRIOS
// -----------------------------------------------------------------------------

/**
 * Verifica se um valor é uma data válida
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Verifica se uma string é um timestamp ISO válido
 */
export function isValidTimestamp(timestamp: string): boolean {
  return !isNaN(Date.parse(timestamp));
}

/**
 * Normaliza um status para lowercase e substitui espaços por underscores
 */
export function normalizeStatus(status: string): string {
  return status.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Capitaliza a primeira letra de uma string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formata um nome de campo para exibição (remove underscores e capitaliza)
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Gera um ID único simples
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Debounce function para otimizar chamadas de API
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Verifica se o usuário tem permissão específica
 */
export function hasPermission(userPermissions: string[], permission: string): boolean {
  return userPermissions.includes(permission);
}

/**
 * Verifica se o usuário tem qualquer uma das permissões listadas
 */
export function hasAnyPermission(userPermissions: string[], permissions: string[]): boolean {
  return permissions.some(permission => userPermissions.includes(permission));
}

/**
 * Verifica se o usuário tem todas as permissões listadas
 */
export function hasAllPermissions(userPermissions: string[], permissions: string[]): boolean {
  return permissions.every(permission => userPermissions.includes(permission));
}
