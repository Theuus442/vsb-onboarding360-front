import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

// Shared Components
import { InputBuscaComponent } from '../../../../compartilhado/componentes';
import { LayoutComponent } from '../../../../compartilhado/layout/layout.component';

// Modal Email Component
import { ModalSolicitacaoDocumentosComponent } from '../../componentes/modal-solicitacao-documentos/modal-solicitacao-documentos.component';

// Models and Services
import { DocumentoAdmin, StatusDocumento, TipoDocumento, DocumentosPorParceiro, RelatorioDocumentos } from '../../../../compartilhado/modelos';
import { GestaoDocumentosDataService } from '../../componentes/gestao-documentos/gestao-documentos-data.service';

interface EmpresaDocumentacao {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone?: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  documentos: DocumentoAdmin[];
  estatisticas: {
    total: number;
    aprovados: number;
    pendentes: number;
    rejeitados: number;
    expirados: number;
    percentualCompleto: number;
  };
  ultimaAtualizacao: string;
  responsavel?: string;
}

@Component({
  selector: 'app-gestao-documentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    DialogModule,
    ProgressBarModule,
    ChipModule,
    TagModule,
    InputBuscaComponent,
    LayoutComponent,
    ModalSolicitacaoDocumentosComponent
  ],
  providers: [MessageService],
  templateUrl: './gestao-documentos.component.html',
  styleUrl: './gestao-documentos.component.css'
})
export class GestaoDocumentosComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly gestaoDocumentosService = inject(GestaoDocumentosDataService);
  private readonly messageService = inject(MessageService);

  // Signals para estado reativo
  protected readonly pesquisaEmpresas = signal('');
  protected readonly empresas = signal<EmpresaDocumentacao[]>([]);
  protected readonly loading = signal(false);
  protected readonly filtroStatus = signal<string>('todos');
  
  // Modal states
  protected readonly modalEmailVisivel = signal(false);
  protected readonly empresaSelecionada = signal<EmpresaDocumentacao | null>(null);

  // Dados originais para filtros
  private readonly relatorioCompleto = signal<RelatorioDocumentos | null>(null);

  // Filtros
  protected readonly opcoesStatus = [
    { label: 'Todas as empresas', value: 'todos' },
    { label: 'Documentação completa', value: 'completa' },
    { label: 'Pendências', value: 'pendencias' },
    { label: 'Documentos expirados', value: 'expirados' },
    { label: 'Em análise', value: 'analise' }
  ];

  // Computed properties para estatísticas
  protected readonly empresasCompletas = computed(() =>
    this.empresas().filter(e => e.estatisticas.percentualCompleto === 100).length
  );

  protected readonly empresasComPendencias = computed(() =>
    this.empresas().filter(e => e.estatisticas.pendentes > 0).length
  );

  protected readonly empresasComExpirados = computed(() =>
    this.empresas().filter(e => e.estatisticas.expirados > 0).length
  );

  ngOnInit(): void {
    this.loadEmpresas();
  }

  private loadEmpresas(): void {
    this.loading.set(true);

    this.gestaoDocumentosService.carregarRelatorioDocumentos().subscribe({
      next: (relatorio) => {
        this.relatorioCompleto.set(relatorio);
        this.aplicarFiltrosLocais(relatorio);
        this.loading.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar dados de empresas:', erro);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar dados das empresas. Tente novamente.'
        });
        this.loading.set(false);
      }
    });
  }

  private aplicarFiltrosLocais(relatorio: RelatorioDocumentos): void {
    const filtro = this.filtroStatus();
    const pesquisa = this.pesquisaEmpresas();

    // Aplicar filtros usando o serviço
    const relatorioFiltrado = this.gestaoDocumentosService.aplicarFiltros(
      relatorio,
      { status: filtro !== 'todos' ? this.mapearFiltroParaStatus(filtro) : undefined },
      pesquisa
    );

    // Converter dados do relatório para o formato da interface
    const empresasConvertidas = this.converterRelatorioParaEmpresas(relatorioFiltrado);
    this.empresas.set(empresasConvertidas);
  }

  private mapearFiltroParaStatus(filtro: string): StatusDocumento | undefined {
    switch (filtro) {
      case 'analise':
        return 'em_analise';
      case 'pendencias':
        return 'pendente';
      case 'expirados':
        return 'expirado';
      default:
        return undefined;
    }
  }

  private converterRelatorioParaEmpresas(relatorio: RelatorioDocumentos): EmpresaDocumentacao[] {
    const empresasMap = new Map<number, EmpresaDocumentacao>();

    // Processar parceiros com pendências
    relatorio.parceiros_com_pendencias.forEach(parceiroPendencia => {
      const empresa = this.criarEmpresaDoDocumentosPorParceiro(parceiroPendencia);
      empresasMap.set(empresa.id, empresa);
    });

    // Processar parceiros com expirações (merge com existentes)
    relatorio.parceiros_com_expiracoes.forEach(parceiroExpiracao => {
      const empresaExistente = empresasMap.get(parceiroExpiracao.parceiro.id);
      if (empresaExistente) {
        // Merger dados de expiração
        empresaExistente.estatisticas.expirados = parceiroExpiracao.estatisticas.expirados;
      } else {
        const empresa = this.criarEmpresaDoDocumentosPorParceiro(parceiroExpiracao);
        empresasMap.set(empresa.id, empresa);
      }
    });

    const empresasArray = Array.from(empresasMap.values());

    // Aplicar filtros específicos que não são do serviço
    return this.aplicarFiltrosEspecificos(empresasArray);
  }

  private criarEmpresaDoDocumentosPorParceiro(documentosPorParceiro: DocumentosPorParceiro): EmpresaDocumentacao {
    const { parceiro, documentos, estatisticas } = documentosPorParceiro;
    
    return {
      id: parceiro.id,
      nome: parceiro.nome,
      cnpj: parceiro.cnpj || '',
      email: parceiro.email || '',
      telefone: '',
      status: parceiro.status,
      documentos: documentos,
      estatisticas: {
        total: estatisticas.total,
        aprovados: estatisticas.aprovados,
        pendentes: estatisticas.pendentes,
        rejeitados: estatisticas.rejeitados,
        expirados: estatisticas.expirados,
        percentualCompleto: Math.round((estatisticas.aprovados / estatisticas.total) * 100) || 0
      },
      ultimaAtualizacao: this.obterUltimaAtualizacao(documentos),
      responsavel: ''
    };
  }

  private obterUltimaAtualizacao(documentos: DocumentoAdmin[]): string {
    if (documentos.length === 0) return '';
    
    const datasAtualizacao = documentos
      .map(doc => new Date(doc.updated_at || doc.created_at))
      .sort((a, b) => b.getTime() - a.getTime());
    
    return datasAtualizacao[0].toISOString().split('T')[0];
  }

  private aplicarFiltrosEspecificos(empresas: EmpresaDocumentacao[]): EmpresaDocumentacao[] {
    const filtro = this.filtroStatus();
    
    if (filtro === 'todos') {
      return empresas;
    }

    return empresas.filter(empresa => {
      switch (filtro) {
        case 'completa':
          return empresa.estatisticas.percentualCompleto === 100;
        case 'pendencias':
          return empresa.estatisticas.pendentes > 0;
        case 'expirados':
          return empresa.estatisticas.expirados > 0;
        case 'analise':
          return empresa.documentos.some(doc => doc.status === 'em_analise');
        default:
          return true;
      }
    });
  }

  onSearch(searchTerm: string): void {
    this.pesquisaEmpresas.set(searchTerm);
    
    const relatorio = this.relatorioCompleto();
    if (relatorio) {
      this.aplicarFiltrosLocais(relatorio);
    }
  }

  onStatusFilterChange(): void {
    const relatorio = this.relatorioCompleto();
    if (relatorio) {
      this.aplicarFiltrosLocais(relatorio);
    }
  }

  abrirModalEmail(empresa: EmpresaDocumentacao): void {
    this.empresaSelecionada.set(empresa);
    this.modalEmailVisivel.set(true);
  }

  fecharModalEmail(): void {
    this.modalEmailVisivel.set(false);
    this.empresaSelecionada.set(null);
  }

  onEmailEnviado(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Email enviado com sucesso!'
    });
    this.fecharModalEmail();
  }

  getStatusSeverity(status: StatusDocumento): 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case 'aprovado': return 'success';
      case 'pendente': return 'warning';
      case 'em_analise': return 'info';
      case 'rejeitado': return 'danger';
      case 'expirado': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: StatusDocumento): string {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'pendente': return 'Pendente';
      case 'em_analise': return 'Em Análise';
      case 'rejeitado': return 'Rejeitado';
      case 'expirado': return 'Expirado';
      default: return status;
    }
  }

  getTipoLabel(tipo: TipoDocumento): string {
    switch (tipo) {
      case 'cnpj': return 'CNPJ';
      case 'contrato_social': return 'Contrato Social';
      case 'certificado_digital': return 'Certificado Digital';
      case 'comprovante_endereco': return 'Comprovante de Endereço';
      case 'outros': return 'Outros';
      default: return tipo;
    }
  }

  getProgressSeverity(percentual: number): 'success' | 'info' | 'warning' | 'danger' {
    if (percentual === 100) return 'success';
    if (percentual >= 70) return 'info';
    if (percentual >= 40) return 'warning';
    return 'danger';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  limparFiltros(): void {
    this.pesquisaEmpresas.set('');
    this.filtroStatus.set('todos');
    
    const relatorio = this.relatorioCompleto();
    if (relatorio) {
      this.aplicarFiltrosLocais(relatorio);
    }
  }

  refreshData(): void {
    this.loadEmpresas();
  }
}
