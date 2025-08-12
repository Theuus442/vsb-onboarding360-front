import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-api-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="api-status-container" [class.error]="!isConnected">
      <div class="status-indicator">
        <i [class]="getIconClass()"></i>
        <div class="status-text">
          <h3>{{ getTitle() }}</h3>
          <p>{{ getMessage() }}</p>
          @if (!isConnected) {
            <div class="instructions">
              <p><strong>🚀 Para iniciar o backend:</strong></p>
              <ol>
                <li>
                  <strong>Abra o terminal/prompt</strong> na pasta do seu projeto backend
                </li>
                <li>
                  <strong>Execute um dos comandos:</strong>
                  <div class="command-options">
                    <code>npm start</code>
                    <code>npm run dev</code>
                    <code>node server.js</code>
                    <code>nodemon server.js</code>
                  </div>
                </li>
                <li>
                  <strong>Verifique os logs</strong> se a API iniciou na porta 3000
                </li>
                <li>
                  <strong>Aguarde alguns segundos</strong> e clique em "Tentar Novamente"
                </li>
              </ol>

              <div class="api-info">
                <p><strong>Endpoint esperado:</strong> <code>{{ apiUrl }}/dashboard</code></p>
                <p><strong>Status atual:</strong> <span class="status-error">Desconectado</span></p>
                @if (lastError?.timestamp) {
                  <p><strong>Último erro:</strong> {{ formatTimestamp(lastError.timestamp) }}</p>
                }
              </div>
              <div class="action-buttons">
                <button class="retry-button" (click)="onRetry()">
                  <i class="pi pi-refresh"></i>
                  Tentar Novamente
                </button>
                <button class="test-button" (click)="testConnection()">
                  <i class="pi pi-search"></i>
                  Testar Conexão
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .api-status-container {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1rem 0;
      color: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .api-status-container.error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .status-indicator {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .status-indicator i {
      font-size: 2rem;
      margin-top: 0.25rem;
      flex-shrink: 0;
    }

    .status-text h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .status-text p {
      margin: 0 0 1rem 0;
      opacity: 0.9;
    }

    .instructions {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .instructions p {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }

    .instructions ol {
      margin: 0;
      padding-left: 1.5rem;
    }

    .instructions li {
      margin: 0.25rem 0;
      opacity: 0.9;
    }

    .action-buttons {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .retry-button,
    .test-button {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .retry-button:hover,
    .test-button:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    .retry-button:active,
    .test-button:active {
      transform: translateY(0);
    }

    .test-button {
      background: rgba(255, 255, 255, 0.15);
    }

    .api-info {
      background: rgba(0, 0, 0, 0.1);
      padding: 0.75rem;
      border-radius: 6px;
      margin-top: 1rem;
      font-size: 0.875rem;
    }

    .api-info p {
      margin: 0.25rem 0;
      font-family: 'Courier New', monospace;
    }

    .api-info code {
      background: rgba(0, 0, 0, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: bold;
    }

    .status-error {
      color: #ffeb3b;
      font-weight: bold;
    }

    ol li code {
      background: rgba(0, 0, 0, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: bold;
    }

    .command-options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 0.5rem 0;
      padding-left: 1rem;
    }

    .command-options code {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.5rem;
      border-radius: 4px;
      font-weight: bold;
      font-family: 'Courier New', monospace;
      border-left: 3px solid rgba(255, 255, 255, 0.5);
    }
  `]
})
export class ApiStatusComponent {
  @Input() isConnected: boolean = true;
  @Input() lastError?: any;
  @Input() apiUrl?: string = 'http://localhost:3000/api';
  @Output() retry = new EventEmitter<void>();

  getIconClass(): string {
    return this.isConnected ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle';
  }

  getTitle(): string {
    return this.isConnected ? 'API Conectada' : 'API Indisponível';
  }

  getMessage(): string {
    if (this.isConnected) {
      return 'Conectado com sucesso ao servidor backend.';
    }
    return 'Não foi possível conectar com o servidor backend na porta 3000.';
  }

  onRetry(): void {
    this.retry.emit();
  }

  testConnection(): void {
    window.open(`${this.apiUrl}/dashboard`, '_blank');
  }

  formatTimestamp(timestamp: string): string {
    try {
      return new Date(timestamp).toLocaleString('pt-BR');
    } catch {
      return timestamp;
    }
  }
}
