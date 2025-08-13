import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export type NotificationType = 'success' | 'info' | 'warn' | 'error';

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  duration?: number;
  sticky?: boolean;
  closable?: boolean;
  showIcon?: boolean;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export interface ActionNotificationOptions extends NotificationOptions {
  actions?: {
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly defaultDurations: Record<NotificationType, number> = {
    success: 4000,
    info: 5000,
    warn: 6000,
    error: 8000
  };

  private readonly defaultTitles: Record<NotificationType, string> = {
    success: 'Sucesso',
    info: 'Informação',
    warn: 'Atenção',
    error: 'Erro'
  };

  constructor(private messageService: MessageService) {}

  /**
   * Exibe uma notificação de sucesso
   */
  success(message: string, title?: string, options?: Partial<NotificationOptions>): void {
    this.show({
      type: 'success',
      title: title || this.defaultTitles.success,
      message,
      ...options
    });
  }

  /**
   * Exibe uma notificação de informação
   */
  info(message: string, title?: string, options?: Partial<NotificationOptions>): void {
    this.show({
      type: 'info',
      title: title || this.defaultTitles.info,
      message,
      ...options
    });
  }

  /**
   * Exibe uma notificação de aviso
   */
  warn(message: string, title?: string, options?: Partial<NotificationOptions>): void {
    this.show({
      type: 'warn',
      title: title || this.defaultTitles.warn,
      message,
      ...options
    });
  }

  /**
   * Exibe uma notificação de erro
   */
  error(message: string, title?: string, options?: Partial<NotificationOptions>): void {
    this.show({
      type: 'error',
      title: title || this.defaultTitles.error,
      message,
      ...options
    });
  }

  /**
   * Exibe uma notificação personalizada
   */
  show(options: NotificationOptions): void {
    const config = this.buildNotificationConfig(options);
    this.messageService.add(config);
  }

  /**
   * Exibe uma notificação com ações personalizadas
   */
  showWithActions(options: ActionNotificationOptions): void {
    // Para notificações com ações, sempre fazer sticky
    const config = this.buildNotificationConfig({
      ...options,
      sticky: true,
      closable: true
    });

    // Adicionar dados das ações para uso em templates customizados
    if (options.actions) {
      (config as any).actions = options.actions;
    }

    this.messageService.add(config);
  }

  /**
   * Limpa todas as notificações
   */
  clear(): void {
    this.messageService.clear();
  }

  /**
   * Limpa notificações por tipo
   */
  clearByType(type: NotificationType): void {
    this.messageService.clear(type);
  }

  /**
   * Notificações de operações comuns
   */
  operationSuccess(operation: string, entity?: string): void {
    const message = entity 
      ? `${entity} ${this.getOperationMessage(operation)} com sucesso`
      : `${this.getOperationMessage(operation, true)} com sucesso`;
    
    this.success(message);
  }

  operationError(operation: string, entity?: string, error?: any): void {
    const baseMessage = entity 
      ? `Erro ao ${this.getOperationMessage(operation).toLowerCase()} ${entity}`
      : `Erro na ${this.getOperationMessage(operation).toLowerCase()}`;
    
    let message = baseMessage;
    if (error?.message) {
      message += `: ${error.message}`;
    }
    
    this.error(message);
  }

  /**
   * Notificações de validação
   */
  validationError(message: string = 'Verifique os campos obrigatórios'): void {
    this.warn(message, 'Formulário inválido');
  }

  /**
   * Notificações de loading com cancelamento
   */
  loadingWithCancel(message: string, cancelAction: () => void): void {
    this.showWithActions({
      type: 'info',
      title: 'Carregando',
      message,
      actions: [
        {
          label: 'Cancelar',
          action: cancelAction,
          style: 'secondary'
        }
      ]
    });
  }

  /**
   * Notificações de confirmação
   */
  confirmation(
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    confirmLabel: string = 'Confirmar',
    cancelLabel: string = 'Cancelar'
  ): void {
    const actions = [
      {
        label: confirmLabel,
        action: () => {
          this.clear();
          onConfirm();
        },
        style: 'primary' as const
      },
      {
        label: cancelLabel,
        action: () => {
          this.clear();
          onCancel?.();
        },
        style: 'secondary' as const
      }
    ];

    this.showWithActions({
      type: 'warn',
      title: 'Confirmação',
      message,
      actions
    });
  }

  /**
   * Notificação de operação offline
   */
  offlineOperation(message: string = 'Operação será executada quando a conexão for restabelecida'): void {
    this.info(message, 'Modo Offline', { duration: 6000 });
  }

  /**
   * Notificação de conexão restaurada
   */
  connectionRestored(): void {
    this.success('Conexão restabelecida', 'Online');
  }

  /**
   * Notificação de conexão perdida
   */
  connectionLost(): void {
    this.warn('Verifique sua conexão com a internet', 'Conexão perdida', { sticky: true });
  }

  private buildNotificationConfig(options: NotificationOptions): any {
    const type = options.type || 'info';
    
    return {
      severity: type,
      summary: options.title || this.defaultTitles[type],
      detail: options.message,
      life: options.sticky ? undefined : (options.duration || this.defaultDurations[type]),
      sticky: options.sticky || false,
      closable: options.closable !== false, // Default true
      icon: this.getIconForType(type)
    };
  }

  private getIconForType(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      success: 'pi pi-check',
      info: 'pi pi-info-circle',
      warn: 'pi pi-exclamation-triangle',
      error: 'pi pi-times-circle'
    };
    return icons[type];
  }

  private getOperationMessage(operation: string, capitalize: boolean = false): string {
    const messages: Record<string, string> = {
      create: 'criado',
      update: 'atualizado',
      delete: 'excluído',
      save: 'salvo',
      send: 'enviado',
      upload: 'carregado',
      download: 'baixado',
      approve: 'aprovado',
      reject: 'rejeitado',
      activate: 'ativado',
      deactivate: 'desativado',
      suspend: 'suspenso',
      restore: 'restaurado',
      login: 'login realizado',
      logout: 'logout realizado',
      register: 'registrado',
      verify: 'verificado',
      validate: 'validado',
      submit: 'enviado',
      publish: 'publicado',
      archive: 'arquivado',
      duplicate: 'duplicado',
      import: 'importado',
      export: 'exportado'
    };

    const message = messages[operation.toLowerCase()] || operation;
    return capitalize ? message.charAt(0).toUpperCase() + message.slice(1) : message;
  }
}
