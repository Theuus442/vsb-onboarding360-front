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
import { Usuario, PerfilUsuario, RespostaPaginada } from '../../../../shared/models';
import { UsuarioService } from '../../../../shared/services';

@Component({
  selector: 'app-admin-usuarios',
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
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.css'
})
export class AdminUsuariosComponent implements OnInit {
  @ViewChild('menu') menu!: Menu;

  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);
  private readonly messageService = inject(MessageService);

  // Signals para estado reativo
  protected readonly pesquisaUsuarios = signal('');
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly loading = signal(false);
  protected readonly paginaAtual = signal(1);
  protected readonly itensPorPagina = signal(15);
  protected readonly totalItems = signal(0);

  ngOnInit(): void {
    this.loadUsuarios();
  }

  onSearch(searchTerm: string): void {
    this.pesquisaUsuarios.set(searchTerm);
    this.paginaAtual.set(1);
    this.loadUsuarios();
  }

  private loadUsuarios(): void {
    this.loading.set(true);

    this.usuarioService.getUsuarios(
      this.paginaAtual(),
      this.itensPorPagina(),
      this.pesquisaUsuarios()
    ).subscribe({
      next: (response: RespostaPaginada<Usuario>) => {
        this.usuarios.set(response?.data || []);
        this.totalItems.set(response?.pagination?.total || 0);
        this.loading.set(false);
      },
      error: (error) => {
        this.showErrorMessage('Erro ao carregar usuários');
        this.loading.set(false);
      }
    });
  }

  toggleMenu(event: Event, usuario: Usuario): void {
    this.menu.toggle(event);
  }

  getMenuItems(usuario: Usuario): MenuItem[] {
    return [
      {
        label: 'Editar Usuário',
        icon: 'pi pi-pencil',
        command: () => this.acaoUsuario(usuario, 'editar')
      },
      { separator: true },
      {
        label: usuario.status === 'ativo' ? 'Desativar' : 'Ativar',
        icon: usuario.status === 'ativo' ? 'pi pi-eye-slash' : 'pi pi-eye',
        command: () => this.acaoUsuario(usuario, 'toggle-status')
      },
      {
        label: 'Excluir',
        icon: 'pi pi-trash',
        styleClass: 'menu-item-danger',
        command: () => this.acaoUsuario(usuario, 'excluir')
      }
    ];
  }

  novoUsuario(): void {
    this.router.navigate(['/admin/usuarios/novo']);
  }

  acaoUsuario(usuario: Usuario, acao: string): void {
    switch (acao) {
      case 'editar':
        this.router.navigate(['/admin/usuarios', usuario.id, 'editar']);
        break;
      case 'excluir':
        this.excluirUsuario(usuario);
        break;
      case 'toggle-status':
        this.toggleStatus(usuario);
        break;
    }
  }

  private excluirUsuario(usuario: Usuario): void {
    const confirmacao = confirm(`Tem certeza que deseja excluir o usuário "${usuario.nome}"?`);
    if (confirmacao) {
      this.usuarioService.deleteUsuario(usuario.id).subscribe({
        next: () => {
          this.showSuccessMessage(`Usuário "${usuario.nome}" excluído com sucesso`);
          this.loadUsuarios();
        },
        error: () => {
          this.showErrorMessage('Erro ao excluir usuário');
        }
      });
    }
  }

  private toggleStatus(usuario: Usuario): void {
    this.usuarioService.toggleStatusUsuario(usuario.id).subscribe({
      next: (usuarioAtualizado) => {
        const novoStatus = usuarioAtualizado.status;
        this.showSuccessMessage(
          `Usuário "${usuario.nome}" ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso`
        );
        this.loadUsuarios();
      },
      error: () => {
        this.showErrorMessage('Erro ao alterar status do usuário');
      }
    });
  }

  onPageChange(page: number): void {
    this.paginaAtual.set(page);
    this.loadUsuarios();
  }

  getRoleLabel(papel: PerfilUsuario): string {
    const roleLabels: Record<PerfilUsuario, string> = {
      'admin': 'Administrador',
      'parceiro': 'Parceiro',
      'admin_parceiro': 'Admin Parceiro',
      'interno': 'Interno'
    };
    return roleLabels[papel] || papel;
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
