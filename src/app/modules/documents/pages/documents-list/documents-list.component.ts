import { Component, signal, inject, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Layout e Componentes
import { LayoutComponent } from '../../../../shared/layout/layout.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { LoadingSpinnerComponent } from '../../../../compartilhado/componentes/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../compartilhado/componentes/status-badge/status-badge.component';
import { PaginationComponent } from '../../../../compartilhado/componentes/pagination/pagination.component';
import { DateFormatPipe } from '../../../../compartilhado/pipes/date-format.pipe';

// Componente de Upload
import { UploadModalComponent } from '../../components/upload-modal/upload-modal.component';

// Models e Services
import { RespostaPaginada, Documento, StatusDocumento, TipoDocumento } from '../../../../shared/models';
import { DocumentoService, ParceiroService } from '../../../../shared/services';
import { DateUtilsService, NotificationService } from '../../../../compartilhado/servicos';

// Constants
const STATUS_DOCUMENTO_LABELS = {
  'pendente': 'Pendente',
  'aprovado': 'Aprovado',
  'rejeitado': 'Rejeitado'
};

const TIPOS_DOCUMENTO_LABELS = {
  'cnpj': 'CNPJ',
  'contrato_social': 'Contrato Social',
  'certificado_digital': 'Certificado Digital',
  'comprovante_endereco': 'Comprovante de Endereço',
  'outros': 'Outros'
};

// Temporary interfaces - to be moved to shared models later
interface Documento {
  id: string;
  nome: string;
  tipo: string;
  status: string;
  created_at: string;
  parceiro?: string;
}

interface DocumentoFilter {
  status?: string;
  tipo?: string;
  parceiro?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    ToastModule,
    ConfirmDialogModule,
    LayoutComponent,
    SearchInputComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    PaginationComponent,
    DateFormatPipe,
    UploadModalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './documents-list.component.html',
  styleUrl: './documents-list.component.css'
})
export class DocumentsListComponent implements OnInit {
  // Injeção de dependências
  private readonly documentoService = inject(DocumentoService);
  private readonly parceiroService = inject(ParceiroService);
  private readonly servicoMensagem = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  protected readonly dateUtils = inject(DateUtilsService);
  private readonly notificationService = inject(NotificationService);

  // Signals para estado reativo
  readonly pesquisaDocumentos = signal('');
  readonly documentos = signal<Documento[]>([]);
  readonly carregando = signal(false);
  readonly paginaAtual = signal(1);
  readonly itensPorPagina = signal(15);
  readonly totalItens = signal(0);
  readonly menuAbertoId = signal<number | null>(null);

  // Modal de upload
  modalUploadVisivel = false;

  // Filtros avançados
  readonly filtrosAvancadosVisiveis = signal(false);
  filtroStatus: StatusDocumento | null = null;
  filtroTipo: TipoDocumento | null = null;
  filtroParceiro: number | null = null;
  filtroVencimento: string | null = null;

  // Computed properties
  readonly temDocumentos = computed(() => this.documentos().length > 0);
  readonly mostrarPaginacao = computed(() =>
    !this.carregando() && this.totalItens() > 0
  );

  // Opções para os filtros
  readonly opcoesStatus = Object.entries(STATUS_DOCUMENTO_LABELS).map(
    ([value, label]) => ({ label, value })
  );

  readonly opcoesTipos = Object.entries(TIPOS_DOCUMENTO_LABELS).map(
    ([value, label]) => ({ label, value })
  );

  readonly opcoesParceiros = signal<{label: string, value: number}[]>([]);

  readonly opcoesVencimento = [
    { label: 'Vencendo em 7 dias', value: 'vencendo_7' },
    { label: 'Vencendo em 30 dias', value: 'vencendo_30' },
    { label: 'Expirados', value: 'expirados' },
    { label: 'Sem vencimento', value: 'sem_vencimento' }
  ];

