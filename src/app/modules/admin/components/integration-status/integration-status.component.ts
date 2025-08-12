import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusIntegracao } from '../../../../shared/models';

@Component({
  selector: 'app-integration-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="integration-card">
      <div class="card-header">
        <div class="card-icon">
          <i class="pi pi-link" [class]="getStatusIconClass()"></i>
        </div>
        <div class="header-content">
          <h3 class="card-title">Status de Integração</h3>
          <p class="card-subtitle">Estado das conexões externas</p>
        </div>
      </div>

      <div class="integration-content">
        @if (statusData) {
          <div class="status-indicator" [class]="'status-' + statusData.status">
            <div class="status-dot"></div>
            <span class="status-label">{{ getStatusLabel(statusData.status) }}</span>
          </div>
          
          <div class="integration-details">
            <div class="detail-item">
              <span class="detail-label">Última sincronização:</span>
              <span class="detail-value">{{ statusData.ultima_sincronizacao | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Total de sincronizações:</span>
              <span class="detail-value">{{ statusData.total_sincronizacoes }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Erros recentes:</span>
              <span class="detail-value error-count">{{ statusData.erros_recentes }}</span>
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Status não disponível</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .integration-card {
      background: white;
      border: 1px solid #f3f4f6;
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .integration-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem 1.5rem 0;
      margin-bottom: 1.5rem;
    }

    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
      color: #8b5cf6;
      font-size: 18px;
    }

    .header-content {
      flex: 1;
    }

    .card-title {
      font: 600 18px 'Inter', sans-serif;
      margin: 0;
      color: #1a1a1a;
    }

    .card-subtitle {
      font: 400 14px 'Inter', sans-serif;
      margin: 0;
      color: #6b7280;
    }

    .integration-content {
      padding: 0 1.5rem 1.5rem;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 0.75rem;
      margin-bottom: 1rem;
    }

    .status-online {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .status-offline {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .status-warning {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .status-online .status-dot {
      background: #22c55e;
      box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
    }

    .status-offline .status-dot {
      background: #ef4444;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }

    .status-warning .status-dot {
      background: #f59e0b;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
    }

    .status-label {
      font: 600 14px 'Inter', sans-serif;
      color: #1a1a1a;
    }

    .integration-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-label {
      font: 500 13px 'Inter', sans-serif;
      color: #6b7280;
    }

    .detail-value {
      font: 600 13px 'Inter', sans-serif;
      color: #1a1a1a;
    }

    .error-count {
      color: #ef4444;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      color: #6b7280;
      text-align: center;
    }

    .empty-state i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
  `]
})
export class IntegrationStatusComponent {
  @Input() statusData: StatusIntegracao | null = null;

  getStatusLabel(status: string): string {
    const labels = {
      'online': 'Sistema Online',
      'offline': 'Sistema Offline',
      'warning': 'Atenção Requerida'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getStatusIconClass(): string {
    if (!this.statusData) return '';
    
    const classes = {
      'online': 'text-success',
      'offline': 'text-danger', 
      'warning': 'text-warning'
    };
    
    return classes[this.statusData.status as keyof typeof classes] || '';
  }
}
