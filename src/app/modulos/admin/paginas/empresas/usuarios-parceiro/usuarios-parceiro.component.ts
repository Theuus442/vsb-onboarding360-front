import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize, forkJoin } from 'rxjs';

// PrimeNG Components
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { MessageService, ConfirmationService } from 'primeng/api';

// Shared Components
import { LayoutComponent } from '../../../../../compartilhado/layout/layout.component';
import { InputBuscaComponent } from '../../../../../compartilhado/componentes';

// Models and Services
import { Usuario, Parceiro, UsuarioResponsavel } from '../../../../../compartilhado/modelos';
import { ParceiroService, UsuarioService } from '../../../../../compartilhado/servicos';

// Types
type ViewMode = 'grid' | 'table';
type StatusSeverity = 'success' | 'info' | 'warning' | 'danger';

@Component({
  selector: 'app-usuarios-parceiro',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    InputTextModule,
    MessageModule,
    SkeletonModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule,
    MenuModule,
    LayoutComponent,
    InputBuscaComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuarios-parceiro.component.html',
  styleUrls: ['./usuarios-parceiro.component.css']
})
export class UsuariosParceiroComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly parceiroService = inject(ParceiroService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();

  // Reactive state
  readonly usuarios = signal<UsuarioResponsavel[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly parceiroId = signal<number | null>(null);
  readonly parceiro = signal<Parceiro | null>(null);
  readonly searchTerm = signal('');
  readonly viewMode = signal<ViewMode>('grid');
  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(12);
  readonly totalItems = signal(0);

  // Particles for animation
  readonly particles = Array(10).fill(0);

  // Computed properties
  readonly filteredUsuarios = computed(() => {
    const usuarios = this.usuarios();
    const search = this.searchTerm().toLowerCase();
    
    if (!search) return usuarios;
    
    return usuarios.filter(usuario =>
      usuario.nome.toLowerCase().includes(search) ||
      usuario.email.toLowerCase().includes(search) ||
      (usuario.departamento && usuario.departamento.toLowerCase().includes(search))
    );
  });

  readonly stats = computed(() => {
    const usuarios = this.usuarios();
    return {
      total: usuarios.length,
      responsaveis_principais: usuarios.filter(u => u.responsavel_principal).length,
      com_departamento: usuarios.filter(u => u.departamento).length,
      sem_departamento: usuarios.filter(u => !u.departamento).length
    };
  });

  readonly hasData = computed(() => this.usuarios().length > 0);

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const id = Number(params['id']);

      if (id && !isNaN(id)) {
        this.parceiroId.set(id);
        this.carregarDados();
      } else {
        this.showErrorMessage('ID do parceiro inválido');
        this.voltarParaParceiros();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'grid' ? 'table' : 'grid');
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  // Navigation methods
  voltarParaParceiros(): void {
    this.router.navigate(['/parceiros']);
  }

  novoUsuario(): void {
    const parceiroId = this.parceiroId();
    if (parceiroId) {
      this.router.navigate(['/admin/usuarios/novo'], {
        queryParams: { parceiroId }
      });
    }
  }


  // User actions
  definirResponsavel(usuario: UsuarioResponsavel): void {
    if (usuario.responsavel_principal) {
      this.messageService.add({
        severity: 'info',
        summary: 'Informação',
        detail: `${usuario.nome} já é o responsável principal`
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Deseja definir "${usuario.nome}" como responsável principal deste parceiro?`,
      header: 'Definir Responsável Principal',
      icon: 'pi pi-star',
      acceptButtonStyleClass: 'p-button-text p-button-info',
      rejectButtonStyleClass: 'p-button-text',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () => this.performResponsavelChange(usuario)
    });
  }

  enviarEmail(usuario: UsuarioResponsavel): void {
    const subject = encodeURIComponent('Contato via Sistema VSB Onboard360');
    const body = encodeURIComponent(`Olá ${usuario.nome},\n\nEscreva sua mensagem aqui...\n\nAtenciosamente,\nEquipe VSB Onboard360`);
    const mailtoUrl = `mailto:${usuario.email}?subject=${subject}&body=${body}`;

    window.open(mailtoUrl, '_blank');

    this.showInfoMessage(`Cliente de email aberto para ${usuario.email}`, 'Email');
  }

  recarregar(): void {
    const id = this.parceiroId();
    if (id) {
      this.carregarDados();
    }
  }

  // Utility methods
  formatarData(data: string): string {
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return data;
    }
  }

  // Private methods
  private carregarDados(): void {
    const parceiroId = this.parceiroId();

    if (!parceiroId) {
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);

    forkJoin({
      parceiro: this.parceiroService.getParceiroById(parceiroId),
      usuarios: this.parceiroService.getUsuariosParceiro(parceiroId)
    }).pipe(
      finalize(() => this.carregando.set(false)),
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ parceiro, usuarios }) => {
        this.parceiro.set(parceiro);
        this.usuarios.set(usuarios);
        this.totalItems.set(usuarios.length);
      },
      error: (error) => {
        this.handleError('Erro ao carregar dados', error);
        this.usuarios.set([]);
        this.totalItems.set(0);
      }
    });
  }

  private performResponsavelChange(usuario: UsuarioResponsavel): void {
    const parceiroId = this.parceiroId();
    if (!parceiroId) return;

    this.parceiroService.alterarResponsavelPrincipal(parceiroId, { usuario_id: usuario.id }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showSuccessMessage(`"${usuario.nome}" definido como responsável principal`);
        this.recarregar();
      },
      error: (error: any) => this.handleError('Erro ao definir responsável principal', error)
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

  private showInfoMessage(detail: string, summary: string = 'Informação'): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 4000
    });
  }
}
