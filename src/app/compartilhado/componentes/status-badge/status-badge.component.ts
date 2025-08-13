import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusType = 
  | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  | 'pending' | 'approved' | 'rejected' | 'expired'
  | 'active' | 'inactive' | 'suspended';

export type StatusSize = 'small' | 'medium' | 'large';
export type StatusVariant = 'filled' | 'outlined' | 'subtle';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="status-badge" 
      [class]="badgeClasses()"
      [attr.aria-label]="ariaLabel || status"
      role="status">
      
      @if (showIcon()) {
        <i class="status-icon" [class]="iconClass()"></i>
      }
      
      <span class="status-text">{{ displayText() }}</span>
      
      @if (showDot()) {
        <span class="status-dot"></span>
      }
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.2s ease;
      white-space: nowrap;
      border: 1px solid transparent;
      
      /* Size variants */
      &.small {
        padding: 2px 8px;
        font-size: 11px;
        gap: 2px;
        
        .status-icon { font-size: 10px; }
        .status-dot { width: 4px; height: 4px; }
      }
      
      &.medium {
        padding: 4px 12px;
        font-size: 13px;
        gap: 4px;
        
        .status-icon { font-size: 12px; }
        .status-dot { width: 6px; height: 6px; }
      }
      
      &.large {
        padding: 6px 16px;
        font-size: 14px;
        gap: 6px;
        
        .status-icon { font-size: 14px; }
        .status-dot { width: 8px; height: 8px; }
      }
      
      /* Success styles */
      &.success {
        &.filled {
          background: #10b981;
          color: white;
        }
        &.outlined {
          background: transparent;
          color: #10b981;
          border-color: #10b981;
        }
        &.subtle {
          background: #ecfdf5;
          color: #059669;
        }
        .status-dot { background: #10b981; }
      }
      
      /* Warning styles */
      &.warning {
        &.filled {
          background: #f59e0b;
          color: white;
        }
        &.outlined {
          background: transparent;
          color: #f59e0b;
          border-color: #f59e0b;
        }
        &.subtle {
          background: #fffbeb;
          color: #d97706;
        }
        .status-dot { background: #f59e0b; }
      }
      
      /* Danger styles */
      &.danger {
        &.filled {
          background: #ef4444;
          color: white;
        }
        &.outlined {
          background: transparent;
          color: #ef4444;
          border-color: #ef4444;
        }
        &.subtle {
          background: #fef2f2;
          color: #dc2626;
        }
        .status-dot { background: #ef4444; }
      }
      
      /* Info styles */
      &.info {
        &.filled {
          background: #3b82f6;
          color: white;
        }
        &.outlined {
          background: transparent;
          color: #3b82f6;
          border-color: #3b82f6;
        }
        &.subtle {
          background: #eff6ff;
          color: #2563eb;
        }
        .status-dot { background: #3b82f6; }
      }
      
      /* Neutral styles */
      &.neutral {
        &.filled {
          background: #6b7280;
          color: white;
        }
        &.outlined {
          background: transparent;
          color: #6b7280;
          border-color: #6b7280;
        }
        &.subtle {
          background: #f9fafb;
          color: #4b5563;
        }
        .status-dot { background: #6b7280; }
      }
    }
    
    .status-icon {
      flex-shrink: 0;
    }
    
    .status-text {
      flex: 1;
    }
    
    .status-dot {
      flex-shrink: 0;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';
  @Input() type: StatusType | null = null;
  @Input() variant: StatusVariant = 'subtle';
  @Input() size: StatusSize = 'medium';
  @Input() showIconInput: boolean = true;
  @Input() showDotInput: boolean = false;
  @Input() customText: string = '';
  @Input() ariaLabel: string = '';

  // Mapeamento de status para tipos e textos
  private readonly statusMappings = new Map<string, { type: StatusType; text: string; icon: string }>([
    // Status gerais
    ['ativo', { type: 'success', text: 'Ativo', icon: 'pi pi-check-circle' }],
    ['inativo', { type: 'neutral', text: 'Inativo', icon: 'pi pi-ban' }],
    ['suspenso', { type: 'warning', text: 'Suspenso', icon: 'pi pi-pause-circle' }],
    
    // Status de documentos
    ['pendente', { type: 'warning', text: 'Pendente', icon: 'pi pi-clock' }],
    ['em_analise', { type: 'info', text: 'Em Análise', icon: 'pi pi-search' }],
    ['aprovado', { type: 'success', text: 'Aprovado', icon: 'pi pi-check' }],
    ['rejeitado', { type: 'danger', text: 'Rejeitado', icon: 'pi pi-times' }],
    ['expirado', { type: 'danger', text: 'Expirado', icon: 'pi pi-exclamation-triangle' }],
    
    // Status de parceiros
    ['aprovacao_pendente', { type: 'warning', text: 'Aguardando Aprovação', icon: 'pi pi-hourglass' }],
    ['documentos_pendentes', { type: 'warning', text: 'Documentos Pendentes', icon: 'pi pi-file-excel' }],
    ['completo', { type: 'success', text: 'Completo', icon: 'pi pi-check-circle' }],
    
    // Status de usuários
    ['online', { type: 'success', text: 'Online', icon: 'pi pi-circle' }],
    ['offline', { type: 'neutral', text: 'Offline', icon: 'pi pi-circle' }],
    ['bloqueado', { type: 'danger', text: 'Bloqueado', icon: 'pi pi-lock' }],
  ]);

  readonly badgeClasses = computed(() => {
    const classes = [
      'status-badge',
      this.size,
      this.variant,
      this.resolvedType()
    ];
    return classes.join(' ');
  });

  readonly displayText = computed(() => {
    if (this.customText) return this.customText;
    
    const mapping = this.statusMappings.get(this.status.toLowerCase());
    if (mapping) return mapping.text;
    
    // Fallback: capitaliza o status
    return this.status.charAt(0).toUpperCase() + this.status.slice(1).replace(/_/g, ' ');
  });

  readonly iconClass = computed(() => {
    const mapping = this.statusMappings.get(this.status.toLowerCase());
    return mapping?.icon || 'pi pi-info-circle';
  });

  readonly resolvedType = computed((): StatusType => {
    if (this.type) return this.type;
    
    const mapping = this.statusMappings.get(this.status.toLowerCase());
    return mapping?.type || 'neutral';
  });

  readonly showIcon = computed(() => {
    return this.showIconInput && !this.showDotInput;
  });

  readonly showDot = computed(() => {
    return this.showDotInput && !this.showIconInput;
  });
}
