import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtividadeRecente } from '../../../../shared/models';
import { getIconClass } from '../../../../compartilhado/utilitarios/icon.util';

@Component({
  selector: 'app-activities-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="activities-card">
      <div class="card-header">
        <div class="card-icon">
          <i class="pi pi-clock"></i>
        </div>
        <div class="header-content">
          <h3 class="card-title">Atividades Recentes</h3>
          <p class="card-subtitle">Últimas {{ activities.length }} ações no sistema</p>
        </div>
        <div class="header-action">
          <button class="view-all-btn">
            <i class="pi pi-refresh"></i>
          </button>
        </div>
      </div>

      <div class="activities-content">
        @if (activities.length > 0) {
          <div class="activities-list">
            @for (atividade of activities; track trackAtividade($index, atividade); let index = $index) {
              <div class="activity-item" [style.animation-delay.ms]="index * 100">
                <div class="activity-indicator">
                  <div class="activity-icon" [class]="getActivityTypeClass(atividade.icon)">
                    <i [class]="getIconClass(atividade.icon)"></i>
                  </div>
                  @if (index < activities.length - 1) {
                    <div class="activity-line"></div>
                  }
                </div>
                <div class="activity-details">
                  <div class="activity-main">
                    <p class="activity-description">{{ atividade.descricao }}</p>
                    <span class="activity-time">{{ atividade.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <i class="pi pi-history empty-icon"></i>
            <h4 class="empty-title">Nenhuma atividade recente</h4>
            <p class="empty-message">As atividades aparecerão aqui quando ocorrerem.</p>
          </div>
        }

        <div class="activities-footer">
          <button class="view-all-activities">
            <i class="pi pi-list"></i>
            Ver Histórico Completo
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activities-card {
      background: white;
      border: 1px solid #f3f4f6;
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .activities-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 1rem 1rem 0 0;
    }

    .activities-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.2);
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
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%);
      color: #3b82f6;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
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

    .header-action {
      margin-left: auto;
    }

    .view-all-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      color: #3b82f6;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
    }

    .view-all-btn:hover {
      background: #3b82f6;
      color: white;
      transform: scale(1.05);
    }

    .activities-content {
      padding: 0 1.5rem 1.5rem;
    }

    .activities-list {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .activity-item {
      display: flex;
      gap: 1rem;
      position: relative;
      animation: slideInLeft 0.5s ease-out backwards;
    }

    .activity-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }

    .activity-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 14px;
      margin-bottom: 0.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 2;
    }

    .activity-icon.user-action {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .activity-icon.document-action {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .activity-icon.system-action {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
    }

    .activity-icon.integration-action {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
    }

    .activity-line {
      width: 2px;
      height: 2rem;
      background: linear-gradient(180deg, #e5e7eb 0%, transparent 100%);
      position: relative;
      z-index: 1;
    }

    .activity-details {
      flex: 1;
      padding-bottom: 1.5rem;
    }

    .activity-main {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 0.75rem;
      padding: 1rem;
      transition: all 0.2s ease;
      position: relative;
    }

    .activity-main:hover {
      background: white;
      border-color: rgba(59, 130, 246, 0.2);
      transform: translateX(4px);
    }

    .activity-main::before {
      content: '';
      position: absolute;
      left: -0.5rem;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-right: 6px solid #f8fafc;
      transition: border-right-color 0.2s ease;
    }

    .activity-main:hover::before {
      border-right-color: white;
    }

    .activity-description {
      font: 500 14px 'Inter', sans-serif;
      margin: 0 0 0.5rem;
      color: #1a1a1a;
      line-height: 1.5;
    }

    .activity-time {
      font: 500 12px 'Inter', sans-serif;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #e5e7eb;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      display: inline-block;
    }

    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
    }

    .empty-icon {
      font-size: 48px;
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .empty-title {
      font: 600 16px 'Inter', sans-serif;
      margin: 0 0 0.5rem;
      color: #1a1a1a;
    }

    .empty-message {
      font: 400 14px 'Inter', sans-serif;
      margin: 0;
      color: #6b7280;
    }

    .activities-footer {
      padding-top: 1rem;
      border-top: 1px solid #f3f4f6;
      text-align: center;
    }

    .view-all-activities {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: transparent;
      border: 1px solid rgba(59, 130, 246, 0.2);
      color: #3b82f6;
      border-radius: 0.5rem;
      font: 500 14px 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .view-all-activities:hover {
      background: #3b82f6;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }

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

    /* Responsive */
    @media (max-width: 768px) {
      .activities-card {
        border-radius: 0.75rem;
      }

      .card-header {
        padding: 1.25rem 1.25rem 0;
        margin-bottom: 1.25rem;
      }

      .activities-content {
        padding: 0 1.25rem 1.25rem;
      }

      .activity-main {
        padding: 0.75rem;
      }
    }
  `]
})
export class ActivitiesListComponent {
  @Input() activities: AtividadeRecente[] = [];

  trackAtividade(index: number, item: AtividadeRecente): string {
    return item.id;
  }

  getActivityTypeClass(icone: string): string {
    const typeMap: Record<string, string> = {
      'users': 'user-action',
      'user': 'user-action',
      'file': 'document-action',
      'file-edit': 'document-action',
      'home': 'integration-action',
      'list-check': 'system-action'
    };
    return typeMap[icone] || 'system-action';
  }

  getIconClass = getIconClass;
}
