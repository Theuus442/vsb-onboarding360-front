import { Component, signal, inject, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Layout e Componentes
import { LayoutComponent } from '../../../../../compartilhado/layout/layout.component';
import { InputBuscaComponent } from '../../../../../compartilhado/componentes/input-busca/input-busca.component';
import { CarregandoComponent } from '../../../../../compartilhado/componentes/carregando/carregando.component';
import { PaginacaoComponent } from '../../../../../compartilhado/componentes/paginacao/paginacao.component';
import { TagStatusComponent } from '../../../../../compartilhado/componentes/tag-status/tag-status.component';

// Models e Services
import { Parceiro, ParceiroStatus, RespostaPaginada } from '../../../../../compartilhado/modelos';
import { ParceiroService } from '../../../../../compartilhado/servicos';

@Component({
  selector: 'app-gerenciar-empresas',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    LayoutComponent,
    InputBuscaComponent,
    CarregandoComponent,
    PaginacaoComponent,
    TagStatusComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './gerenciar-empresas.component.html',
  styleUrls: ['./gerenciar-empresas.component.css']
})
export class GerenciarEmpresasComponent implements OnInit {
  // Injeção de dependências
  private readonly router = inject(Router);
  private readonly parceiroService = inject(ParceiroService);
  private readonly servicoMensagem = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // Signals para estado reativo
  readonly pesquisaParceiros = signal('');
  readonly parceiros = signal<Parceiro[]>([]);
  readonly carregando = signal(false);
  readonly paginaAtual = signal(1);
  readonly itensPorPagina = signal(15);
  readonly totalItens = signal(0);
  readonly menuAbertoId = signal<number | null>(null);

  // Computed properties
  readonly temParceiros = computed(() => this.parceiros().length > 0);
  readonly mostrarPaginacao = computed(() => 
    !this.carregando() && this.totalItens() > 0
  );

  // Listener para fechar menu quando clicar fora
  @HostListener('document:click', ['$event'])
  fecharMenus(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.menuAbertoId.set(null);
    }
  }

  ngOnInit(): void {
    this.carregarParceiros();
  }

  private carregarParceiros(): void {
    this.carregando.set(true);

    this.parceiroService.getParceiros(
      this.paginaAtual(),
      this.itensPorPagina(),
      this.pesquisaParceiros()
    ).subscribe({
      next: (resposta: RespostaPaginada<Parceiro>) => {
        this.parceiros.set(resposta?.data || []);
        this.totalItens.set(resposta?.pagination?.total || 0);
        this.carregando.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar parceiros:', JSON.stringify(erro, null, 2));

        // Função para extrair mensagem de erro de forma segura
        const extrairMensagemErro = (err: any): string => {
          // Se é string, retorna direto
          if (typeof err === 'string') return err;

          // Se tem propriedade message
          if (err?.message && typeof err.message === 'string') return err.message;

          // Se tem propriedade error
          if (err?.error && typeof err.error === 'string') return err.error;

          // Baseado no status code
          if (err?.statusCode === 0) return 'API não disponível. Verifique se o backend está rodando.';
          if (err?.statusCode === 404) return 'Endpoint não encontrado';
          if (err?.statusCode >= 500) return 'Erro interno do servidor';

          return '';
        };

        const extrairTituloErro = (err: any): string => {
          if (err?.statusCode === 0) return 'Erro de Conexão';
          if (err?.statusCode >= 400 && err?.statusCode < 500) return 'Erro de Requisição';
          if (err?.statusCode >= 500) return 'Erro do Servidor';
          return 'Erro';
        };

        const extrairSeveridade = (err: any): 'error' | 'warn' | 'info' => {
          if (err?.statusCode === 0) return 'error';
          if (err?.statusCode >= 500) return 'error';
          if (err?.statusCode >= 400) return 'warn';
          return 'error';
        };

        const mensagemErro = extrairMensagemErro(erro);
        const tituloErro = extrairTituloErro(erro);
        const severidade = extrairSeveridade(erro);

        this.servicoMensagem.add({
          severity: severidade,
          summary: tituloErro,
          detail: mensagemErro,
          life: 5000
        });

        // Se não conseguir carregar, inicializar com array vazio
        this.parceiros.set([]);
        this.totalItens.set(0);
        this.carregando.set(false);
      }
    });
  }

  onPesquisar(termoBusca: string): void {
    this.pesquisaParceiros.set(termoBusca);
    this.paginaAtual.set(1);
    this.carregarParceiros();
  }

  onMudarPagina(novaPagina: number): void {
    this.paginaAtual.set(novaPagina);
    this.carregarParceiros();
  }

  // Métodos para botões de ação
  toggleMenuMais(event: Event, parceiro: Parceiro): void {
    event.stopPropagation();
    const currentId = this.menuAbertoId();
    this.menuAbertoId.set(currentId === parceiro.id ? null : parceiro.id);
  }

  // Helpers para status
  isParceiroAtivo(status: ParceiroStatus): boolean {
    return ['ativo', 'Ativa'].includes(status);
  }

  getLabelStatus(status: ParceiroStatus): string {
    return this.isParceiroAtivo(status) ? 'Desativar' : 'Ativar';
  }

  getIconStatus(status: ParceiroStatus): string {
    return this.isParceiroAtivo(status) ? 'pi pi-eye-slash' : 'pi pi-eye';
  }

  // Ações do menu
  novoParceiro(): void {
    this.router.navigate(['/parceiros/novo']);
  }

  novoUsuario(): void {
    this.router.navigate(['/usuarios/novo']);
  }

  editarParceiro(parceiro: Parceiro): void {
    this.router.navigate(['/parceiros', parceiro.id, 'editar']);
  }

  verUsuarios(parceiro: Parceiro): void {
    const nomeEncoded = encodeURIComponent(parceiro.nome_fantasia || parceiro.razao_social || 'Parceiro');
    this.router.navigate(['/parceiros', parceiro.id, 'usuarios', nomeEncoded]);
  }

  adicionarUsuario(parceiro: Parceiro): void {
    this.menuAbertoId.set(null);
    this.router.navigate(['/parceiros', parceiro.id, 'usuarios', 'novo']);
  }

  alterarStatus(parceiro: Parceiro): void {
    const isAtivo = this.isParceiroAtivo(parceiro.status);
    const acao = isAtivo ? 'desativar' : 'ativar';
    
    this.confirmationService.confirm({
      message: `Tem certeza que deseja ${acao} o parceiro "${this.getNomeParceiro(parceiro)}"?`,
      header: `${acao.charAt(0).toUpperCase() + acao.slice(1)} Parceiro`,
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.parceiroService.toggleStatus(parceiro.id).subscribe({
          next: (parceiroAtualizado: Parceiro) => {
            this.servicoMensagem.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Parceiro "${this.getNomeParceiro(parceiro)}" ${isAtivo ? 'desativado' : 'ativado'} com sucesso`
            });
            this.carregarParceiros();
          },
          error: (erro) => {
            console.error('Erro ao alterar status:', JSON.stringify(erro, null, 2));
            const mensagem = erro?.message;
            this.servicoMensagem.add({
              severity: 'error',
              summary: 'Erro ao Alterar Status',
              detail: mensagem,
              life: 5000
            });
          }
        });
      }
    });
  }

  confirmarExclusao(parceiro: Parceiro): void {
    this.menuAbertoId.set(null);
    
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o parceiro "${this.getNomeParceiro(parceiro)}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.excluirParceiro(parceiro);
      }
    });
  }

  private excluirParceiro(parceiro: Parceiro): void {
    this.parceiroService.deleteParceiro(parceiro.id).subscribe({
      next: () => {
        this.servicoMensagem.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Parceiro "${this.getNomeParceiro(parceiro)}" excluído com sucesso`
        });
        this.carregarParceiros();
      },
      error: (erro) => {
        console.error('Erro ao excluir parceiro:', JSON.stringify(erro, null, 2));
        const mensagem = erro?.message;
        this.servicoMensagem.add({
          severity: 'error',
          summary: 'Erro ao Excluir',
          detail: mensagem,
          life: 5000
        });
      }
    });
  }

  // Helper para obter nome do parceiro
  getNomeParceiro(parceiro: Parceiro): string {
    return parceiro.nome_fantasia || parceiro.razao_social || 'Nome não informado';
  }
}
