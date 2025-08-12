import { Component, OnInit, computed, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, finalize } from 'rxjs';

// PrimeNG Components
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';

// Shared Components
import { 
  InputBuscaComponent, 
  PaginacaoComponent, 
  DropdownModernoComponent, 
  DropdownOption 
} from '../../../../compartilhado/componentes';
import { LayoutComponent } from '../../../../compartilhado/layout/layout.component';

// Models and Services
import { Parceiro, ParceiroStatus, RespostaPaginada } from '../../../../compartilhado/modelos';
import { ParceiroService, AutenticacaoService } from '../../../../compartilhado/servicos';

// Types
type ViewMode = 'grid' | 'table';
type SeverityType = 'success' | 'warning' | 'danger' | 'info';

// Constants
const DEFAULT_PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_TIME = 300;

const STATUS_OPTIONS: DropdownOption[] = [
  { 
    label: 'Todos', 
    value: 'todos', 
    icon: 'list', 
    description: 'Todos os status', 
    color: '#6b7280' 
  },
  { 
    label: 'Ativos', 
    value: 'ativa', 
    icon: 'check-circle', 
    description: 'Empresas ativas', 
    color: '#22c55e' 
  },
  { 
    label: 'Pendentes', 
    value: 'pendente', 
    icon: 'clock', 
    description: 'Aguardando aprovação', 
    color: '#f59e0b' 
  },
  { 
    label: 'Inativos', 
    value: 'inativa', 
    icon: 'times-circle', 
    description: 'Empresas inativas', 
    color: '#ef4444' 
  }
] as const;

