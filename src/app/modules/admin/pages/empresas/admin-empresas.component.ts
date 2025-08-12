import { Component, OnInit, signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Components
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';

// Shared Components
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { StatusTagComponent } from '../../../../shared/components/status-tag/status-tag.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { LayoutComponent } from '../../../../shared/layout/layout.component';

// Models and Services
import { Parceiro, ParceiroStatus, RespostaPaginada } from '../../../../shared/models';
import { ParceiroService } from '../../../../shared/services';

@Component({
  selector: 'app-admin-empresas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    PaginatorModule,
    ToastModule,
    MenuModule,
    SearchInputComponent,
    PaginationComponent,
    StatusTagComponent,
    LoadingComponent,
    LayoutComponent
  ],
  providers: [MessageService],
  templateUrl: './admin-empresas.component.html',
  styleUrl: './admin-empresas.component.css'
})
export class AdminEmpresasComponent implements OnInit {
  @ViewChild('menu') menu!: Menu;

  private readonly router = inject(Router);
  private readonly parceiroService = inject(ParceiroService);
  private readonly messageService = inject(MessageService);

  // Signals para estado reativo
  protected readonly pesquisaParceiros = signal('');
  protected readonly parceiros = signal<Parceiro[]>([]);
  protected readonly loading = signal(false);
  protected readonly paginaAtual = signal(1);
  protected readonly itensPorPagina = signal(15);
  protected readonly totalItems = signal(0);

  ngOnInit(): void {
    this.loadParceiros();
  }

  onSearch(searchTerm: string): void {
    this.pesquisaParceiros.set(searchTerm);
    this.paginaAtual.set(1);
    this.loadParceiros();
  }

  loadParceiros(): void {
    this.loading.set(true);

    this.parceiroService.getParceiros(
      this.paginaAtual(),
      this.itensPorPagina(),
      this.pesquisaParceiros()
    ).subscribe({
      next: (response: RespostaPaginada<Parceiro>) => {
        this.parceiros.set(response?.data || []);
        this.totalItems.set(response?.pagination?.total || 0);
        this.loading.set(false);
      },
      error: (error) => {
        this.showErrorMessage('Erro ao carregar parceiros');
        this.loading.set(false);
      }
    });
  }

  toggleMenu(event: Event, parceiro: Parceiro): void {
    this.menu.toggle(event);
  }

  getMenuItems(parceiro: Parceiro): MenuItem[] {
    return [
      {
        label: 'Editar Parceiro',
        icon: 'pi pi-pencil',
        command: () => this.acaoParceiro(parceiro, 'editar')
      },
      {
        label: 'Ver Usu��rios',
        icon: 'pi pi-users',
        command: () => this.acaoParceiro(parceiro, 'usuarios')
      },
      {
        label: 'Adicionar Usuário',
        icon: 'pi pi-user-plus',
        command: () => this.acaoParceiro(parceiro, 'adicionar-usuario')
      },
      { separator: true },
      {
        label: parceiro.status === 'Ativa' ? 'Desativar' : 'Ativar',
        icon: parceiro.status === 'Ativa' ? 'pi pi-eye-slash' : 'pi pi-eye',
        command: () => this.acaoParceiro(parceiro, 'toggle-status')
      },
      {
        label: 'Excluir',
        icon: 'pi pi-trash',
        styleClass: 'menu-item-danger',
        command: () => this.acaoParceiro(parceiro, 'excluir')
      }
    ];
  }

  novoParceiro(): void {
    this.router.navigate(['/admin/empresas/novo']);
  }

  novoUsuario(): void {
    this.router.navigate(['/admin/usuarios/novo']);
  }

  acaoParceiro(parceiro: Parceiro, acao: string): void {
    switch (acao) {
      case 'editar':
        this.router.navigate(['/admin/empresas', parceiro.id, 'editar']);
        break;
      case 'excluir':
        this.excluirParceiro(parceiro);
        break;
      case 'usuarios':
        this.router.navigate(['/admin/empresas', parceiro.id, 'usuarios']);
        break;
      case 'adicionar-usuario':
        this.router.navigate(['/admin/empresas', parceiro.id, 'usuarios', 'novo']);
        break;
      case 'toggle-status':
        this.toggleStatus(parceiro);
        break;
    }
  }

  private excluirParceiro(parceiro: Parceiro): void {
    const confirmacao = confirm(`Tem certeza que deseja excluir o parceiro "${parceiro.nome}"?`);
    if (confirmacao) {
      this.parceiroService.deleteParceiro(parceiro.id).subscribe({
        next: () => {
          this.showSuccessMessage(`Parceiro "${parceiro.nome}" excluído com sucesso`);
          this.loadParceiros();
        },
        error: () => {
          this.showErrorMessage('Erro ao excluir parceiro');
        }
      });
    }
  }

  private toggleStatus(parceiro: Parceiro): void {
    this.parceiroService.toggleStatus(parceiro.id).subscribe({
      next: (parceiroAtualizado) => {
        const novoStatus = parceiroAtualizado.status;
        this.showSuccessMessage(
          `Parceiro "${parceiro.nome}" ${novoStatus === 'Ativa' ? 'ativado' : 'desativado'} com sucesso`
        );
        this.loadParceiros();
      },
      error: () => {
        this.showErrorMessage('Erro ao alterar status do parceiro');
      }
    });
  }

  onPageChange(page: number): void {
    this.paginaAtual.set(page);
    this.loadParceiros();
  }

  private showSuccessMessage(detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail
    });
  }

  private showErrorMessage(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail
    });
  }
}
