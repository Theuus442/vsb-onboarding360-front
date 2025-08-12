import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carregando',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [style.height.px]="altura()">
      <div class="loading-content">
        <div class="loading-spinner" [style.width.px]="tamanho()" [style.height.px]="tamanho()">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        @if (mensagem()) {
          <p class="loading-message">{{ mensagem() }}</p>
        }
        @if (submensagem()) {
          <p class="loading-submessage">{{ submensagem() }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 100px;
      position: relative;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      text-align: center;
    }

    .loading-spinner {
      position: relative;
      display: inline-block;
    }

    .spinner-ring {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 3px solid transparent;
      border-radius: 50%;
      animation: spin 2s linear infinite;
    }

    .spinner-ring:nth-child(1) {
      border-top-color: #667eea;
      animation-delay: 0s;
    }

    .spinner-ring:nth-child(2) {
      border-right-color: #764ba2;
      animation-delay: 0.3s;
    }

    .spinner-ring:nth-child(3) {
      border-bottom-color: #f093fb;
      animation-delay: 0.6s;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
        opacity: 1;
      }
      50% {
        opacity: 0.3;
      }
      100% {
        transform: rotate(360deg);
        opacity: 1;
      }
    }

    .loading-message {
      font: 600 1rem/1.4 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      animation: fadeInUp 0.8s ease-out;
    }

    .loading-submessage {
      font: 400 0.875rem/1.4 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
      animation: fadeInUp 0.8s ease-out 0.2s both;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .loading-message {
        font-size: 0.875rem;
      }
      
      .loading-submessage {
        font-size: 0.75rem;
      }
    }

    /* Reduce motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
      .spinner-ring {
        animation: none;
      }
      
      .loading-message,
      .loading-submessage {
        animation: none;
      }
    }
  `]
})
export class CarregandoComponent {
  readonly mensagem = input<string>('');
  readonly submensagem = input<string>('');
  readonly tamanho = input<number>(40);
  readonly altura = input<number>(200);
}