@Component({
  selector: 'app-admin-empresas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModernoComponent,
    TagModule,
    PaginatorModule,
    ToastModule,
    MenuModule,
    DialogModule,
    ConfirmDialogModule,
    TooltipModule,
    CardModule,
    DividerModule,
    AvatarModule,
    BadgeModule,
    SkeletonModule,
    InputBuscaComponent,
    PaginacaoComponent,
    LayoutComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-empresas.component.html',
  styleUrl: './admin-empresas.component.css'
})
export class AdminEmpresasComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly parceiroService = inject(ParceiroService);
  private readonly authService = inject(AutenticacaoService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  // Reactive state with signals
  protected readonly searchTerm = signal('');
  protected readonly parceiros = signal<Parceiro[]>([]);
  protected readonly loading = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly itemsPerPage = signal(DEFAULT_PAGE_SIZE);
  protected readonly totalItems = signal(0);
  protected readonly selectedFilter = signal<string>('todos');
  protected readonly viewMode = signal<ViewMode>('grid');

  // Computed properties
  protected readonly filteredParceiros = computed(() => {
    const parceiros = this.parceiros();
    const filter = this.selectedFilter();
    
    if (filter === 'todos') return parceiros;
    return parceiros.filter(parceiro => 
      parceiro.status.toLowerCase() === filter.toLowerCase()
    );
  });

  protected readonly stats = computed(() => {
    const parceiros = this.parceiros();
    return {
      total: parceiros.length,
      ativos: parceiros.filter(p => p.status === 'Ativa').length,
      pendentes: parceiros.filter(p => p.status === 'Pendente').length,
      inativos: parceiros.filter(p => p.status === 'Inativa').length
    };
  });

  protected readonly statusOptions = STATUS_OPTIONS;

  ngOnInit(): void {
    this.initializeSearchSubscription();
    this.loadParceiros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSearchSubscription(): void {
    this.searchSubject$.pipe(
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm.set(searchTerm);
      this.currentPage.set(1);
      this.loadParceiros();
    });
  }

  onSearch(searchTerm: string): void {
    this.searchSubject$.next(searchTerm);
  }

  onFilterChange(filter: string): void {
    this.selectedFilter.set(filter);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadParceiros();
  }

  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'grid' ? 'table' : 'grid');
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.selectedFilter.set('todos');
    this.currentPage.set(1);
    this.searchSubject$.next('');
  }

  // Navigation methods
  novoParceiro(): void {
    this.router.navigate(['/parceiros/novo']);
  }

  editarParceiro(parceiro: Parceiro): void {
    console.log('Navegando para editar parceiro:', parceiro.id);
    const url = ['/parceiros', parceiro.id, 'editar'];
    console.log('URL:', url);
    this.router.navigate(url);
  }

  verUsuarios(parceiro: Parceiro): void {
    const nomeEncoded = encodeURIComponent(parceiro.nome_fantasia || parceiro.nome || 'usuario');
    const url = ['/parceiros', parceiro.id, 'usuarios', nomeEncoded];
    this.router.navigate(url);
  }

  adicionarUsuario(parceiro: Parceiro): void {
    console.log('Navegando para adicionar usuário:', parceiro.id);
    const url = ['/usuarios/novo'];
    console.log('URL:', url, 'QueryParams:', { parceiro_id: parceiro.id });
    this.router.navigate(url, { queryParams: { parceiro_id: parceiro.id } });
  }

  // CRUD operations

  // Helper methods para verificação de status
  isParceiroAtivo(parceiro: Parceiro): boolean {
    return ['Ativa', 'ativo'].includes(parceiro.status);
  }

  getStatusAction(parceiro: Parceiro): string {
    return this.isParceiroAtivo(parceiro) ? 'desativar' : 'ativar';
  }

  getStatusIcon(parceiro: Parceiro): string {
    return this.isParceiroAtivo(parceiro) ? 'pi-ban' : 'pi-check';
  }

  getStatusTooltip(parceiro: Parceiro): string {
    const action = this.getStatusAction(parceiro);
    return `${action.charAt(0).toUpperCase() + action.slice(1)} parceiro`;
  }

  toggleStatus(parceiro: Parceiro): void {
    const action = this.getStatusAction(parceiro);

    this.confirmationService.confirm({
      message: `Tem certeza que deseja ${action} o parceiro "${parceiro.nome_fantasia || parceiro.nome}"?`,
      header: `Confirmar ${action.charAt(0).toUpperCase() + action.slice(1)}ação`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: `Sim, ${action}`,
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: this.isParceiroAtivo(parceiro) ? 'p-button-warning' : 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.parceiroService.toggleStatus(parceiro.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (parceiroAtualizado) => {
              const acao = this.isParceiroAtivo(parceiroAtualizado) ? 'ativado' : 'desativado';
              this.showSuccessMessage(
                `Parceiro "${parceiro.nome_fantasia || parceiro.nome}" ${acao} com sucesso`
              );
              this.loadParceiros();
            },
            error: (error) => this.handleError('Erro ao alterar status do parceiro', error)
          });
      }
    });
  }

  // Utility methods
  getStatusSeverity(status: string): SeverityType {
    const statusMap: Record<string, SeverityType> = {
      'ativa': 'success',
      'pendente': 'warning',
      'inativa': 'danger'
    };
    return statusMap[status.toLowerCase()] || 'info';
  }


  // Private methods
  private loadParceiros(): void {
    if (this.loading()) return;

    this.loading.set(true);

    this.parceiroService.getParceiros(
      this.currentPage(),
      this.itemsPerPage(),
      this.searchTerm()
    ).pipe(
      finalize(() => this.loading.set(false)),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: RespostaPaginada<Parceiro>) => {
        this.parceiros.set(response.data || []);
        this.totalItems.set(response.pagination?.total || 0);
      },
      error: (error) => {
        this.handleError('Erro ao carregar parceiros', error);
        this.parceiros.set([]);
        this.totalItems.set(0);
      }
    });
  }


  private handleError(summary: string, error: any): void {
    const detail = error?.message || error?.error?.message || 'Erro interno do servidor';
    this.showErrorMessage(detail, summary);
    console.error(summary, error);
  }

  private showSuccessMessage(detail: string, summary: string = 'Sucesso'): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 5000
    });
  }

  private showErrorMessage(detail: string, summary: string = 'Erro'): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 7000
    });
  }
}
