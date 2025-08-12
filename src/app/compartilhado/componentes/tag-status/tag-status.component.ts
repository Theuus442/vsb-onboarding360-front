import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type StatusType = 'parceiro' | 'usuario' | 'documento' | 'integracao';
type StatusValue = string;

interface StatusConfig {
  label: string;
  icon: string;
  className: string;
  severity: 'success' | 'warning' | 'danger' | 'info' | 'secondary';
}

@Component({
  selector: 'app-tag-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-tag" [ngClass]="config().className">
      <i class="status-icon" [ngClass]="config().icon"></i>
      <span class="status-label">{{ config().label }}</span>
    </div>
  `,
  styles: [`
    .status-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: 1rem;
      font: 600 0.75rem 'Inter', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      border: 1px solid transparent;
    }

    .status-tag::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s ease;
    }

    .status-tag:hover::before {
      left: 100%;
    }

    .status-icon {
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    .status-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Success Status */
    .status-success {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%);
      color: #22c55e;
      border-color: rgba(34, 197, 94, 0.2);
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
    }

    .status-success:hover {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(34, 197, 94, 0.2);
    }

    /* Warning Status */
    .status-warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
      color: #f59e0b;
      border-color: rgba(245, 158, 11, 0.2);
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
    }

    .status-warning:hover {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
    }

    /* Danger Status */
    .status-danger {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
    }

    .status-danger:hover {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
    }

    /* Info Status */
    .status-info {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
      color: #3b82f6;
      border-color: rgba(59, 130, 246, 0.2);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
    }

    .status-info:hover {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
    }

    /* Secondary Status */
    .status-secondary {
      background: linear-gradient(135deg, rgba(156, 163, 175, 0.15) 0%, rgba(156, 163, 175, 0.05) 100%);
      color: #9ca3af;
      border-color: rgba(156, 163, 175, 0.2);
      box-shadow: 0 2px 8px rgba(156, 163, 175, 0.1);
    }

    .status-secondary:hover {
      background: linear-gradient(135deg, rgba(156, 163, 175, 0.2) 0%, rgba(156, 163, 175, 0.1) 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(156, 163, 175, 0.2);
    }

    /* Pulsing animation for pending/processing states */
    .status-warning {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.8;
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .status-tag {
        padding: 0.25rem 0.5rem;
        font-size: 0.625rem;
        gap: 0.25rem;
      }

      .status-icon {
        font-size: 0.625rem;
      }
    }

    /* Reduce motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
      .status-tag,
      .status-tag::before {
        transition: none;
      }
      
      .status-warning {
        animation: none;
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .status-tag {
        border-width: 2px;
      }
      
      .status-success {
        border-color: #22c55e;
        background: rgba(34, 197, 94, 0.3);
      }
      
      .status-warning {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.3);
      }
      
      .status-danger {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.3);
      }
      
      .status-info {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.3);
      }
      
      .status-secondary {
        border-color: #9ca3af;
        background: rgba(156, 163, 175, 0.3);
      }
    }
  `]
})
export class TagStatusComponent {
  readonly status = input.required<StatusValue>();
  readonly tipo = input<StatusType>('parceiro');

  readonly config = computed<StatusConfig>(() => {
    const status = this.status().toLowerCase();
    const tipo = this.tipo();

    // Status mappings by type
    const statusMappings: Record<StatusType, Record<string, StatusConfig>> = {
      parceiro: {
        'ativa': { label: 'Ativo', icon: 'pi pi-check-circle', className: 'status-success', severity: 'success' },
        'ativo': { label: 'Ativo', icon: 'pi pi-check-circle', className: 'status-success', severity: 'success' },
        'pendente': { label: 'Pendente', icon: 'pi pi-clock', className: 'status-warning', severity: 'warning' },
        'inativa': { label: 'Inativo', icon: 'pi pi-times-circle', className: 'status-danger', severity: 'danger' },
        'inativo': { label: 'Inativo', icon: 'pi pi-times-circle', className: 'status-danger', severity: 'danger' },
        'bloqueado': { label: 'Bloqueado', icon: 'pi pi-ban', className: 'status-danger', severity: 'danger' },
        'suspenso': { label: 'Suspenso', icon: 'pi pi-pause', className: 'status-warning', severity: 'warning' }
      },
      usuario: {
        'ativo': { label: 'Ativo', icon: 'pi pi-check', className: 'status-success', severity: 'success' },
        'inativo': { label: 'Inativo', icon: 'pi pi-times', className: 'status-danger', severity: 'danger' },
        'pendente': { label: 'Pendente', icon: 'pi pi-clock', className: 'status-warning', severity: 'warning' },
        'bloqueado': { label: 'Bloqueado', icon: 'pi pi-lock', className: 'status-danger', severity: 'danger' },
        'convidado': { label: 'Convidado', icon: 'pi pi-send', className: 'status-info', severity: 'info' }
      },
      documento: {
        'aprovado': { label: 'Aprovado', icon: 'pi pi-check', className: 'status-success', severity: 'success' },
        'rejeitado': { label: 'Rejeitado', icon: 'pi pi-times', className: 'status-danger', severity: 'danger' },
        'pendente': { label: 'Pendente', icon: 'pi pi-clock', className: 'status-warning', severity: 'warning' },
        'em_analise': { label: 'Em Análise', icon: 'pi pi-eye', className: 'status-info', severity: 'info' },
        'vencido': { label: 'Vencido', icon: 'pi pi-exclamation-triangle', className: 'status-danger', severity: 'danger' }
      },
      integracao: {
        'conectado': { label: 'Conectado', icon: 'pi pi-link', className: 'status-success', severity: 'success' },
        'desconectado': { label: 'Desconectado', icon: 'pi pi-unlink', className: 'status-danger', severity: 'danger' },
        'sincronizando': { label: 'Sincronizando', icon: 'pi pi-refresh', className: 'status-warning', severity: 'warning' },
        'erro': { label: 'Erro', icon: 'pi pi-exclamation-circle', className: 'status-danger', severity: 'danger' },
        'configurando': { label: 'Configurando', icon: 'pi pi-cog', className: 'status-info', severity: 'info' }
      }
    };

    const typeMapping = statusMappings[tipo] || statusMappings.parceiro;
    const statusConfig = typeMapping[status];

    if (statusConfig) {
      return statusConfig;
    }

    // Fallback for unknown status
    return {
      label: this.status(),
      icon: 'pi pi-question-circle',
      className: 'status-secondary',
      severity: 'secondary' as const
    };
  });
}
