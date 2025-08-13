import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Layout component
import { LayoutComponent } from '../../../../compartilhado/layout/layout.component';

// Dashboard components (components actually used in template)
// Import only components that are used in the template

// Shared Components
import { CarregandoComponent, ApiStatusComponent } from '../../../../compartilhado/componentes';

// Models and Services
import {
  Estatistica,
  AtividadeRecente,
  DocumentoPendente,
  StatusIntegracao,
  AcessoRapido
} from '../../../../compartilhado/modelos';
import { PainelService, ErrorHandlingService, ApiHealthService, AutenticacaoService, DateUtilsService } from '../../../../compartilhado/servicos';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-painel-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LayoutComponent,
    CarregandoComponent,
    ApiStatusComponent
  ],
  templateUrl: './painel-admin.component.html',
  styleUrl: './painel-admin.component.css'
})
export class PainelAdminComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly painelService = inject(PainelService);
  private readonly errorHandler = inject(ErrorHandlingService);
  private readonly apiHealth = inject(ApiHealthService);
  private readonly authService = inject(AutenticacaoService);
  private readonly dateUtils = inject(DateUtilsService);

  // Signals para estado reativo
  protected readonly estatisticas = signal<Estatistica[]>([]);
  protected readonly atividadesRecentes = signal<AtividadeRecente[]>([]);
  protected readonly statusIntegracao = signal<StatusIntegracao[]>([]);
  protected readonly documentosPendentes = signal<DocumentoPendente[]>([]);
  protected readonly loading = signal(false);
  protected readonly acessoRapido = signal<AcessoRapido[]>([]);
  protected readonly lastUpdate = signal<Date>(new Date());
  protected readonly refreshing = signal(false);
  protected readonly apiConnected = signal(true);
  protected readonly apiError = signal<any>(null);

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadAcessoRapido();

    // Monitorar status da API automaticamente
    this.apiHealth.healthStatus$.subscribe(status => {
      this.apiConnected.set(status.isOnline);
      if (!status.isOnline) {
        this.apiError.set(status.error);
      }
    });
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.apiConnected.set(true);
    this.apiError.set(null);

    // Carregar estatísticas
    this.painelService.getEstatisticas().subscribe({
      next: (data) => {
        this.estatisticas.set(data);
      },
      error: (error) => {
        this.handleApiError(error);
        console.error('Erro ao carregar estatísticas:', error);
      }
    });

    // Carregar atividades recentes
    this.painelService.getAtividadesRecentes().subscribe({
      next: (data) => {
        console.log('📊 Dados de atividades recebidos:', data);

        // Verificar se data é um array
        const atividades = Array.isArray(data) ? data : [];

        // Normalizar dados das atividades para garantir compatibilidade
        const atividadesNormalizadas = atividades.map((atividade: any, index: number) => {
          console.log(`🔄 Processando atividade ${index}:`, atividade);

          // Mapear ícones que não existem no PrimeNG para ícones válidos
          const iconeApi = atividade.icon || atividade.icone || 'pi pi-info-circle';
          const iconeValido = this.mapearIconeParaValido(iconeApi);

          console.log(`🎨 Ícone para atividade ${index} (${atividade.tipo}):`, {
            api: iconeApi,
            valido: iconeValido,
            mapeado: iconeApi !== iconeValido,
            tipo: atividade.tipo
          });

          const normalizada = {
            // IDs e campos básicos
            id: atividade.id || index,
            descricao: atividade.descricao || 'Atividade sem descrição',
            usuario: atividade.usuario || 'Usuário desconhecido',
            cor: atividade.cor || '#6b7280',

            // Usar ícones válidos mapeados
            icon: iconeValido,
            icone: iconeValido,

            // Normalizar timestamps
            timestamp: atividade.timestamp || atividade.data,
            data: atividade.timestamp || atividade.data,

            // Normalizar título
            titulo: atividade.titulo || this.getTitleFromType(atividade.tipo) || atividade.tipo || 'Atividade',
            tipo: atividade.tipo || 'sistema'
          };

          console.log(`✅ Atividade ${index} normalizada:`, normalizada);
          return normalizada;
        });

        console.log('🎯 Total de atividades normalizadas:', atividadesNormalizadas.length);
        this.atividadesRecentes.set(atividadesNormalizadas);
      },
      error: (error) => {
        this.handleApiError(error);
        console.error('❌ Erro ao carregar atividades:', error);
      }
    });

    // Carregar documentos pendentes
    this.painelService.getDocumentosPendentes().subscribe({
      next: (data) => {
        this.documentosPendentes.set(data);
      },
      error: (error) => {
        this.handleApiError(error);
        console.error('Erro ao carregar documentos pendentes:', error);
      }
    });

    // Carregar status de integração
    this.painelService.getStatusIntegracao().subscribe({
      next: (data) => {
        this.statusIntegracao.set(data ? [data] : []);
      },
      error: (error) => {
        this.handleApiError(error);
        console.error('Erro ao carregar status de integração:', error);
      }
    });

    this.loading.set(false);
    this.lastUpdate.set(new Date());
  }

  private handleApiError(error: any): void {
    if (error.status === 0) {
      this.apiConnected.set(false);
      this.apiError.set(error);
    }
  }

  /**
   * Navegar para página de todos os documentos
   */
  verTodosDocumentos(): void {
    this.router.navigate(['/documentos']);
  }

  /**
   * Carregar dados de acesso rápido baseado no usuário logado
   */
  private loadAcessoRapido(): void {
    const user = this.authService.getUsuarioAtual();
    const acessoRapidoData: AcessoRapido[] = [];

    if (user?.papel === 'admin' || user?.papel === 'admin_parceiro') {
      acessoRapidoData.push(
        {
          id: '1',
          titulo: 'Novo Parceiro',
          descricao: 'Cadastrar novo parceiro no sistema',
          icone: 'plus-circle',
          cor: '#3b82f6',
          rota: '/parceiros/novo',
          ativo: true
        },
        {
          id: '2',
          titulo: 'Gerenciar Usuários',
          descricao: 'Administrar usuários do sistema',
          icone: 'users',
          cor: '#10b981',
          rota: '/usuarios',
          ativo: true
        }
      );
    }

    // Acesso comum para todos os usuários autenticados
    acessoRapidoData.push({
      id: '3',
      titulo: 'Documentos',
      descricao: 'Gerenciar documentos do sistema',
      icone: 'file-text',
      cor: '#f59e0b',
      rota: '/documentos',
      ativo: true
    });

    this.acessoRapido.set(acessoRapidoData);
  }

  /**
   * Ação ao clicar em card de acesso rápido
   */
  onAcessoRapidoClick(item: AcessoRapido): void {
    if (item.rota) {
      this.router.navigate([item.rota]);
    }
  }

  /**
   * Handle API errors properly
   */
  private handleError(context: string, error: any): void {
    this.errorHandler.handleError(context, error);
  }

  /**
   * Retry loading dashboard data
   */
  retryLoadData(): void {
    this.refreshing.set(true);
    setTimeout(() => {
      this.loadDashboardData();
      this.refreshing.set(false);
      this.lastUpdate.set(new Date());
    }, 1000);
  }

  getApiUrl(): string {
    return environment.apiUrl;
  }

  /**
   * Get CSS class for stat card based on type
   */
  getStatCardClass(tipo: string): string {
    switch (tipo) {
      case 'crescimento': return 'growth';
      case 'decrescimento': return 'decline';
      default: return 'neutral';
    }
  }

  /**
   * Get CSS class for trend indicator
   */
  getTrendClass(tendencia: string): string {
    switch (tendencia) {
      case 'up': return 'up';
      case 'down': return 'down';
      default: return 'stable';
    }
  }

  /**
   * Get icon for trend indicator
   */
  getTrendIcon(tendencia: string): string {
    switch (tendencia) {
      case 'up': return 'pi-arrow-up';
      case 'down': return 'pi-arrow-down';
      default: return 'pi-minus';
    }
  }

  /**
   * Format relative time - usando DateUtilsService para robustez
   */
  formatRelativeTime(dateString: string): string {
    if (!dateString) return 'Data inválida';

    try {
      // Converter formato MySQL (YYYY-MM-DD HH:mm:ss) para ISO se necessário
      let isoString = dateString;

      if (!dateString.includes('T') && dateString.includes(' ')) {
        // Formato MySQL: "2025-08-12 11:41:55"
        // Converter para ISO: "2025-08-12T11:41:55"
        isoString = dateString.replace(' ', 'T');
      }

      // Usar DateUtilsService para formatação robusta
      return this.dateUtils.formatToRelativeTime(isoString);
    } catch (error) {
      console.warn('Erro ao formatar data:', dateString, error);
      return 'Data inválida';
    }
  }

  /**
   * Get priority icon
   */
  getPriorityIcon(prioridade: string): string {
    switch (prioridade) {
      case 'alta': return 'pi-exclamation-circle';
      case 'media': return 'pi-clock';
      case 'baixa': return 'pi-check-circle';
      default: return 'pi-circle';
    }
  }

  /**
   * Get priority label
   */
  getPriorityLabel(prioridade: string): string {
    switch (prioridade) {
      case 'alta': return 'Alta';
      case 'media': return 'Média';
      case 'baixa': return 'Baixa';
      default: return 'Normal';
    }
  }

  /**
   * Math object for template access
   */
  readonly Math = Math;

  /**
   * Mapear ícones para válidos do PrimeNG
   */
  private mapearIconeParaValido(iconeOriginal: string): string {
    return this.mapearIcone(iconeOriginal);
  }

  /**
   * Mapeamento de ícones para garantir compatibilidade com PrimeNG
   */
  private mapearIcone(iconeOriginal: string): string {
    // Ícones que definitivamente existem no PrimeNG
    const iconeMap: Record<string, string> = {
      'pi pi-user-times': 'pi pi-times',       // Mudar para times simples
      'pi pi-user-plus': 'pi pi-plus',         // Mudar para plus simples
      'pi pi-user-minus': 'pi pi-minus',       // Mudar para minus simples
      'pi pi-user': 'pi pi-user',              // Manter
      'pi pi-file': 'pi pi-file',              // Manter
      'pi pi-check': 'pi pi-check',            // Manter
      'pi pi-times': 'pi pi-times',            // Manter
      'pi pi-plus': 'pi pi-plus',              // Manter
      'pi pi-minus': 'pi pi-minus',            // Manter
      'pi pi-trash': 'pi pi-trash',            // Manter
      'pi pi-delete': 'pi pi-trash',           // Mapear para trash
    };

    const iconeMapeado = iconeMap[iconeOriginal] || iconeOriginal || 'pi pi-info-circle';

    console.log(`🔧 Mapeamento de ícone:`, {
      original: iconeOriginal,
      mapeado: iconeMapeado,
      foiMapeado: iconeMapeado !== iconeOriginal
    });

    return iconeMapeado;
  }

  /**
   * Obter título baseado no tipo da atividade
   */
  private getTitleFromType(tipo: string): string {
    const titleMap: Record<string, string> = {
      'criação': 'Criação',
      'remoção': 'Remoção',
      'edição': 'Edição',
      'aprovação': 'Aprovação',
      'rejeição': 'Rejeição',
      'upload': 'Upload',
      'download': 'Download',
      'login': 'Login',
      'logout': 'Logout'
    };
    return titleMap[tipo] || tipo;
  }

  /**
   * Obter ícone correto da atividade com debug
   */
  protected getActivityIcon(atividade: any): string {
    const icon = atividade.icon || atividade.icone;
    console.log(`🔍 Debug ícone para ${atividade.tipo}:`, {
      icon: atividade.icon,
      icone: atividade.icone,
      final: icon
    });

    if (!icon) {
      console.warn('⚠️ Ícone não encontrado para atividade:', atividade);
      return 'pi pi-info-circle'; // Ícone padrão
    }
    return icon;
  }

  /**
   * Verificar se ícone é válido
   */
  protected isValidIcon(iconClass: string): boolean {
    return !!(iconClass && iconClass.includes('pi-'));
  }

  /**
   * Get formatted last update time
   */
  getLastUpdateFormatted(): string {
    return this.formatRelativeTime(this.lastUpdate().toISOString());
  }
}
