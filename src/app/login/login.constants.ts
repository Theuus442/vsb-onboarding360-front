// Login component constants
export const LOGIN_CONSTANTS = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 6,
  REMEMBER_EMAIL_KEY: 'remembered-email',
  ANIMATION_DELAY: 100,
  REDIRECT_DELAY: 1500,
  ANIMATION_CLEANUP_DELAY: 600,
  PARTICLE_COUNT: 20
} as const;

export const PARTNER_ROLES = ['parceiro', 'admin_parceiro'] as const;

export const ERROR_MESSAGES = {
  EMAIL_REQUIRED: 'E-mail é obrigatório',
  EMAIL_INVALID: 'E-mail inválido',
  PASSWORD_REQUIRED: 'Senha é obrigatória',
  PASSWORD_MIN_LENGTH: 'Senha deve ter pelo menos {min} caracteres',
  FORM_INVALID: 'Por favor, corrija os erros no formulário',
  LOGIN_SUCCESS: 'Login realizado com sucesso',
  WELCOME_MESSAGE: 'Bem-vindo, {name}!',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  CREDENTIAL_ERROR_DETAIL: 'E-mail ou senha incorretos',
  CONNECTION_ERROR: 'Erro de conexão',
  CONNECTION_ERROR_DETAIL: 'Verifique sua conexão com a internet',
  SERVER_ERROR: 'Erro interno do servidor',
  SERVER_ERROR_DETAIL: 'Tente novamente em alguns instantes',
  PASSWORD_RECOVERY: 'Recuperação de senha',
  PASSWORD_RECOVERY_DETAIL: 'Entre em contato com o administrador do sistema para recuperar sua senha'
} as const;

export interface Feature {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

export const FEATURES: readonly Feature[] = [
  {
    icon: 'pi pi-users',
    title: 'Gestão de Parceiros',
    description: 'Centralize e gerencie todos os seus parceiros em um só lugar'
  },
  {
    icon: 'pi pi-file-check',
    title: 'Documentação Digital',
    description: 'Controle completo de documentos e compliance'
  },
  {
    icon: 'pi pi-chart-line',
    title: 'Analytics Avançado',
    description: 'Insights em tempo real do processo de onboarding'
  }
] as const;
