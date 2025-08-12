import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentoPendente } from '../../../../compartilhado/modelos';

@Component({
  selector: 'app-tabela-documentos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="documents-table-container">
      <div class="section-header">
        <div class="header-icon">
          <i class="pi pi-file-check"></i>
        </div>
        <div class="header-content">
          <h3 class="section-title">Documentos Pendentes</h3>
          <p class="section-subtitle">{{ getSubtitle() }}</p>
        </div>
        @if (hasDocuments()) {
          <div class="priority-indicators">
            @if (priorityStats().alta > 0) {
              <div class="priority-badge high" title="{{ priorityStats().alta }} documentos de alta prioridade">
                <i class="pi pi-exclamation-triangle"></i>
                <span>{{ priorityStats().alta }}</span>
              </div>
            }
            @if (priorityStats().media > 0) {
              <div class="priority-badge medium" title="{{ priorityStats().media }} documentos de média prioridade">
                <i class="pi pi-clock"></i>
                <span>{{ priorityStats().media }}</span>
              </div>
            }
          </div>
        }
        <button 
          class="action-button"
          (click)="verTodos.emit()"
          [disabled]="!hasDocuments()"
          title="Ver todos os documentos">
          <i class="pi pi-external-link"></i>
          <span>Ver todos</span>
        </button>
      </div>
      
      <div class="documents-container">
        @if (hasDocuments()) {
          <div class="documents-list" [class.has-scroll]="documentos.length > 4">
            @for (documento of documentos; track documento.id; let i = $index) {
              <div 
                class="document-item"
                [class.priority-alta]="documento.prioridade === 'alta'"
                [class.priority-media]="documento.prioridade === 'media'"
                [class.priority-baixa]="documento.prioridade === 'baixa'"
                [class.urgent]="isUrgent(documento)"
                [style.animation-delay]="(i * 100) + 'ms'">
                
                <div class="document-icon">
                  <i [class]="getDocumentIcon(documento.tipo)"></i>
                </div>
                
                <div class="document-content">
                  <h4 class="document-name" [title]="documento.nome">{{ documento.nome }}</h4>
                  
                  <div class="document-meta">
                    <span class="document-type">{{ getTypeLabel(documento.tipo) }}</span>
                    <span class="meta-separator">•</span>
                    <span class="document-partner">{{ documento.parceiro }}</span>
                  </div>
                  
                  <div class="document-timeline">
                    <div class="timeline-info">
                      <i class="pi pi-clock"></i>
                      <span>{{ getTimelineText(documento) }}</span>
                    </div>
                    @if (isOverdue(documento)) {
                      <div class="overdue-badge">
                        <i class="pi pi-exclamation-circle"></i>
                        <span>Atrasado</span>
                      </div>
                    }
                  </div>
                </div>
                
                <div class="document-status">
                  <div class="priority-indicator" [attr.data-priority]="documento.prioridade">
                    <i [class]="getPriorityIcon(documento.prioridade)"></i>
                  </div>
                  
                  <div class="days-counter" [class.urgent]="documento.dias_pendente > 7">
                    <span class="days-number">{{ documento.dias_pendente }}</span>
                    <span class="days-label">{{ documento.dias_pendente === 1 ? 'dia' : 'dias' }}</span>
                  </div>
                </div>
                
                <div class="document-actions">
                  <button class="action-btn primary" title="Aprovar documento">
                    <i class="pi pi-check"></i>
                  </button>
                  <button class="action-btn secondary" title="Ver detalhes">
                    <i class="pi pi-eye"></i>
                  </button>
                  <button class="action-btn danger" title="Rejeitar documento">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              </div>
            }
          </div>
          
          @if (documentos.length > maxDisplayItems()) {
            <div class="more-items-indicator">
              <i class="pi pi-ellipsis-h"></i>
              <span>{{ documentos.length - maxDisplayItems() }} documentos não exibidos</span>
              <button class="show-all-btn" (click)="verTodos.emit()">
                Ver todos
              </button>
            </div>
          }
        } @else {
          <div class="empty-state">
            <div class="empty-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <h4 class="empty-title">Tudo em dia!</h4>
            <p class="empty-message">Não há documentos pendentes de aprovação</p>
            <div class="empty-action">
              <button class="secondary-btn" (click)="verTodos.emit()">
                <i class="pi pi-file"></i>
                <span>Ver todos os documentos</span>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* Modern Documents Table Component */
    .documents-table-container {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1.5rem;
      padding: 1.75rem;
      backdrop-filter: blur(20px);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .documents-table-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #22c55e 100%);
      opacity: 0.6;
    }

    .documents-table-container:hover {
      border-color: rgba(102, 126, 234, 0.2);
      box-shadow: 
        0 12px 48px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }

    /* Enhanced Section Header */
    .section-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.75rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      flex-wrap: wrap;
    }

    .header-icon {
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 8px 24px rgba(245, 158, 11, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      position: relative;
    }

    .header-icon::after {
      content: '';
      position: absolute;
      inset: 2px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
      border-radius: 0.75rem;
      pointer-events: none;
    }

    .header-icon i {
      font-size: 1.125rem;
      color: white;
      z-index: 1;
    }

    .header-content {
      flex: 1;
      min-width: 0;
    }

    .section-title {
      font: 700 1.25rem/1.2 'Inter', sans-serif;
      color: #ffffff;
      margin: 0 0 0.375rem 0;
      background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .section-subtitle {
      font: 500 0.8rem/1.3 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.75px;
    }

    .priority-indicators {
      display: flex;
      gap: 0.5rem;
    }

    .priority-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: 0.75rem;
      font: 600 0.7rem 'Inter', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .priority-badge.high {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .priority-badge.medium {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all 0.3s ease;
      font: 500 0.8rem 'Inter', sans-serif;
    }

    .action-button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      transform: translateY(-1px);
    }

    .action-button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Documents Container */
    .documents-container {
      position: relative;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 24rem;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .documents-list.has-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    }

    .documents-list::-webkit-scrollbar {
      width: 4px;
    }

    .documents-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .documents-list::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }

    .documents-list::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Enhanced Document Item */
    .document-item {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 1rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      animation: slideInLeft 0.6s ease-out backwards;
    }

    .document-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #6b7280;
      transition: all 0.3s ease;
    }

    .document-item.priority-alta::before {
      background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
    }

    .document-item.priority-media::before {
      background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
    }

    .document-item.priority-baixa::before {
      background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
    }

    .document-item:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateX(8px);
    }

    .document-item.urgent {
      animation: urgentPulse 2s infinite;
    }

    @keyframes urgentPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
    }

    /* Document Icon */
    .document-icon {
      width: 2.75rem;
      height: 2.75rem;
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #3b82f6;
    }

    .document-icon i {
      font-size: 1.125rem;
    }

    /* Document Content */
    .document-content {
      flex: 1;
      min-width: 0;
    }

    .document-name {
      font: 700 0.95rem/1.3 'Inter', sans-serif;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .document-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font: 400 0.8rem 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.7);
    }

    .document-type {
      background: rgba(255, 255, 255, 0.05);
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-weight: 500;
    }

    .meta-separator {
      color: rgba(255, 255, 255, 0.4);
    }

    .document-partner {
      color: rgba(255, 255, 255, 0.6);
    }

    .document-timeline {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .timeline-info {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font: 500 0.75rem 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.6);
    }

    .timeline-info i {
      font-size: 0.75rem;
    }

    .overdue-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 0.375rem;
      font: 600 0.65rem 'Inter', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Document Status */
    .document-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .priority-indicator {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.875rem;
    }

    .priority-indicator[data-priority="alta"] {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
    }

    .priority-indicator[data-priority="media"] {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
    }

    .priority-indicator[data-priority="baixa"] {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
    }

    .days-counter {
      text-align: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      padding: 0.75rem 0.5rem;
      min-width: 3.5rem;
      transition: all 0.3s ease;
    }

    .days-counter.urgent {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .days-number {
      display: block;
      font: 700 1.125rem/1 'Inter', sans-serif;
      color: inherit;
      margin-bottom: 0.25rem;
    }

    .days-label {
      font: 500 0.65rem/1 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Document Actions */
    .document-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .action-btn {
      width: 2.25rem;
      height: 2.25rem;
      border: 1px solid transparent;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.875rem;
    }

    .action-btn.primary {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
      border-color: rgba(34, 197, 94, 0.2);
    }

    .action-btn.primary:hover {
      background: rgba(34, 197, 94, 0.25);
      transform: scale(1.1);
    }

    .action-btn.secondary {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
      border-color: rgba(59, 130, 246, 0.2);
    }

    .action-btn.secondary:hover {
      background: rgba(59, 130, 246, 0.25);
      transform: scale(1.1);
    }

    .action-btn.danger {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
    }

    .action-btn.danger:hover {
      background: rgba(239, 68, 68, 0.25);
      transform: scale(1.1);
    }

    /* More Items Indicator */
    .more-items-indicator {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      font: 500 0.8rem 'Inter', sans-serif;
    }

    .show-all-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font: 500 0.75rem 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-left: auto;
    }

    .show-all-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    /* Enhanced Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      background: rgba(255, 255, 255, 0.01);
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
    }

    .empty-icon {
      width: 4rem;
      height: 4rem;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: #22c55e;
    }

    .empty-icon i {
      font-size: 1.5rem;
    }

    .empty-title {
      font: 700 1.25rem/1.3 'Inter', sans-serif;
      color: #22c55e;
      margin: 0 0 0.75rem 0;
    }

    .empty-message {
      font: 400 0.9rem/1.5 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      margin: 0 0 1.5rem 0;
    }

    .secondary-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all 0.3s ease;
      font: 500 0.85rem 'Inter', sans-serif;
    }

    .secondary-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      transform: translateY(-1px);
    }

    /* Animations */
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .documents-table-container {
        padding: 1.25rem;
      }
      
      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      
      .header-content {
        text-align: center;
      }
      
      .priority-indicators {
        justify-content: center;
      }
      
      .document-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
        text-align: center;
      }
      
      .document-status {
        flex-direction: row;
        justify-content: center;
      }
      
      .document-actions {
        flex-direction: row;
        justify-content: center;
      }
    }

    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
      .document-item,
      .action-btn,
      .action-button {
        transition: none;
        animation: none;
      }
      
      .document-item.urgent {
        animation: none;
      }
    }

    .action-btn:focus,
    .action-button:focus,
    .secondary-btn:focus {
      outline: 2px solid #667eea;
      outline-offset: 2px;
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .documents-table-container {
        border-color: rgba(255, 255, 255, 0.3);
      }
      
      .document-item {
        border-color: rgba(255, 255, 255, 0.2);
      }
    }
  `]
})
export class TabelaDocumentosComponent {
  @Input() documentos: DocumentoPendente[] = [];
  @Output() verTodos = new EventEmitter<void>();

  protected readonly maxDisplayItems = signal(6);

  protected readonly hasDocuments = computed(() => 
    this.documentos.length > 0
  );

  protected readonly priorityStats = computed(() => {
    const stats = { alta: 0, media: 0, baixa: 0 };
    this.documentos.forEach(doc => {
      if (doc.prioridade in stats) {
        stats[doc.prioridade as keyof typeof stats]++;
      }
    });
    return stats;
  });

  getSubtitle(): string {
    const count = this.documentos.length;
    if (count === 0) return 'Nenhum documento pendente';
    if (count === 1) return '1 documento aguardando';
    return `${count} documentos aguardando`;
  }

  getDocumentIcon(tipo: string): string {
    const iconMap: Record<string, string> = {
      'contrato': 'pi pi-file-pdf',
      'cnpj': 'pi pi-building',
      'certidao': 'pi pi-file-check',
      'comprovante': 'pi pi-receipt',
      'identidade': 'pi pi-id-card',
      'procuracao': 'pi pi-file-edit',
      'financeiro': 'pi pi-dollar',
      'tecnico': 'pi pi-cog',
      'juridico': 'pi pi-balance-scale',
      'default': 'pi pi-file'
    };
    return iconMap[tipo.toLowerCase()] || iconMap['default'];
  }

  getTypeLabel(tipo: string): string {
    const labelMap: Record<string, string> = {
      'contrato': 'Contrato',
      'cnpj': 'CNPJ',
      'certidao': 'Certidão',
      'comprovante': 'Comprovante',
      'identidade': 'Identidade',
      'procuracao': 'Procuração',
      'financeiro': 'Financeiro',
      'tecnico': 'Técnico',
      'juridico': 'Jurídico'
    };
    return labelMap[tipo.toLowerCase()] || tipo;
  }

  getPriorityIcon(prioridade: string): string {
    switch (prioridade) {
      case 'alta':
        return 'pi pi-exclamation-triangle';
      case 'media':
        return 'pi pi-clock';
      case 'baixa':
        return 'pi pi-check-circle';
      default:
        return 'pi pi-circle';
    }
  }

  getTimelineText(documento: DocumentoPendente): string {
    const days = documento.dias_pendente;
    if (days === 0) return 'Recebido hoje';
    if (days === 1) return 'Há 1 dia';
    if (days <= 7) return `Há ${days} dias`;
    if (days <= 30) return `Há ${Math.ceil(days / 7)} semanas`;
    return `Há ${Math.ceil(days / 30)} meses`;
  }

  isUrgent(documento: DocumentoPendente): boolean {
    return documento.prioridade === 'alta' && documento.dias_pendente > 3;
  }

  isOverdue(documento: DocumentoPendente): boolean {
    return documento.dias_pendente > 7;
  }
}
