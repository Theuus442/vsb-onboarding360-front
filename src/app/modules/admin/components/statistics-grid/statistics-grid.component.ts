import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Estatistica } from '../../../../shared/models';

@Component({
  selector: 'app-statistics-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-grid">
      @for (estatistica of statistics; track trackEstatistica($index, estatistica)) {
        <div class="stat-card" [style.animation-delay.s]="$index * 0.1">
          <div class="stat-content">
            <div class="stat-header">
              <div class="stat-label-container">
                <h3 class="stat-label">{{ estatistica.titulo }}</h3>
              </div>
              <div class="stat-icon">
                <i [class]="'pi pi-' + estatistica.icon"></i>
              </div>
            </div>
            
            <div class="stat-main">
              <p class="stat-value">{{ estatistica.valor | number }}</p>
              @if (estatistica.porcentagem !== undefined) {
                <div class="stat-trend" [class]="getTrendClass(estatistica.tipo)">
                  <i [class]="'pi ' + getTrendIcon(estatistica.tipo) + ' trend-icon'"></i>
                  <span class="trend-text">{{ estatistica.porcentagem }}%</span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border: 1px solid #f3f4f6;
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      position: relative;
      animation: slideInUp 0.6s ease-out backwards;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #A52831 0%, #C73E1D 100%);
      border-radius: 1rem 1rem 0 0;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(165, 40, 49, 0.15);
      border-color: rgba(165, 40, 49, 0.2);
    }

    .stat-content {
      padding: 1.5rem;
      position: relative;
    }

    .stat-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .stat-label-container {
      flex: 1;
    }

    .stat-label {
      font: 600 14px 'Inter', sans-serif;
      margin: 0;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.4;
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #A52831 0%, #C73E1D 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(165, 40, 49, 0.3);
      font-size: 22px;
      flex-shrink: 0;
    }

    .stat-main {
      margin-bottom: 1rem;
    }

    .stat-value {
      font: 700 40px/1 'Inter', sans-serif;
      margin: 0 0 0.75rem;
      background: linear-gradient(135deg, #1a1a1a 0%, #A52831 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-trend {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font: 600 13px 'Inter', sans-serif;
      padding: 0.5rem 0.75rem;
      border-radius: 2rem;
      width: fit-content;
    }

    .stat-trend.positive {
      color: #10b981;
      background: #d1fae5;
    }

    .stat-trend.negative {
      color: #ef4444;
      background: #fee2e2;
    }

    .stat-trend.neutral {
      color: #6b7280;
      background: #f3f4f6;
    }

    .trend-icon {
      font-size: 12px;
      font-weight: bold;
    }

    .trend-text {
      font-weight: 700;
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
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .stat-card {
        border-radius: 0.75rem;
      }

      .stat-content {
        padding: 1.25rem;
      }

      .stat-value {
        font-size: 32px;
      }

      .stat-icon {
        width: 44px;
        height: 44px;
        font-size: 18px;
      }
    }
  `]
})
export class StatisticsGridComponent {
  @Input() statistics: Estatistica[] = [];

  trackEstatistica(index: number, item: Estatistica): string {
    return item.id;
  }

  getTrendClass(tipo: Estatistica['tipo']): string {
    return `stat-trend ${tipo}`;
  }

  getTrendIcon(tipo: Estatistica['tipo']): string {
    const iconMap = {
      'crescimento': 'pi-arrow-up-right',
      'decrescimento': 'pi-arrow-down-right',
      'neutro': 'pi-minus'
    };
    return iconMap[tipo] || 'pi-minus';
  }
}
