import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcessoRapido } from '../../../../shared/models';
import { getIconClass } from '../../../../compartilhado/utilitarios/icon.util';

@Component({
  selector: 'app-quick-access',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quick-access-grid">
      @for (item of quickAccessItems; track item.id; let index = $index) {
        <div 
          class="access-card" 
          [style.animation-delay.ms]="index * 100"
          (click)="itemClick.emit(item)">
          <div class="access-icon" [style.background]="item.cor">
            <i [class]="getIconClass(item.icon)"></i>
          </div>
          <div class="access-content">
            <h3 class="access-title">{{ item.titulo }}</h3>
            <p class="access-description">{{ item.descricao }}</p>
          </div>
          <div class="access-arrow">
            <i class="pi pi-arrow-right"></i>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .quick-access-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .access-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border: 1px solid #f3f4f6;
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      animation: slideInUp 0.6s ease-out backwards;
    }

    .access-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #A52831 0%, #C73E1D 100%);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    .access-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(165, 40, 49, 0.15);
      border-color: rgba(165, 40, 49, 0.2);
    }

    .access-card:hover::before {
      transform: scaleX(1);
    }

    .access-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 1rem;
      color: white;
      font-size: 24px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .access-content {
      flex: 1;
    }

    .access-title {
      font: 600 16px 'Inter', sans-serif;
      margin: 0 0 0.5rem;
      color: #1a1a1a;
    }

    .access-description {
      font: 400 14px 'Inter', sans-serif;
      margin: 0;
      color: #6b7280;
      line-height: 1.4;
    }

    .access-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba(165, 40, 49, 0.1);
      border-radius: 50%;
      color: #A52831;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .access-card:hover .access-arrow {
      background: #A52831;
      color: white;
      transform: translateX(4px);
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .quick-access-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .access-card {
        padding: 1.25rem;
      }

      .access-icon {
        width: 48px;
        height: 48px;
        font-size: 20px;
      }

      .access-title {
        font-size: 15px;
      }

      .access-description {
        font-size: 13px;
      }
    }
  `]
})
export class QuickAccessComponent {
  @Input() quickAccessItems: AcessoRapido[] = [];
  @Output() itemClick = new EventEmitter<AcessoRapido>();

  getIconClass = getIconClass;
}
