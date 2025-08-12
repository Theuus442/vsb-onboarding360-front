import { Component, OnInit, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

// Layout component
import { LayoutComponent } from '../../../../shared/layout/layout.component';

// Services and Models
import { AuthService } from '../../../../shared/services/auth.service';
import { ParceiroDashboardService } from '../../../../shared/services/parceiro-dashboard.service';
import {
  DadosParceiroDashboard,
  PerfilUsuarioParceiro,
  DadosEmpresaParceira,
  DocumentoParceiro,
  UsuarioVinculadoParceiro,
  UsuarioVinculadoCreateRequest,
  DocumentoUploadRequest,
  ChecklistItemParceiro,
  StatusDocumento
} from '../../../../shared/models/parceiro-dashboard.model';

// Types para dropdowns
interface DropdownOption {
  label: string;
  value: string;
}

// Interface para documentos necessários
interface DocumentoNecessario {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  icon: string;
  obrigatorio: boolean;
  documentoEnviado?: DocumentoParceiro;
  exemplo?: string;
}

// Interface para documento com status computado
interface DocumentoComStatus extends DocumentoNecessario {
  status: string;
}

@Component({
  selector: 'app-partner-dashboard',
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
    DropdownModule,
    FileUploadModule,
    ToastModule,
    ProgressBarModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './partner-dashboard.component.html',
  styleUrl: './partner-dashboard.component.css'
})
export class PartnerDashboardComponent implements OnInit {
  // Injeção de dependências
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(ParceiroDashboardService);
  private readonly messageService = inject(MessageService);

  // Estado principal usando signals
  protected readonly dadosParceiro = signal<DadosParceiroDashboard | null>(null);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly ultimaAtualizacao = signal<Date | null>(null);

  // Estado dos modais
  protected readonly showUserModal = signal(false);
  protected readonly showUploadModal = signal(false);

  // Estado do formulário de usuário
  protected readonly novoUsuario = signal<UsuarioVinculadoCreateRequest>({
    nome: '',
    email: '',
    senha: '',
    papel: 'parceiro',
    departamento: ''
  });

  // Estado do upload de documento
  protected readonly arquivoSelecionado = signal<File | null>(null);
  protected readonly nomeDocumento = signal('');
  protected readonly uploadandoDocumento = signal(false);

  // Estado dos filtros
  protected readonly filtroDocumento = signal<'todos' | 'obrigatorios' | 'enviados' | 'pendentes'>('todos');

  // Opções para dropdowns
  protected readonly opcoesRole = signal<DropdownOption[]>([
    { label: 'Parceiro', value: 'parceiro' },
    { label: 'Admin Parceiro', value: 'admin_parceiro' }
  ]);

  protected readonly opcoesDepartamento = signal<DropdownOption[]>([
    { label: 'Desenvolvimento', value: 'desenvolvimento' },
    { label: 'Operações', value: 'operacoes' },
    { label: 'Administrativo', value: 'administrativo' },
    { label: 'Comercial', value: 'comercial' },
    { label: 'Financeiro', value: 'financeiro' }
  ]);

  // Lista de documentos necessários
  protected readonly documentosNecessarios = signal<DocumentoNecessario[]>([
    {
      id: 'contrato_social',
      titulo: 'Contrato Social',
      descricao: 'Documento que estabelece a constituição da empresa',
      tipo: 'contrato_social',
      icon: 'pi pi-file-edit',
      obrigatorio: true,
      exemplo: 'contrato-social-atualizado.pdf'
    },
    {
      id: 'inscricao_estadual',
      titulo: 'Inscrição Estadual',
      descricao: 'Documento de registro estadual para operações',
      tipo: 'inscricao_estadual',
      icon: 'pi pi-bookmark',
      obrigatorio: true,
      exemplo: 'inscricao-estadual.pdf'
    },
    {
      id: 'cartao_cnpj',
      titulo: 'Cartão CNPJ',
      descricao: 'Comprovante de inscrição no CNPJ',
      tipo: 'cartao_cnpj',
      icon: 'pi pi-id-card',
      obrigatorio: true,
      exemplo: 'cartao-cnpj.pdf'
    },
    {
      id: 'certidao_regularidade_fgts',
      titulo: 'Certidão de Regularidade do FGTS',
      descricao: 'Comprovante de regularidade com o FGTS',
      tipo: 'certidao_fgts',
      icon: 'pi pi-verified',
      obrigatorio: true,
      exemplo: 'certidao-fgts.pdf'
    },
    {
      id: 'certidao_regularidade_inss',
      titulo: 'Certidão de Regularidade do INSS',
      descricao: 'Comprovante de regularidade previdenciária',
      tipo: 'certidao_inss',
      icon: 'pi pi-shield',
      obrigatorio: true,
      exemplo: 'certidao-inss.pdf'
    },
    {
      id: 'certidao_negativa_debitos',
      titulo: 'Certidão Negativa de Débitos',
      descricao: 'Comprovante de ausência de débitos municipais',
      tipo: 'certidao_negativa',
      icon: 'pi pi-check-circle',
      obrigatorio: false,
      exemplo: 'certidao-negativa.pdf'
    },
    {
      id: 'alvara_funcionamento',
      titulo: 'Alvará de Funcionamento',
      descricao: 'Licença municipal para funcionamento da empresa',
      tipo: 'alvara',
      icon: 'pi pi-building',
      obrigatorio: false,
      exemplo: 'alvara-funcionamento.pdf'
    },
    {
      id: 'procuracao',
      titulo: 'Procuração (se aplicável)',
      descricao: 'Documento de representação legal, se necessário',
      tipo: 'procuracao',
      icon: 'pi pi-users',
      obrigatorio: false,
      exemplo: 'procuracao.pdf'
    }
  ]);

  // Computed properties para dados derivados
  protected readonly isAdminParceiro = computed(() => {
    const usuario = this.authService.getCurrentUser();
    return usuario?.papel === 'admin_parceiro';
  });

  protected readonly progressoChecklist = computed(() => {
    const checklist = this.dadosParceiro()?.checklist || [];
    const total = checklist.length;
    const concluidos = checklist.filter(item => item.status === 'concluido').length;
    const porcentagem = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    return { total, concluidos, porcentagem };
  });

  protected readonly estatisticas = computed(() => {
    const dados = this.dadosParceiro();
    if (!dados) return null;

    return {
      totalDocumentos: dados.documentos.length,
      documentosAprovados: dados.documentos.filter(d => d.status === 'aprovado').length,
      documentosPendentes: dados.documentos.filter(d => d.status === 'pendente').length,
      documentosRejeitados: dados.documentos.filter(d => d.status === 'rejeitado').length,
      totalUsuarios: dados.usuarios.length,
      usuariosAtivos: dados.usuarios.filter(u => u.status === 'ativo').length
    };
  });

  // Computed para documentos necessários com status
  protected readonly documentosComStatus = computed(() => {
    const documentosEnviados = this.dadosParceiro()?.documentos || [];
    const documentosNecessarios = this.documentosNecessarios();

    return documentosNecessarios.map(docNecessario => {
      const documentoEnviado = documentosEnviados.find(doc =>
        doc.tipo === docNecessario.tipo ||
        doc.nome.toLowerCase().includes(docNecessario.tipo.replace('_', ' '))
      );

      return {
        ...docNecessario,
        documentoEnviado,
        status: this.getStatusDocumentoNecessario(docNecessario, documentoEnviado)
      };
    });
  });

  protected readonly estatisticasDocumentos = computed(() => {
    const docs = this.documentosComStatus();
    const obrigatorios = docs.filter(d => d.obrigatorio);
    const obrigatoriosCompletos = obrigatorios.filter(d => d.documentoEnviado);

    return {
      totalObrigatorios: obrigatorios.length,
      obrigatoriosCompletos: obrigatoriosCompletos.length,
      porcentagemCompleta: obrigatorios.length > 0 ? Math.round((obrigatoriosCompletos.length / obrigatorios.length) * 100) : 0,
      totalEnviados: docs.filter(d => d.documentoEnviado).length,
      totalNecessarios: docs.length
    };
  });

  // Computed para documentos filtrados
  protected readonly documentosFiltrados = computed(() => {
    const docs = this.documentosComStatus();
    const filtro = this.filtroDocumento();

    switch (filtro) {
      case 'obrigatorios':
        return docs.filter(d => d.obrigatorio);
      case 'enviados':
        return docs.filter(d => d.documentoEnviado);
      case 'pendentes':
        return docs.filter(d => !d.documentoEnviado && d.obrigatorio);
      default:
        return docs;
    }
  });

  // Effect para reações automáticas
  constructor() {
    // Effect para mostrar notificações baseadas no estado de erro
    effect(() => {
      const erro = this.erro();
      if (erro) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: erro,
          life: 5000
        });
      }
    });
  }

  ngOnInit(): void {
    this.carregarDadosParceiro();
  }

  /**
   * Carrega todos os dados do painel do parceiro
   */
  async carregarDadosParceiro(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const dados = await this.dashboardService.getDadosDashboard().toPromise();
      this.dadosParceiro.set(dados || null);
      this.ultimaAtualizacao.set(new Date());

      // Só mostrar sucesso se for um reload manual
      if (!this.dadosParceiro()) {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Dados carregados com sucesso',
          life: 3000
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados do parceiro:', error);
      const mensagemErro = this.obterMensagemErro(error);
      this.erro.set(mensagemErro);

      // Auto-retry após 5 segundos em caso de erro de rede
      if (this.isNetworkError(error)) {
        setTimeout(() => {
          this.carregarDadosParceiro();
        }, 5000);
      }
    } finally {
      this.carregando.set(false);
    }
  }

  /**
   * Obtém mensagem de erro amigável baseada no tipo de erro
   */
  private obterMensagemErro(error: any): string {
    if (this.isNetworkError(error)) {
      return 'Problema de conexão. Tentando reconectar automaticamente...';
    }

    if (error.status === 401) {
      return 'Sessão expirada. Faça login novamente.';
    }

    if (error.status === 403) {
      return 'Você não tem permissão para acessar estes dados.';
    }

    if (error.status >= 500) {
      return 'Erro interno do servidor. Tente novamente em alguns minutos.';
    }

    return 'Não foi possível carregar os dados do painel. Tente novamente.';
  }

  /**
   * Verifica se é um erro de rede
   */
  private isNetworkError(error: any): boolean {
    return !error.status || error.status === 0 || error.name === 'TimeoutError';
  }

  /**
   * Gestão de Usuários
   */
  abrirModalUsuario(): void {
    this.resetarFormularioUsuario();
    this.showUserModal.set(true);
  }

  private resetarFormularioUsuario(): void {
    this.novoUsuario.set({
      nome: '',
      email: '',
      senha: '',
      papel: 'parceiro',
      departamento: ''
    });
  }

  async salvarUsuario(): Promise<void> {
    const usuario = this.novoUsuario();

    // Validação
    if (!this.validarUsuario(usuario)) {
      return;
    }

    try {
      await this.dashboardService.criarUsuario(usuario).toPromise();
      this.showUserModal.set(false);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuário criado com sucesso',
        life: 3000
      });

      // Recarregar dados
      await this.carregarDadosParceiro();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível criar o usuário',
        life: 5000
      });
    }
  }

  private validarUsuario(usuario: UsuarioVinculadoCreateRequest): boolean {
    if (!usuario.nome.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Nome é obrigatório',
        life: 3000
      });
      return false;
    }

    if (!usuario.email.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'E-mail é obrigatório',
        life: 3000
      });
      return false;
    }

    if (!usuario.senha.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Senha é obrigatória',
        life: 3000
      });
      return false;
    }

    if (!usuario.departamento) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Departamento é obrigatório',
        life: 3000
      });
      return false;
    }

    return true;
  }

  cancelarUsuario(): void {
    this.showUserModal.set(false);
  }

  async removerUsuario(usuario: UsuarioVinculadoParceiro): Promise<void> {
    if (!confirm(`Tem certeza que deseja remover o usuário ${usuario.nome}?`)) {
      return;
    }

    try {
      await this.dashboardService.removerUsuario(usuario.id).toPromise();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuário removido com sucesso',
        life: 3000
      });

      // Recarregar dados
      await this.carregarDadosParceiro();
    } catch (error: any) {
      console.error('Erro ao remover usuário:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível remover o usuário',
        life: 5000
      });
    }
  }

  /**
   * Gestão de Documentos
   */
  abrirModalUpload(): void {
    this.resetarFormularioUpload();
    this.showUploadModal.set(true);
  }

  private resetarFormularioUpload(): void {
    this.arquivoSelecionado.set(null);
    this.nomeDocumento.set('');
  }

  onArquivoSelecionado(event: any): void {
    const file = event.files?.[0] || event.target.files?.[0];
    if (file) {
      this.arquivoSelecionado.set(file);
      if (!this.nomeDocumento().trim()) {
        // Sugerir nome baseado no arquivo
        const nomeSemExtensao = file.name.replace(/\.[^/.]+$/, '');
        this.nomeDocumento.set(nomeSemExtensao);
      }
    }
  }

  async uploadDocumento(): Promise<void> {
    const arquivo = this.arquivoSelecionado();
    const nome = this.nomeDocumento().trim();

    if (!arquivo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um arquivo',
        life: 3000
      });
      return;
    }

    if (!nome) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Digite um nome para o documento',
        life: 3000
      });
      return;
    }

    this.uploadandoDocumento.set(true);

    try {
      const uploadRequest: DocumentoUploadRequest = {
        arquivo,
        nome,
        tipo: arquivo.type
      };

      await this.dashboardService.uploadDocumento(uploadRequest).toPromise();
      this.showUploadModal.set(false);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Documento enviado com sucesso',
        life: 3000
      });

      // Recarregar dados
      await this.carregarDadosParceiro();
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível enviar o documento',
        life: 5000
      });
    } finally {
      this.uploadandoDocumento.set(false);
    }
  }

  cancelarUpload(): void {
    this.showUploadModal.set(false);
  }

  async downloadDocumento(documento: DocumentoParceiro): Promise<void> {
    try {
      const blob = await this.dashboardService.downloadDocumento(documento.id).toPromise();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = documento.arquivo_nome || documento.nome;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      console.error('Erro ao baixar documento:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível baixar o documento',
        life: 5000
      });
    }
  }

  visualizarDocumento(documento: DocumentoParceiro): void {
    const url = this.dashboardService.getUrlVisualizacao(documento);
    window.open(url, '_blank');
  }

  /**
   * Determina o status de um documento necessário
   */
  private getStatusDocumentoNecessario(docNecessario: DocumentoNecessario, documentoEnviado?: DocumentoParceiro): string {
    if (!documentoEnviado) {
      return docNecessario.obrigatorio ? 'pendente' : 'opcional';
    }

    return documentoEnviado.status;
  }

  /**
   * Abre modal de upload pré-configurado para um documento específico
   */
  abrirUploadDocumento(documento: DocumentoNecessario): void {
    this.nomeDocumento.set(documento.titulo);
    this.showUploadModal.set(true);
  }

  /**
   * Altera o filtro de documentos
   */
  alterarFiltro(filtro: 'todos' | 'obrigatorios' | 'enviados' | 'pendentes'): void {
    this.filtroDocumento.set(filtro);
  }

  /**
   * Utilitários
   */
  getSeverityStatus(status: string | undefined): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    if (!status) return 'secondary';

    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'aprovado':
      case 'concluido':
      case 'ativo':
      case 'ativa':
        return 'success';
      case 'pendente':
      case 'em_andamento':
        return 'warning';
      case 'rejeitado':
      case 'bloqueado':
      case 'inativo':
      case 'inativa':
      case 'suspenso':
        return 'danger';
      case 'em_analise':
        return 'info';
      default:
        return 'secondary';
    }
  }

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

  formatarTamanhoArquivo(tamanho: number | undefined): string {
    if (!tamanho) return '';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = tamanho;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Formatar tempo da última atualização
   */
  formatarUltimaAtualizacao(): string {
    const ultima = this.ultimaAtualizacao();
    if (!ultima) return '';

    const agora = new Date();
    const diffMs = agora.getTime() - ultima.getTime();
    const diffMinutos = Math.floor(diffMs / 60000);

    if (diffMinutos < 1) {
      return 'Agora mesmo';
    } else if (diffMinutos < 60) {
      return `${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''} atrás`;
    } else {
      const diffHoras = Math.floor(diffMinutos / 60);
      return `${diffHoras} hora${diffHoras > 1 ? 's' : ''} atrás`;
    }
  }

  /**
   * Força atualização dos dados
   */
  async forcarAtualizacao(): Promise<void> {
    this.messageService.add({
      severity: 'info',
      summary: 'Atualizando',
      detail: 'Carregando dados mais recentes...',
      life: 2000
    });

    await this.carregarDadosParceiro();
  }
}
