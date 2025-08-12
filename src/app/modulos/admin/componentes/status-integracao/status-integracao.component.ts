import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusIntegracao } from '../../../../compartilhado/modelos';

@Component({
  selector: 'app-status-integracao',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-integracao">
      <h3 class="titulo-secao">Status de Integração</h3>
      
      <div *ngIf="status" class="container-status">
        <div class="status-item" [ngClass]="'status-' + status.status">
          <div class="status-header">
            <div class="status-indicator">
              <i [class]="getStatusIcon(status.status)"></i>
            </div>
            <div class="status-info">
              <h4>{{ status.servico }}</h4>
              <span class="status-label">{{ getStatusLabel(status.status) }}</span>
            </div>
          </div>
          
          <div class="status-details">
            <div class="detail-item">
              <span class="label">Última sincronização:</span>
              <span class="value">{{ formatarDataHora(status.ultima_sincronizacao) }}</span>
            </div>
            
            <div *ngIf="status.uptime" class="detail-item">
              <span class="label">Uptime:</span>
              <span class="value">{{ status.uptime }}</span>
            </div>
            
            <div *ngIf="status.tempo_resposta" class="detail-item">
              <span class="label">Tempo de resposta:</span>
              <span class="value">{{ status.tempo_resposta }}ms</span>
            </div>
            
            <div *ngIf="status.mensagem" class="status-message">
              <i class="pi pi-info-circle"></i>
              <span>{{ status.mensagem }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="!status" class="sem-dados">
        <i class="pi pi-exclamation-triangle"></i>
        <p>Dados de integração não disponíveis</p>
      </div>
    </div>
  `,
  styles: [`
    .status-integracao {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .titulo-secao {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
    }
    
    .status-item {
      border-radius: 8px;
      padding: 1rem;
      border-left: 4px solid;
    }
    
    .status-online {
      background-color: #f0f9ff;
      border-left-color: #10b981;
    }
    
    .status-offline {
      background-color: #fef2f2;
      border-left-color: #ef4444;
    }
    
    .status-warning {
      background-color: #fffbeb;
      border-left-color: #f59e0b;
    }
    
    .status-manutencao {
      background-color: #f3f4f6;
      border-left-color: #6b7280;
    }
    
    .status-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .status-indicator {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }
    
    .status-online .status-indicator {
      background-color: #10b981;
    }
    
    .status-offline .status-indicator {
      background-color: #ef4444;
    }
    
    .status-warning .status-indicator {
      background-color: #f59e0b;
    }
    
    .status-manutencao .status-indicator {
      background-color: #6b7280;
    }
    
    .status-info h4 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }
    
    .status-label {
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .status-online .status-label {
      color: #059669;
    }
    
    .status-offline .status-label {
      color: #dc2626;
    }
    
    .status-warning .status-label {
      color: #d97706;
    }
    
    .status-manutencao .status-label {
      color: #4b5563;
    }
    
    .status-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    
    .detail-item .label {
      color: #666;
      font-weight: 500;
    }
    
    .detail-item .value {
      color: #333;
      font-weight: 600;
    }
    
    .status-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      padding: 0.75rem;
      background-color: rgba(0,0,0,0.05);
      border-radius: 6px;
      font-size: 0.9rem;
      color: #555;
    }
    
    .sem-dados {
      text-align: center;
      padding: 2rem;
      color: #999;
    }
    
    .sem-dados i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      display: block;
    }
  `]
})
export class StatusIntegracaoComponent {
  @Input() status: StatusIntegracao | null = null;

  getStatusIcon(status: string): string {
    switch (status) {
      case 'online':
        return 'pi pi-check-circle';
      case 'offline':
        return 'pi pi-times-circle';
      case 'warning':
        return 'pi pi-exclamation-triangle';
      case 'manutencao':
        return 'pi pi-cog';
      default:
        return 'pi pi-question-circle';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'warning':
        return 'Atenção';
      case 'manutencao':
        return 'Manutenção';
      default:
        return 'Desconhecido';
    }
  }

  formatarDataHora(data: string): string {
    return new Date(data).toLocaleString('pt-BR');
  }
}
