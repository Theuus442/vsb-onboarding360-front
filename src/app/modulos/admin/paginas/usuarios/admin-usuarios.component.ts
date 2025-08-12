import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
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
import { MessageService } from 'primeng/api';

// Shared Components
import { InputBuscaComponent, PaginacaoComponent, TagStatusComponent, CarregandoComponent } from '../../../../compartilhado/componentes';
import { LayoutComponent } from '../../../../compartilhado/layout/layout.component';

// Models and Services
import { Usuario, PerfilUsuario, RespostaPaginada } from '../../../../compartilhado/modelos';
import { UsuarioService } from '../../../../compartilhado/servicos';

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
    InputBuscaComponent,
    PaginacaoComponent,
    TagStatusComponent,
    CarregandoComponent,
    LayoutComponent
  ],
  providers: [MessageService],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.css'
})
export class AdminUsuariosComponent implements OnInit {

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
  protected menuAberto: string | null = null;

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
        console.error('Erro ao carregar usuários:', error);
        this.showErrorMessage('Erro ao carregar usuários');
        this.loading.set(false);
      }
    });
  }

  toggleMenu(event: Event, usuario: Usuario): void {
    event.stopPropagation();
    this.menuAberto = this.menuAberto === usuario.id ? null : usuario.id;
  }


  novoUsuario(): void {
    this.router.navigate(['/usuarios/novo']);
  }

  acaoUsuario(usuario: Usuario, acao: string): void {
    this.menuAberto = null; // Fechar menu após ação
    switch (acao) {
      case 'editar':
        this.router.navigate(['/usuarios', usuario.id, 'editar']);
        break;
      case 'excluir':
        this.excluirUsuario(usuario);
        break;
      case 'toggle-status':
        this.toggleStatus(usuario);
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.menuAberto = null;
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
