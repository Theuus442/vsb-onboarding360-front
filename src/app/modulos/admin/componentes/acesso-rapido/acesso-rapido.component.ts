import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcessoRapido } from '../../../../compartilhado/modelos';

@Component({
  selector: 'app-acesso-rapido',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quick-access-container">
      <div class="section-header">
        <div class="header-icon">
          <i class="pi pi-bolt"></i>
        </div>
        <div class="header-content">
          <h3 class="section-title">Acesso Rápido</h3>
          <p class="section-subtitle">{{ getSubtitle() }}</p>
        </div>
        @if (hasActiveItems()) {
          <div class="items-count">
            <span class="count-badge">{{ activeItemsCount() }}</span>
          </div>
        }
      </div>
      
      <div class="quick-access-grid">
        @if (itens && itens.length > 0) {
          @for (item of itens; track item.id; let i = $index) {
            <button 
              class="quick-access-item" 
              [class.disabled]="!item.ativo"
              [class.has-notification]="item.contador && item.contador > 0"
              (click)="onItemClick(item)"
              [disabled]="!item.ativo"
              [style.animation-delay]="(i * 80) + 'ms'"
              [attr.aria-label]="item.titulo + (item.contador ? ' - ' + item.contador + ' itens' : '')">
              
              <div class="item-icon" [style.background]="getIconGradient(item.cor)">
                <i class="pi" [ngClass]="getIconClass(item.icone)"></i>
                @if (item.contador !== undefined && item.contador > 0) {
                  <span class="item-badge" [class.high-count]="item.contador > 99">
                    {{ formatCount(item.contador) }}
                  </span>
                }
              </div>
              
              <div class="item-content">
                <h4 class="item-title">{{ item.titulo }}</h4>
                <p class="item-description">{{ item.descricao }}</p>
                @if (item.contador && item.contador > 0) {
                  <div class="item-meta">
                    <span class="meta-text">{{ getCountText(item.contador) }}</span>
                  </div>
                }
              </div>
              
              <div class="item-action">
                <div class="action-indicator">
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </button>
          }
        } @else {
          <div class="empty-state">
            <div class="empty-icon">
              <i class="pi pi-settings"></i>
            </div>
            <h4 class="empty-title">Nenhum acesso configurado</h4>
            <p class="empty-message">Configure ações rápidas para melhorar sua produtividade</p>
          </div>
        }
      </div>
      
      @if (hasInactiveItems()) {
        <div class="inactive-notice">
          <i class="pi pi-info-circle"></i>
          <span>{{ inactiveItemsCount() }} {{ inactiveItemsCount() === 1 ? 'ação inativa' : 'ações inativas' }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    /* Modern Quick Access Component with Enhanced UX */
    .quick-access-container {
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

    .quick-access-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #A52831 0%, #C73E1D 50%, #667eea 100%);
      opacity: 0.6;
    }

    .quick-access-container:hover {
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
      position: relative;
    }

    .header-icon {
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #A52831 0%, #C73E1D 100%);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 8px 24px rgba(165, 40, 49, 0.4),
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

    .items-count {
      display: flex;
      align-items: center;
    }

    .count-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font: 700 0.75rem 'Inter', sans-serif;
      padding: 0.375rem 0.75rem;
      border-radius: 0.75rem;
      min-width: 2rem;
      text-align: center;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    }

    /* Enhanced Quick Access Grid */
    .quick-access-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .quick-access-item {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 1rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      text-align: left;
      width: 100%;
      position: relative;
      overflow: hidden;
      animation: slideInUp 0.6s ease-out backwards;
    }

    .quick-access-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent);
      transition: left 0.6s ease;
    }

    .quick-access-item:hover::before {
      left: 100%;
    }

    .quick-access-item:hover {
      background: rgba(255, 255, 255, 0.06);
      transform: translateY(-4px) translateX(6px);
      border-color: rgba(102, 126, 234, 0.3);
      box-shadow: 
        0 12px 40px rgba(102, 126, 234, 0.15),
        0 0 0 1px rgba(102, 126, 234, 0.1);
    }

    .quick-access-item.has-notification {
      border-color: rgba(239, 68, 68, 0.2);
    }

    .quick-access-item.has-notification:hover {
      border-color: rgba(239, 68, 68, 0.4);
      box-shadow: 
        0 12px 40px rgba(239, 68, 68, 0.15),
        0 0 0 1px rgba(239, 68, 68, 0.1);
    }

    .quick-access-item:disabled,
    .quick-access-item.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none !important;
      background: rgba(255, 255, 255, 0.01) !important;
      border-color: rgba(255, 255, 255, 0.03) !important;
      box-shadow: none !important;
    }

    .quick-access-item:disabled::before,
    .quick-access-item.disabled::before {
      display: none;
    }

    /* Enhanced Item Icon */
    .item-icon {
      width: 3.25rem;
      height: 3.25rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .item-icon::after {
      content: '';
      position: absolute;
      inset: 2px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
      border-radius: 0.75rem;
      pointer-events: none;
    }

    .item-icon i {
      font-size: 1.25rem;
      color: white;
      z-index: 1;
      transition: transform 0.3s ease;
    }

    .quick-access-item:hover .item-icon i {
      transform: scale(1.1);
    }

    .item-badge {
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
      background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%);
      color: white;
      font: 700 0.7rem 'Inter', sans-serif;
      padding: 0.25rem 0.5rem;
      border-radius: 0.75rem;
      min-width: 1.5rem;
      text-align: center;
      box-shadow: 
        0 4px 16px rgba(239, 68, 68, 0.4),
        0 0 0 2px rgba(255, 255, 255, 0.1);
      z-index: 2;
      transition: all 0.3s ease;
    }

    .item-badge.high-count {
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      animation: pulse 2s infinite;
    }

    .quick-access-item:hover .item-badge {
      transform: scale(1.1);
    }

    /* Enhanced Item Content */
    .item-content {
      flex: 1;
      min-width: 0;
    }

    .item-title {
      font: 700 1rem/1.3 'Inter', sans-serif;
      color: #ffffff;
      margin: 0 0 0.375rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-description {
      font: 400 0.8rem/1.4 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 0.5rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-meta {
      margin-top: 0.5rem;
    }

    .meta-text {
      font: 600 0.7rem 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
    }

    /* Enhanced Item Action */
    .item-action {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .action-indicator {
      width: 2.5rem;
      height: 2.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s ease;
    }

    .action-indicator i {
      font-size: 0.875rem;
      transition: transform 0.3s ease;
    }

    .quick-access-item:hover .action-indicator {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }

    .quick-access-item:hover .action-indicator i {
      transform: translateX(4px);
    }

    /* Enhanced Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      color: rgba(255, 255, 255, 0.6);
      background: rgba(255, 255, 255, 0.01);
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
    }

    .empty-icon {
      width: 4rem;
      height: 4rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .empty-icon i {
      font-size: 1.5rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .empty-title {
      font: 600 1.125rem/1.3 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.8);
      margin: 0 0 0.75rem 0;
    }

    .empty-message {
      font: 400 0.875rem/1.5 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
    }

    /* Inactive Notice */
    .inactive-notice {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 0.75rem;
      color: #f59e0b;
      font: 500 0.8rem 'Inter', sans-serif;
    }

    .inactive-notice i {
      font-size: 0.875rem;
    }

    /* Animations */
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    /* Responsive Design */
    @media (min-width: 768px) {
      .quick-access-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
      }
    }

    @media (min-width: 1200px) {
      .quick-access-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }

    @media (max-width: 640px) {
      .quick-access-container {
        padding: 1.25rem;
      }
      
      .section-header {
        margin-bottom: 1.25rem;
        padding-bottom: 1rem;
      }
      
      .header-icon {
        width: 2.5rem;
        height: 2.5rem;
      }
      
      .section-title {
        font-size: 1.125rem;
      }
      
      .quick-access-item {
        padding: 1rem;
        gap: 1rem;
      }
      
      .item-icon {
        width: 2.75rem;
        height: 2.75rem;
      }
      
      .item-icon i {
        font-size: 1.125rem;
      }
      
      .item-title {
        font-size: 0.925rem;
      }
      
      .item-description {
        font-size: 0.775rem;
      }
    }

    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
      .quick-access-item,
      .quick-access-item::before,
      .action-indicator,
      .item-icon i,
      .item-badge {
        transition: none;
        animation: none;
      }
    }

    .quick-access-item:focus {
      outline: 2px solid #667eea;
      outline-offset: 2px;
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .quick-access-container {
        border-color: rgba(255, 255, 255, 0.3);
      }
      
      .quick-access-item {
        border-color: rgba(255, 255, 255, 0.2);
      }
      
      .section-header {
        border-color: rgba(255, 255, 255, 0.2);
      }
    }
  `]
})
export class AcessoRapidoComponent {
  @Input() itens: AcessoRapido[] = [];
  @Output() itemClick = new EventEmitter<AcessoRapido>();

  // Signals for reactive computed values
  protected readonly activeItems = computed(() => 
    this.itens.filter(item => item.ativo)
  );

  protected readonly inactiveItems = computed(() => 
    this.itens.filter(item => !item.ativo)
  );

  protected readonly activeItemsCount = computed(() => 
    this.activeItems().length
  );

  protected readonly inactiveItemsCount = computed(() => 
    this.inactiveItems().length
  );

  protected readonly hasActiveItems = computed(() => 
    this.activeItemsCount() > 0
  );

  protected readonly hasInactiveItems = computed(() => 
    this.inactiveItemsCount() > 0
  );

  onItemClick(item: AcessoRapido): void {
    if (item.ativo) {
      this.itemClick.emit(item);
    }
  }

  getSubtitle(): string {
    const activeCount = this.activeItemsCount();
    if (activeCount === 0) return 'Configure suas ações';
    if (activeCount === 1) return '1 ação disponível';
    return `${activeCount} ações disponíveis`;
  }

  getIconGradient(cor: string): string {
    // Create sophisticated gradients based on the base color
    const colorMap: Record<string, string> = {
      '#3b82f6': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      '#10b981': 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      '#f59e0b': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      '#8b5cf6': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      '#ef4444': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      '#06b6d4': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      '#84cc16': 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
    };

    return colorMap[cor] || `linear-gradient(135deg, ${cor} 0%, ${this.darkenColor(cor, 20)} 100%)`;
  }

  private darkenColor(color: string, percent: number): string {
    // Simple color darkening function
    if (color.startsWith('#')) {
      const num = parseInt(color.slice(1), 16);
      const r = Math.max(0, (num >> 16) - percent);
      const g = Math.max(0, ((num >> 8) & 0x00FF) - percent);
      const b = Math.max(0, (num & 0x0000FF) - percent);
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    return color;
  }

  formatCount(count: number): string {
    if (count > 999) return '999+';
    return count.toString();
  }

  getCountText(count: number): string {
    if (count === 1) return '1 item pendente';
    if (count > 999) return 'Muitos itens';
    return `${count} itens pendentes`;
  }

  /**
   * Enhanced icon mapping with comprehensive coverage
   */
  getIconClass(iconName: string): string {
    if (!iconName) return 'pi-circle';
    
    // If already has pi- prefix, return as is
    if (iconName.startsWith('pi-')) {
      return iconName;
    }
    
    // Comprehensive icon mappings
    const iconMappings: Record<string, string> = {
      // Action icons
      'plus-circle': 'pi-plus-circle',
      'plus': 'pi-plus',
      'edit': 'pi-pencil',
      'delete': 'pi-trash',
      'save': 'pi-save',
      'cancel': 'pi-times',
      'check': 'pi-check',
      'search': 'pi-search',
      'filter': 'pi-filter',
      'refresh': 'pi-refresh',
      'sync': 'pi-refresh',
      'settings': 'pi-cog',
      'gear': 'pi-cog',
      'config': 'pi-cog',
      
      // Navigation icons
      'home': 'pi-home',
      'dashboard': 'pi-th-large',
      'back': 'pi-arrow-left',
      'forward': 'pi-arrow-right',
      'up': 'pi-arrow-up',
      'down': 'pi-arrow-down',
      
      // Entity icons
      'users': 'pi-users',
      'user': 'pi-user',
      'user-plus': 'pi-user-plus',
      'building': 'pi-building',
      'company': 'pi-building',
      'organization': 'pi-building',
      
      // File and document icons
      'file-text': 'pi-file',
      'file': 'pi-file',
      'folder': 'pi-folder',
      'document': 'pi-file',
      'upload': 'pi-upload',
      'download': 'pi-download',
      'attach': 'pi-paperclip',
      
      // Chart and analytics
      'bar-chart': 'pi-chart-bar',
      'chart': 'pi-chart-line',
      'analytics': 'pi-chart-line',
      'stats': 'pi-chart-bar',
      'report': 'pi-file-pdf',
      
      // Communication
      'mail': 'pi-envelope',
      'email': 'pi-envelope',
      'phone': 'pi-phone',
      'chat': 'pi-comments',
      'message': 'pi-comment',
      'notification': 'pi-bell',
      'bell': 'pi-bell',
      
      // Status and feedback
      'info': 'pi-info-circle',
      'warning': 'pi-exclamation-triangle',
      'error': 'pi-times-circle',
      'success': 'pi-check-circle',
      'help': 'pi-question-circle',
      'alert': 'pi-exclamation-triangle',
      
      // Time and calendar
      'calendar': 'pi-calendar',
      'clock': 'pi-clock',
      'time': 'pi-clock',
      'schedule': 'pi-calendar',
      'date': 'pi-calendar',
      
      // Technology
      'database': 'pi-database',
      'server': 'pi-server',
      'cloud': 'pi-cloud',
      'api': 'pi-code',
      'code': 'pi-code',
      'link': 'pi-link',
      'unlink': 'pi-unlink',
      
      // Business
      'money': 'pi-dollar',
      'currency': 'pi-dollar',
      'payment': 'pi-credit-card',
      'invoice': 'pi-file-pdf',
      'contract': 'pi-file-pdf',
      'business': 'pi-briefcase',
      'briefcase': 'pi-briefcase',
      
      // Security
      'lock': 'pi-lock',
      'unlock': 'pi-unlock',
      'shield': 'pi-shield',
      'key': 'pi-key',
      'security': 'pi-shield',
      
      // Misc
      'tag': 'pi-tag',
      'tags': 'pi-tags',
      'bookmark': 'pi-bookmark',
      'star': 'pi-star',
      'heart': 'pi-heart',
      'flag': 'pi-flag',
      'pin': 'pi-map-marker',
      'location': 'pi-map-marker',
      'globe': 'pi-globe',
      'world': 'pi-globe'
    };
    
    // Return mapped icon or add pi- prefix as fallback
    return iconMappings[iconName] || `pi-${iconName}`;
  }
}
