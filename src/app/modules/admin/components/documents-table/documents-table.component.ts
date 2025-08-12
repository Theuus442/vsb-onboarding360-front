import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentoPendente } from '../../../../shared/models';
import { StatusTagComponent } from '../../../../shared/components/status-tag/status-tag.component';

@Component({
  selector: 'app-documents-table',
  standalone: true,
  imports: [CommonModule, StatusTagComponent],
  template: `
    <div class="documents-card">
      <div class="card-header">
        <div class="card-icon">
          <i class="pi pi-file"></i>
        </div>
        <div class="header-content">
          <h3 class="card-title">Documentos Pendentes</h3>
          <p class="card-subtitle">{{ documents.length }} documentos aguardando revisão</p>
        </div>
        <div class="header-action">
          <button class="view-all-btn" (click)="viewAllDocuments.emit()">
            <i class="pi pi-external-link"></i>
          </button>
        </div>
      </div>

      <div class="documents-content">
        @if (documents.length > 0) {
          <div class="documents-list">
            @for (documento of documents; track documento.id; let index = $index) {
              <div class="document-item" [style.animation-delay.ms]="index * 100">
                <div class="document-info">
                  <div class="document-icon">
                    <i [class]="getDocumentIcon(documento.tipo)"></i>
                  </div>
                  <div class="document-details">
                    <h4 class="document-name">{{ documento.nome }}</h4>
                    <p class="document-partner">{{ documento.parceiro }}</p>
                    <span class="document-date">{{ documento.created_at | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
                <div class="document-status">
                  <app-status-tag [status]="documento.status" type="documento"></app-status-tag>
                </div>
              </div>
            }
          </div>
          
          <div class="documents-footer">
            <button class="view-all-documents" (click)="viewAllDocuments.emit()">
              <i class="pi pi-list"></i>
              Ver Todos os Documentos
            </button>
          </div>
        } @else {
          <div class="empty-state">
            <i class="pi pi-file-o empty-icon"></i>
            <h4 class="empty-title">Nenhum documento pendente</h4>
            <p class="empty-message">Todos os documentos foram processados.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .documents-card {
      background: white;
      border: 1px solid #f3f4f6;
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s ease;
      position: relative;
    }

    .documents-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
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
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
      color: #f59e0b;
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

    .header-action {
      margin-left: auto;
    }

    .view-all-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
    }

    .view-all-btn:hover {
      background: #f59e0b;
      color: white;
      transform: scale(1.05);
    }

    .documents-content {
      padding: 0 1.5rem 1.5rem;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .document-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 0.75rem;
      transition: all 0.2s ease;
      animation: slideInRight 0.5s ease-out backwards;
    }

    .document-item:hover {
      background: white;
      border-color: rgba(245, 158, 11, 0.2);
      transform: translateX(-4px);
    }

    .document-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .document-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border-radius: 0.5rem;
      color: white;
      font-size: 16px;
    }

    .document-details {
      flex: 1;
    }

    .document-name {
      font: 600 14px 'Inter', sans-serif;
      margin: 0 0 0.25rem;
      color: #1a1a1a;
    }

    .document-partner {
      font: 500 12px 'Inter', sans-serif;
      margin: 0 0 0.25rem;
      color: #6b7280;
    }

    .document-date {
      font: 400 11px 'Inter', sans-serif;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .document-status {
      margin-left: auto;
    }

    .documents-footer {
      padding-top: 1rem;
      border-top: 1px solid #f3f4f6;
      text-align: center;
    }

    .view-all-documents {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: transparent;
      border: 1px solid rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      border-radius: 0.5rem;
      font: 500 14px 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .view-all-documents:hover {
      background: #f59e0b;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
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

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class DocumentsTableComponent {
  @Input() documents: DocumentoPendente[] = [];
  @Output() viewAllDocuments = new EventEmitter<void>();

  getDocumentIcon(tipo: string): string {
    const iconMap: Record<string, string> = {
      'pdf': 'pi pi-file-pdf',
      'doc': 'pi pi-file-word',
      'excel': 'pi pi-file-excel',
      'image': 'pi pi-image',
      'contract': 'pi pi-file-edit'
    };
    return iconMap[tipo] || 'pi pi-file';
  }
}