  // Listener para fechar menu quando clicar fora
  @HostListener('document:click', ['$event'])
  fecharMenus(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.menuAbertoId.set(null);
    }
  }

  ngOnInit(): void {
    this.carregarDocumentos();
    this.carregarParceiros();
  }

  private carregarParceiros(): void {
    this.parceiroService.getParceiros(1, 100).subscribe({
      next: (resposta) => {
        const opcoes = resposta.data.map(parceiro => ({
          label: parceiro.nome_fantasia,
          value: parceiro.id
        }));
        this.opcoesParceiros.set(opcoes);
      },
      error: (erro) => {
        console.error('Erro ao carregar parceiros para filtro:', erro);
        // Em caso de erro, manter array vazio (sem fallback)
        this.opcoesParceiros.set([]);
      }
    });
  }

  private carregarDocumentos(): void {
    this.carregando.set(true);

    const filtros: DocumentoFilter = {
      busca: this.pesquisaDocumentos() || undefined,
      status: this.filtroStatus || undefined,
      tipo: this.filtroTipo || undefined,
      parceiro_id: this.filtroParceiro || undefined
    };

    this.documentoService.getDocumentos(
      this.paginaAtual(),
      this.itensPorPagina(),
      filtros
    ).subscribe({
      next: (resposta: RespostaPaginada<Documento>) => {
        this.documentos.set(resposta?.data || []);
        this.totalItens.set(resposta?.pagination?.total || 0);
        this.carregando.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar documentos:', JSON.stringify(erro, null, 2));
        
        const mensagem = erro?.message;
        this.servicoMensagem.add({
          severity: 'error',
          summary: 'Erro',
          detail: mensagem,
          life: 5000
        });

        this.documentos.set([]);
        this.totalItens.set(0);
        this.carregando.set(false);
      }
    });
  }

  onPesquisar(termoBusca: string): void {
    this.pesquisaDocumentos.set(termoBusca);
    this.paginaAtual.set(1);
    this.carregarDocumentos();
  }

  onMudarPagina(novaPagina: number): void {
    this.paginaAtual.set(novaPagina);
    this.carregarDocumentos();
  }

  // Métodos para filtros avançados
  toggleFiltrosAvancados(): void {
    this.filtrosAvancadosVisiveis.set(!this.filtrosAvancadosVisiveis());
  }

  aplicarFiltros(): void {
    this.paginaAtual.set(1);
    this.carregarDocumentos();
  }

  limparFiltros(): void {
    this.pesquisaDocumentos.set('');
    this.filtroStatus = null;
    this.filtroTipo = null;
    this.filtroParceiro = null;
    this.filtroVencimento = null;
    this.paginaAtual.set(1);
    this.carregarDocumentos();
  }

  temFiltrosAtivos(): boolean {
    return !!(
      this.pesquisaDocumentos() ||
      this.filtroStatus ||
      this.filtroTipo ||
      this.filtroParceiro ||
      this.filtroVencimento
    );
  }

  // Métodos para menu de ações
  toggleMenuMais(event: Event, documento: Documento): void {
    event.stopPropagation();
    const currentId = this.menuAbertoId();
    this.menuAbertoId.set(currentId === documento.id ? null : documento.id);
  }

  // Modal de upload
  abrirModalUpload(): void {
    this.modalUploadVisivel = true;
  }

  onDocumentoUpload(documento: Documento): void {
    this.servicoMensagem.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Documento enviado com sucesso',
      life: 3000
    });
    this.carregarDocumentos();
  }

  // Ações de documentos
  visualizarDocumento(documento: Documento): void {
    // TODO: Implementar visualização
    this.servicoMensagem.add({
      severity: 'info',
      summary: 'Visualizar',
      detail: `Visualizar documento: ${documento.nome}`,
      life: 3000
    });
  }

  aprovarDocumento(documento: Documento): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja aprovar o documento "${documento.nome}"?`,
      header: 'Confirmar Aprovação',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Aprovar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.documentoService.aprovarDocumento(documento.id).subscribe({
          next: () => {
            this.servicoMensagem.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Documento "${documento.nome}" aprovado com sucesso`,
              life: 3000
            });
            this.carregarDocumentos();
          },
          error: (erro) => {
            console.error('Erro ao aprovar documento:', erro);
            this.servicoMensagem.add({
              severity: 'error',
              summary: 'Erro ao Aprovar',
              detail: erro?.message,
              life: 5000
            });
          }
        });
      }
    });
  }

  rejeitarDocumento(documento: Documento): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja rejeitar o documento "${documento.nome}"?`,
      header: 'Confirmar Rejeição',
      icon: 'pi pi-times-circle',
      acceptLabel: 'Rejeitar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const motivo = 'Documento rejeitado pelo administrador';
        this.documentoService.rejeitarDocumento(documento.id, motivo).subscribe({
          next: () => {
            this.servicoMensagem.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Documento "${documento.nome}" rejeitado`,
              life: 3000
            });
            this.carregarDocumentos();
          },
          error: (erro) => {
            console.error('Erro ao rejeitar documento:', erro);
            this.servicoMensagem.add({
              severity: 'error',
              summary: 'Erro ao Rejeitar',
              detail: erro?.message,
              life: 5000
            });
          }
        });
      }
    });
  }

  downloadDocumento(documento: Documento): void {
    this.menuAbertoId.set(null);
    // TODO: Implementar download real
    this.servicoMensagem.add({
      severity: 'info',
      summary: 'Download',
      detail: `Download do documento: ${documento.nome}`,
      life: 3000
    });
  }

  confirmarExclusao(documento: Documento): void {
    this.menuAbertoId.set(null);
    
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o documento "${documento.nome}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.documentoService.excluirDocumento(documento.id).subscribe({
          next: () => {
            this.servicoMensagem.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Documento "${documento.nome}" excluído com sucesso`,
              life: 3000
            });
            this.carregarDocumentos();
          },
          error: (erro) => {
            console.error('Erro ao excluir documento:', erro);
            this.servicoMensagem.add({
              severity: 'error',
              summary: 'Erro ao Excluir',
              detail: erro?.message,
              life: 5000
            });
          }
        });
      }
    });
  }

  // Helpers para template
  getTipoLabel(tipo: TipoDocumento): string {
    return TIPOS_DOCUMENTO_LABELS[tipo];
  }

  getStatusLabel(status: StatusDocumento): string {
    return STATUS_DOCUMENTO_LABELS[status];
  }

  // Adaptar status de documento para o StatusTagComponent que espera ParceiroStatus
  getStatusParaTag(status: StatusDocumento): string {
    switch (status) {
      case 'aprovado':
        return 'ativo';
      case 'rejeitado':
      case 'expirado':
        return 'inativo';
      case 'pendente':
      case 'em_analise':
        return 'suspenso';
      default:
        return 'inativo';
    }
  }

  formatarData(data: string): string {
    return this.dateUtils.formatToBrazilianDate(data);
  }

  getFileIcon(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();

    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      default:
        return 'file';
    }
  }
}
