import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
// Removed DropdownModule - using custom dropdown
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

// Layout component
import { LayoutComponent } from '../../../../compartilhado/layout/layout.component';
import { DropdownModernoComponent, DropdownOption } from '../../../../compartilhado/componentes';

// Models and Services
import { Parceiro, Usuario, PerfilUsuario, UsuarioCreateRequest, Documento, ChecklistItem } from '../../../../compartilhado/modelos';
import { AutenticacaoService, ParceiroDashboardService } from '../../../../compartilhado/servicos';

// Interfaces locais
interface DadosParceiroDashboard {
  parceiro: Parceiro;
  documentos: Documento[];
  checklist: ChecklistItem[];
  usuarios: Usuario[];
}

interface DadosParceiroDashboard {
  parceiro: Parceiro;
  documentos: Documento[];
  checklist: ChecklistItem[];
  usuarios: Usuario[];
}


@Component({
  selector: 'app-painel-parceiro',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LayoutComponent,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    DialogModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    DropdownModernoComponent
  ],
  providers: [MessageService],
  templateUrl: './painel-parceiro.component.html',
  styleUrl: './painel-parceiro.component.css'
})
export class PainelParceiroComponent implements OnInit {

  // Signals para estado reativo
  protected readonly dadosParceiro = signal<DadosParceiroDashboard | null>(null);
  protected readonly carregando = signal(false);
  protected readonly showUserModal = signal(false);

  // Estado do modal de usuário
  protected readonly novoUsuario = signal<UsuarioCreateRequest>({
    nome: '',
    email: '',
    senha: '',
    papel: 'parceiro',
    departamento: ''
  });

  // Opções para o dropdown de papel
  protected readonly opcoesRole = signal<DropdownOption[]>([
    { label: 'Parceiro', value: 'parceiro', icon: 'users', description: 'Usuário parceiro', color: '#6366f1' },
    { label: 'Admin Parceiro', value: 'admin_parceiro', icon: 'crown', description: 'Administrador do parceiro', color: '#ef4444' }
  ]);

  // Opções para departamento
  protected readonly opcoesDepartamento = signal<DropdownOption[]>([
    { label: 'Desenvolvimento', value: 'desenvolvimento', icon: 'desktop', description: 'Equipe de Desenvolvimento', color: '#3b82f6' },
    { label: 'Operações', value: 'operacoes', icon: 'cog', description: 'Operações e Infraestrutura', color: '#f97316' },
    { label: 'Administrativo', value: 'administrativo', icon: 'briefcase', description: 'Setor Administrativo', color: '#22c55e' }
  ]);

  private readonly authService = inject(AutenticacaoService);
  private readonly dashboardService = inject(ParceiroDashboardService);
  private readonly messageService = inject(MessageService);

  constructor() {}

  ngOnInit(): void {
    this.carregarDadosParceiro();
  }

  /**
   * Verifica se o usuário logado é admin do parceiro
   */
  get isAdminParceiro(): boolean {
    const usuarioAtual = this.authService.getUsuarioAtual();
    return usuarioAtual?.papel === 'admin_parceiro';
  }

  /**
   * Carrega todos os dados do parceiro
   */
  carregarDadosParceiro(): void {
    this.carregando.set(true);

    this.dashboardService.getDadosDashboard().subscribe({
      next: (dados) => {
        this.dadosParceiro.set(dados);
        this.carregando.set(false);
      },
      error: (error) => {
        // Tentar carregar pelo menos os dados básicos do parceiro
        this.dashboardService.getMeusDados().subscribe({
          next: (parceiro) => {
            this.dadosParceiro.set({
              parceiro,
              documentos: [],
              checklist: [],
              usuarios: []
            });
            this.carregando.set(false);
          },
          error: (erro) => {
            this.carregando.set(false);
          }
        });
      }
    });
  }

  /**
   * Abre modal para adicionar usuário
   */
  abrirModalUsuario(): void {
    this.novoUsuario.set({
      nome: '',
      email: '',
      senha: '',
      papel: 'parceiro',
      departamento: ''
    });
    this.showUserModal.set(true);
  }

  /**
   * Salva novo usuário
   */
  salvarUsuario(): void {
    const usuario = this.novoUsuario();

    // Validação básica
    if (!usuario.nome || !usuario.email || !usuario.senha || !usuario.departamento) {
      return;
    }

    // Adicionar parceiroId do parceiro logado
    const usuarioCompleto = {
      ...usuario,
      parceiroId: this.dadosParceiro()?.parceiro.id
    };

    this.dashboardService.criarUsuario(usuarioCompleto).subscribe({
      next: (novoUsuario) => {
        this.showUserModal.set(false);
        this.carregarDadosParceiro();
      },
      error: (error) => {
        // Tratar erro conforme necessário
      }
    });
  }

  /**
   * Cancela criação de usuário
   */
  cancelarUsuario(): void {
    this.showUserModal.set(false);
  }

  /**
   * Faz download de documento
   */
  downloadDocumento(documento: Documento): void {
    this.dashboardService.downloadDocumento(documento).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = documento.arquivo_nome || documento.nome;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        // Tratar erro conforme necessário
      }
    });
  }

  /**
   * Visualiza documento
   */
  visualizarDocumento(documento: Documento): void {
    const url = this.dashboardService.getUrlVisualizacao(documento);
    window.open(url, '_blank');
  }

  /**
   * Retorna a severidade da tag baseada no status
   */
  getSeverityStatus(status: string | undefined): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    if (!status) return 'secondary';

    switch (status.toLowerCase()) {
      case 'aprovado':
      case 'concluido':
      case 'ativo':
      case 'ativa':
        return 'success';
      case 'pendente':
        return 'warning';
      case 'rejeitado':
      case 'bloqueado':
      case 'inativo':
      case 'inativa':
      case 'suspenso':
        return 'danger';
      case 'em_analise':
      case 'em_andamento':
        return 'info';
      default:
        return 'secondary';
    }
  }

  /**
   * Retorna o ícone baseado no status do checklist
   */
  getChecklistIcon(status: string): string {
    switch (status) {
      case 'concluido':
        return 'pi pi-check-circle';
      case 'em_andamento':
        return 'pi pi-clock';
      case 'bloqueado':
        return 'pi pi-ban';
      default:
        return 'pi pi-circle';
    }
  }

  /**
   * Calcula o progresso do checklist
   */
  get progressoChecklist(): { total: number; concluidos: number; porcentagem: number } {
    const checklist = this.dadosParceiro()?.checklist || [];
    const total = checklist.length;
    const concluidos = checklist.filter(item => item.concluido === true).length;
    const porcentagem = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    return { total, concluidos, porcentagem };
  }

  /**
   * Formatar data de criação para exibição
   */
  formatarDataCriacao(data: string): string {
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
}
