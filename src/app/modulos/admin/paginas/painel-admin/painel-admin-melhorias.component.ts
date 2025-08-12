import { Component, signal, computed, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';

// Layout component
import { LayoutComponent } from '../../../../compartilhado/layout/layout.component';

// Shared Components
import { CarregandoComponent } from '../../../../compartilhado/componentes';

// Models and Services
import {
  Estatistica,
  AtividadeRecente,
  DocumentoPendente,
  StatusIntegracao,
  AcessoRapido
} from '../../../../compartilhado/modelos';
import { PainelService, ErrorHandlingService } from '../../../../compartilhado/servicos';

@Component({
  selector: 'app-painel-admin-enhanced',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LayoutComponent,
    CarregandoComponent
  ],
  providers: [ErrorHandlingService],
  template: `
    <app-layout>
      <div class="admin-dashboard" [class.loading]="loading()">
        
        <!-- Breadcrumb Navigation -->
        <nav class="breadcrumb-nav" aria-label="Navegação">
          <div class="breadcrumb-container">
            <div class="breadcrumb-item">
              <i class="pi pi-home" aria-hidden="true"></i>
              <span>Início</span>
            </div>
            <div class="breadcrumb-separator">
              <i class="pi pi-angle-right" aria-hidden="true"></i>
            </div>
            <div class="breadcrumb-item active">
              <span>Dashboard Administrativo</span>
            </div>
          </div>
          
          <!-- Real-time indicator -->
          <div class="real-time-indicator" [class.active]="isLiveMode()">
            <div class="pulse-dot"></div>
            <span>Tempo Real</span>
            <span class="last-update">Atualizado {{ formatLastUpdate() }}</span>
          </div>
        </nav>

        <!-- Enhanced Hero Section -->
        <section class="hero-section enhanced" role="banner">
          <div class="hero-content">
            <div class="hero-text">
              <div class="hero-icon-wrapper">
                <div class="hero-icon" aria-hidden="true">
                  <i class="pi pi-chart-line"></i>
                  <div class="icon-glow"></div>
                </div>
              </div>
              <div class="hero-title-group">
                <h1 class="hero-title">
                  Dashboard Administrativo
                  <span class="title-accent">360°</span>
                </h1>
                <p class="hero-subtitle">
                  Visão completa e em tempo real do sistema de onboarding
                  <span class="subtitle-detail">{{ getTotalEntities() }} entidades monitoradas</span>
                </p>
              </div>
            </div>
            
            <!-- Enhanced Statistics with Mini Charts -->
            <div class="hero-stats enhanced" role="region" aria-label="Estatísticas principais">
              @for (stat of estatisticas(); track stat.id; let i = $index) {
                <article class="stat-card enhanced" 
                         [ngClass]="getStatCardClass(stat.tipo || 'neutro')" 
                         [attr.aria-label]="stat.titulo + ': ' + stat.valor"
                         [style.animation-delay]="(i * 150) + 'ms'"
                         (mouseenter)="onStatHover(stat)"
                         (mouseleave)="onStatLeave()">
                  
                  <div class="stat-background">
                    <div class="stat-pattern"></div>
                  </div>
                  
                  <div class="stat-icon enhanced" aria-hidden="true">
                    <i [class]="stat.icone"></i>
                    <div class="icon-reflection"></div>
                  </div>
                  
                  <div class="stat-content enhanced">
                    <div class="stat-value-wrapper">
                      <div class="stat-value animated" 
                           [attr.aria-label]="'Valor: ' + stat.valor">
                        <span class="value-number">{{ getAnimatedValue(stat.valor, i) }}</span>
                        <span class="value-suffix">{{ getValueSuffix(stat.valor) }}</span>
                      </div>
                      
                      <!-- Mini Progress Indicator -->
                      <div class="mini-progress" [style.width.%]="getProgressPercentage(stat)">
                        <div class="progress-fill"></div>
                      </div>
                    </div>
                    
                    <div class="stat-label">{{ stat.titulo }}</div>
                    
                    @if (stat.percentual_mudanca !== undefined) {
                      <div class="stat-trend enhanced" 
                           [ngClass]="getTrendClass(stat.tendencia || 'stable')"
                           [attr.aria-label]="'Tendência: ' + (stat.tendencia || 'estável') + ', ' + Math.abs(stat.percentual_mudanca) + ' por cento'">
                        <i class="pi" [ngClass]="getTrendIcon(stat.tendencia || 'stable')" aria-hidden="true"></i>
                        <span>{{ Math.abs(stat.percentual_mudanca) }}%</span>
                        <span class="trend-period">vs. mês anterior</span>
                      </div>
                    }
                    
                    <!-- Mini sparkline chart -->
                    <div class="mini-chart" #miniChart>
                      <svg width="60" height="20" viewBox="0 0 60 20">
                        <path [attr.d]="generateSparklinePath(stat)" 
                              class="sparkline-path" 
                              fill="none" 
                              stroke="currentColor" 
                              stroke-width="1.5"/>
                      </svg>
                    </div>
                  </div>
                  
                  <!-- Tooltip -->
                  <div class="stat-tooltip" [class.visible]="hoveredStat() === stat">
                    <div class="tooltip-content">
                      <h5>{{ stat.titulo }}</h5>
                      <p>{{ getStatDescription(stat) }}</p>
                      <div class="tooltip-details">
                        <span>Última atualização: {{ formatRelativeTime(stat.ultima_atualizacao || new Date()) }}</span>
                      </div>
                    </div>
                  </div>
                </article>
              }
            </div>
          </div>
        </section>

        <!-- Enhanced Main Content -->
        <main class="content-section enhanced" role="main">
          <div class="content-grid enhanced">
            
            <!-- Activities Section with Enhanced Features -->
            <article class="dashboard-card activities-card enhanced">
              <div class="card-header enhanced">
                <div class="card-title-group">
                  <div class="card-icon-wrapper">
                    <div class="card-icon enhanced">
                      <i class="pi pi-clock"></i>
                      <div class="icon-pulse"></div>
                    </div>
                  </div>
                  <div class="card-title-content">
                    <h2 class="card-title">
                      Atividades Recentes
                      @if (atividadesRecentes().length > 0) {
                        <span class="count-badge">{{ atividadesRecentes().length }}</span>
                      }
                    </h2>
                    <p class="card-subtitle">
                      Últimas ações no sistema
                      <span class="subtitle-time">Atualizadas há {{ getLastActivityTime() }}</span>
                    </p>
                  </div>
                </div>
                
                <div class="card-actions">
                  <button class="card-action-btn" 
                          title="Filtrar atividades" 
                          (click)="toggleActivityFilter()">
                    <i class="pi pi-filter"></i>
                  </button>
                  <button class="card-action-btn primary" 
                          title="Ver todas as atividades">
                    <i class="pi pi-external-link"></i>
                  </button>
                </div>
              </div>
              
              <!-- Activity Filter -->
              @if (showActivityFilter()) {
                <div class="activity-filter">
                  <div class="filter-pills">
                    @for (filter of activityFilters; track filter.id) {
                      <button class="filter-pill" 
                              [class.active]="activeActivityFilter() === filter.id"
                              (click)="setActivityFilter(filter.id)">
                        <i [class]="filter.icon" aria-hidden="true"></i>
                        <span>{{ filter.label }}</span>
                      </button>
                    }
                  </div>
                </div>
              }
              
              <div class="card-content enhanced">
                @if (filteredActivities().length > 0) {
                  <div class="activities-list enhanced">
                    @for (atividade of filteredActivities(); track atividade.id; let i = $index) {
                      <div class="activity-item enhanced" 
                           [style.animation-delay]="(i * 100) + 'ms'"
                           [class.priority-high]="atividade.prioridade === 'alta'"
                           (click)="onActivityClick(atividade)">
                        
                        <div class="activity-timeline">
                          <div class="timeline-dot" [style.background-color]="atividade.cor"></div>
                          @if (i < filteredActivities().length - 1) {
                            <div class="timeline-line"></div>
                          }
                        </div>
                        
                        <div class="activity-icon enhanced" [style.background-color]="atividade.cor">
                          <i [class]="atividade.icone"></i>
                          <div class="icon-ripple"></div>
                        </div>
                        
                        <div class="activity-content enhanced">
                          <div class="activity-header">
                            <h4 class="activity-title">{{ atividade.titulo }}</h4>
                            <div class="activity-badges">
                              @if (atividade.prioridade) {
                                <span class="priority-badge" [class]="'priority-' + atividade.prioridade">
                                  {{ atividade.prioridade }}
                                </span>
                              }
                              @if (atividade.categoria) {
                                <span class="category-badge">{{ atividade.categoria }}</span>
                              }
                            </div>
                          </div>
                          
                          <p class="activity-description">{{ atividade.descricao }}</p>
                          
                          <div class="activity-meta enhanced">
                            @if (atividade.usuario) {
                              <div class="meta-item user">
                                <i class="pi pi-user" aria-hidden="true"></i>
                                <span>{{ atividade.usuario }}</span>
                              </div>
                            }
                            <div class="meta-item time">
                              <i class="pi pi-clock" aria-hidden="true"></i>
                              <span>{{ formatRelativeTime(atividade.data) }}</span>
                            </div>
                            @if (atividade.localizacao) {
                              <div class="meta-item location">
                                <i class="pi pi-map-marker" aria-hidden="true"></i>
                                <span>{{ atividade.localizacao }}</span>
                              </div>
                            }
                          </div>
                        </div>
                        
                        <div class="activity-actions">
                          <button class="action-btn" title="Ver detalhes">
                            <i class="pi pi-eye"></i>
                          </button>
                          <button class="action-btn" title="Compartilhar">
                            <i class="pi pi-share-alt"></i>
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                  
                  <!-- Load More Button -->
                  @if (hasMoreActivities()) {
                    <div class="load-more-container">
                      <button class="load-more-btn" (click)="loadMoreActivities()">
                        <span>Carregar mais atividades</span>
                        <i class="pi pi-angle-down"></i>
                      </button>
                    </div>
                  }
                } @else {
                  <div class="empty-state enhanced">
                    <div class="empty-animation">
                      <div class="empty-icon">
                        <i class="pi pi-clock"></i>
                        <div class="icon-float"></div>
                      </div>
                    </div>
                    <h3 class="empty-title">Nenhuma atividade encontrada</h3>
                    <p class="empty-message">
                      Não há atividades recentes para o filtro selecionado.
                      Tente ajustar os critérios de busca.
                    </p>
                    <button class="empty-action-btn" (click)="resetActivityFilter()">
                      <i class="pi pi-refresh"></i>
                      <span>Limpar filtros</span>
                    </button>
                  </div>
                }
              </div>
            </article>

            <!-- Documents Section with Enhanced Features -->
            <article class="dashboard-card documents-card enhanced">
              <!-- Similar enhanced structure for documents -->
              <!-- Implementation would follow the same pattern as activities -->
            </article>

            <!-- Integration Status with Enhanced Monitoring -->
            <article class="dashboard-card integration-card enhanced">
              <!-- Enhanced integration monitoring -->
            </article>

            <!-- Quick Access with Enhanced UX -->
            <article class="dashboard-card quick-access-card enhanced">
              <!-- Enhanced quick access with better organization -->
            </article>

          </div>
        </main>

        <!-- Enhanced Loading Overlay -->
        @if (loading()) {
          <div class="loading-overlay enhanced">
            <div class="loading-content">
              <div class="loading-spinner-container">
                <div class="loading-spinner enhanced">
                  <div class="spinner-ring"></div>
                  <div class="spinner-ring"></div>
                  <div class="spinner-ring"></div>
                  <div class="spinner-logo">
                    <i class="pi pi-chart-line"></i>
                  </div>
                </div>
              </div>
              <div class="loading-text">
                <h3>Carregando Dashboard</h3>
                <p>Obtendo dados em tempo real do sistema...</p>
                <div class="loading-progress">
                  <div class="progress-bar" [style.width.%]="loadingProgress()"></div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Notification Toast -->
        @if (showNotification()) {
          <div class="notification-toast" [class]="notificationType()">
            <div class="notification-content">
              <i [class]="getNotificationIcon()"></i>
              <div class="notification-text">
                <h4>{{ notificationTitle() }}</h4>
                <p>{{ notificationMessage() }}</p>
              </div>
              <button class="notification-close" (click)="hideNotification()">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>
        }

      </div>
    </app-layout>
  `,
  styleUrls: ['./painel-admin.component.css']
})
export class PainelAdminEnhancedComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly painelService = inject(PainelService);
  private readonly errorHandler = inject(ErrorHandlingService);

  // Enhanced signals
  protected readonly loading = signal(true);
  protected readonly loadingProgress = signal(0);
  protected readonly isLiveMode = signal(true);
  protected readonly lastUpdate = signal(new Date());
  protected readonly hoveredStat = signal<Estatistica | null>(null);
  protected readonly showActivityFilter = signal(false);
  protected readonly activeActivityFilter = signal('todos');
  protected readonly showNotification = signal(false);
  protected readonly notificationType = signal('info');
  protected readonly notificationTitle = signal('');
  protected readonly notificationMessage = signal('');

  // Data signals
  protected readonly estatisticas = signal<Estatistica[]>([]);
  protected readonly atividadesRecentes = signal<AtividadeRecente[]>([]);
  protected readonly documentosPendentes = signal<DocumentoPendente[]>([]);
  protected readonly statusIntegracao = signal<StatusIntegracao[]>([]);
  protected readonly acessoRapido = signal<AcessoRapido[]>([]);

  // Enhanced computed properties
  protected readonly filteredActivities = computed(() => {
    const filter = this.activeActivityFilter();
    const activities = this.atividadesRecentes();
    
    if (filter === 'todos') return activities;
    
    return activities.filter(activity => {
      switch (filter) {
        case 'alta': return activity.prioridade === 'alta';
        case 'usuarios': return activity.categoria === 'usuario';
        case 'documentos': return activity.categoria === 'documento';
        case 'sistema': return activity.categoria === 'sistema';
        default: return true;
      }
    });
  });

  protected readonly getTotalEntities = computed(() => {
    const stats = this.estatisticas();
    return stats.reduce((total, stat) => total + parseInt(stat.valor.toString()), 0);
  });

  // Activity filters
  readonly activityFilters = [
    { id: 'todos', label: 'Todas', icon: 'pi-list' },
    { id: 'alta', label: 'Alta Prioridade', icon: 'pi-exclamation-triangle' },
    { id: 'usuarios', label: 'Usuários', icon: 'pi-users' },
    { id: 'documentos', label: 'Documentos', icon: 'pi-file' },
    { id: 'sistema', label: 'Sistema', icon: 'pi-cog' }
  ];

  // Subscriptions
  private liveUpdateSubscription?: Subscription;
  private animatedValues = new Map<number, number>();

  ngOnInit() {
    this.loadDashboardData();
    this.startLiveUpdates();
    this.startLoadingProgress();
  }

  ngOnDestroy() {
    this.liveUpdateSubscription?.unsubscribe();
  }

  private startLoadingProgress() {
    const progressInterval = setInterval(() => {
      const current = this.loadingProgress();
      if (current < 90) {
        this.loadingProgress.set(current + Math.random() * 15);
      } else {
        clearInterval(progressInterval);
      }
    }, 200);
  }

  private startLiveUpdates() {
    this.liveUpdateSubscription = interval(30000).subscribe(() => {
      if (this.isLiveMode()) {
        this.refreshData();
      }
    });
  }

  private loadDashboardData() {
    // Simulate loading stages
    setTimeout(() => this.loadEstatsticas(), 300);
    setTimeout(() => this.loadAtividades(), 600);
    setTimeout(() => this.loadDocumentos(), 900);
    setTimeout(() => this.loadIntegracoes(), 1200);
    setTimeout(() => {
      this.loadingProgress.set(100);
      this.loading.set(false);
    }, 1500);
  }

  private loadEstatsticas() {
    this.painelService.getEstatisticas().subscribe({
      next: (data: Estatistica[]) => {
        this.estatisticas.set(data);
        this.initializeAnimatedValues(data);
      },
      error: (error: any) => this.handleError('Erro ao carregar estatísticas', error)
    });
  }

  private loadAtividades() {
    this.painelService.getAtividadesRecentes().subscribe({
      next: (data: AtividadeRecente[]) => this.atividadesRecentes.set(data),
      error: (error: any) => this.handleError('Erro ao carregar atividades', error)
    });
  }

  private loadDocumentos() {
    this.painelService.getDocumentosPendentes().subscribe({
      next: (data: DocumentoPendente[]) => this.documentosPendentes.set(data),
      error: (error: any) => this.handleError('Erro ao carregar documentos', error)
    });
  }

  private loadIntegracoes() {
    this.painelService.getStatusIntegracao().subscribe({
      next: (data: StatusIntegracao) => this.statusIntegracao.set([data]),
      error: (error: any) => this.handleError('Erro ao carregar integrações', error)
    });
  }

  private refreshData() {
    this.lastUpdate.set(new Date());
    // Refresh logic here
  }

  private initializeAnimatedValues(stats: Estatistica[]) {
    stats.forEach((stat, index) => {
      this.animatedValues.set(index, 0);
      this.animateValue(index, parseInt(stat.valor.toString()));
    });
  }

  private animateValue(index: number, targetValue: number) {
    const duration = 2000;
    const steps = 60;
    const stepValue = targetValue / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentValue = Math.min(stepValue * currentStep, targetValue);
      this.animatedValues.set(index, Math.floor(currentValue));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);
  }

  // Component methods
  getAnimatedValue(originalValue: string | number, index: number): string {
    const animated = this.animatedValues.get(index) || 0;
    return animated.toLocaleString('pt-BR');
  }

  getValueSuffix(value: string | number): string {
    const numValue = parseInt(value.toString());
    if (numValue >= 1000000) return 'M';
    if (numValue >= 1000) return 'K';
    return '';
  }

  getProgressPercentage(stat: Estatistica): number {
    // Calculate progress based on stat goals or historical data
    return Math.random() * 100; // Placeholder
  }

  generateSparklinePath(stat: Estatistica): string {
    // Generate SVG path for mini chart
    const points = Array.from({ length: 10 }, () => Math.random() * 15 + 2);
    return points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${index * 6} ${20 - point}`
    ).join(' ');
  }

  getStatDescription(stat: Estatistica): string {
    const descriptions: Record<string, string> = {
      'parceiros': 'Número total de parceiros ativos no sistema',
      'documentos': 'Documentos processados no período atual',
      'usuarios': 'Usuários cadastrados e ativos na plataforma'
    };
    return descriptions[stat.id] || 'Métrica do sistema de onboarding';
  }

  formatLastUpdate(): string {
    const now = new Date();
    const diff = now.getTime() - this.lastUpdate().getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes === 0) return 'agora';
    if (minutes === 1) return 'há 1 minuto';
    return `há ${minutes} minutos`;
  }

  getLastActivityTime(): string {
    const activities = this.atividadesRecentes();
    if (activities.length === 0) return 'nunca';
    
    const lastActivity = activities[0];
    return this.formatRelativeTime(lastActivity.data);
  }

  // Event handlers
  onStatHover(stat: Estatistica) {
    this.hoveredStat.set(stat);
  }

  onStatLeave() {
    this.hoveredStat.set(null);
  }

  toggleActivityFilter() {
    this.showActivityFilter.update(show => !show);
  }

  setActivityFilter(filterId: string) {
    this.activeActivityFilter.set(filterId);
  }

  resetActivityFilter() {
    this.activeActivityFilter.set('todos');
    this.showActivityFilter.set(false);
  }

  onActivityClick(activity: AtividadeRecente) {
    // Handle activity click
    console.log('Activity clicked:', activity);
  }

  hasMoreActivities(): boolean {
    return this.atividadesRecentes().length > 5;
  }

  loadMoreActivities() {
    // Load more activities logic
  }

  // Utility methods
  formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)}h`;
    return `há ${Math.floor(diffInSeconds / 86400)}d`;
  }

  getStatCardClass(tipo: string): string {
    return `stat-${tipo}`;
  }

  getTrendClass(tendencia: string): string {
    const classMap: Record<string, string> = {
      'up': 'trend-up',
      'down': 'trend-down',
      'stable': 'trend-stable'
    };
    return classMap[tendencia] || 'trend-stable';
  }

  getTrendIcon(tendencia: string): string {
    const iconMap: Record<string, string> = {
      'up': 'pi-arrow-up',
      'down': 'pi-arrow-down',
      'stable': 'pi-minus'
    };
    return iconMap[tendencia] || 'pi-minus';
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.showNotificationMessage('error', 'Erro', message);
  }

  private showNotificationMessage(type: string, title: string, message: string) {
    this.notificationType.set(type);
    this.notificationTitle.set(title);
    this.notificationMessage.set(message);
    this.showNotification.set(true);

    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  hideNotification() {
    this.showNotification.set(false);
  }

  getNotificationIcon(): string {
    const iconMap: Record<string, string> = {
      'success': 'pi-check-circle',
      'error': 'pi-exclamation-triangle',
      'warning': 'pi-exclamation-circle',
      'info': 'pi-info-circle'
    };
    return iconMap[this.notificationType()] || 'pi-info-circle';
  }
}
