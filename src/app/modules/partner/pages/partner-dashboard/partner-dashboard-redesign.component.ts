import { Component, OnInit, signal, inject, computed } from '@angular/core';
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
import { AvatarModule } from 'primeng/avatar';
import { MessageService } from 'primeng/api';

// Services and Models
import { AuthService } from '../../../../shared/services/auth.service';
import { ParceiroApiService } from '../../../../shared/services/parceiro-api.service';
import { DateUtilsService } from '../../../../compartilhado/servicos/date-utils.service';
import {
  MeuPerfil,
  EmpresaParceiraAPI,
  DocumentoAPI,
  DocumentoUploadAPI,
  UsuarioVinculado,
  UsuarioVinculadoCreate,
  DashboardParceiroAPI
} from '../../../../shared/models/parceiro-api.model';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-partner-dashboard-redesign',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
    ProgressBarModule,
    AvatarModule
  ],
  providers: [MessageService],
  template: `
    <div class="partner-layout">
      <!-- Header com navegação do parceiro -->
      <header class="partner-header">
        <div class="header-container">
          <div class="header-brand">
            <div class="brand-logo">
              <i class="pi pi-building"></i>
            </div>
            <div class="brand-text">
              <h1>Painel Parceiro</h1>
              <span>{{ dadosDashboard()?.empresa?.razao_social || 'Carregando...' }}</span>
            </div>
          </div>

          <nav class="partner-nav">
            <button 
              class="nav-item" 
              [class.active]="activeTab() === 'dashboard'"
              (click)="setActiveTab('dashboard')">
              <i class="pi pi-home"></i>
              <span>Dashboard</span>
            </button>
            <button 
              class="nav-item" 
              [class.active]="activeTab() === 'documentos'"
              (click)="setActiveTab('documentos')">
              <i class="pi pi-file"></i>
              <span>Documentos</span>
            </button>
            <button 
              class="nav-item" 
              [class.active]="activeTab() === 'usuarios'"
              (click)="setActiveTab('usuarios')">
              <i class="pi pi-users"></i>
              <span>Usuários</span>
            </button>
            <button 
              class="nav-item" 
              [class.active]="activeTab() === 'perfil'"
              (click)="setActiveTab('perfil')">
              <i class="pi pi-user"></i>
              <span>Perfil</span>
            </button>
          </nav>

          <div class="header-actions">
            @if (dadosDashboard()?.perfil; as perfil) {
              <div class="user-profile">
                <p-avatar 
                  [label]="getInitials(perfil.nome)" 
                  shape="circle" 
                  size="normal"
                  styleClass="user-avatar">
                </p-avatar>
                <div class="user-info">
                  <span class="user-name">{{ perfil.nome }}</span>
                  <span class="user-role">{{ perfil.papel }}</span>
                </div>
              </div>
            }
            <button class="logout-btn" (click)="logout()">
              <i class="pi pi-sign-out"></i>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Toast para notificações -->
      <p-toast></p-toast>

      <!-- Conteúdo principal -->
      <main class="partner-main">
        <div class="main-container">
          
          <!-- Loading State -->
          @if (carregando()) {
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <p>Carregando seus dados...</p>
            </div>
          }

          <!-- Dashboard Tab -->
          @if (!carregando() && activeTab() === 'dashboard') {
            <div class="dashboard-content">
              <div class="page-header">
                <h2>Dashboard</h2>
                <p>Visão geral da sua conta e atividades</p>
              </div>

              <!-- Cards de estatísticas -->
              <div class="stats-grid">
                <div class="stat-card documents">
                  <div class="stat-icon">
                    <i class="pi pi-file"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ (dadosDashboard()?.documentos || []).length }}</h3>
                    <p>Documentos</p>
                    <span class="stat-detail">
                      {{ getDocumentosAprovados() }} aprovados
                    </span>
                  </div>
                </div>

                <div class="stat-card users">
                  <div class="stat-icon">
                    <i class="pi pi-users"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ (dadosDashboard()?.usuarios || []).length }}</h3>
                    <p>Usuários</p>
                    <span class="stat-detail">
                      {{ getUsuariosAtivos() }} ativos
                    </span>
                  </div>
                </div>

                <div class="stat-card status">
                  <div class="stat-icon">
                    <i class="pi pi-check-circle"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ dadosDashboard()?.empresa?.status || 'N/A' }}</h3>
                    <p>Status</p>
                    <span class="stat-detail">
                      Empresa {{ dadosDashboard()?.empresa?.status || 'carregando' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Dados da empresa -->
              <div class="company-overview">
                <h3>Dados da Empresa</h3>
                <div class="company-grid">
                  <div class="company-item">
                    <label>Razão Social</label>
                    <span>{{ dadosDashboard()?.empresa?.razao_social || 'N/A' }}</span>
                  </div>
                  <div class="company-item">
                    <label>CNPJ</label>
                    <span>{{ dadosDashboard()?.empresa?.cnpj || 'N/A' }}</span>
                  </div>
                  <div class="company-item">
                    <label>Status</label>
                    <p-tag 
                      [value]="dadosDashboard()?.empresa?.status || 'N/A'" 
                      [severity]="getStatusSeverity(dadosDashboard()?.empresa?.status)">
                    </p-tag>
                  </div>
                  <div class="company-item">
                    <label>Data de Cadastro</label>
                    <span>{{ dateUtils.formatToBrazilianDate(dadosDashboard()?.empresa?.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Atividades recentes -->
              <div class="recent-activity">
                <h3>Documentos Recentes</h3>
                <div class="activity-list">
                  @for (doc of getDocumentosRecentes(); track doc.id) {
                    <div class="activity-item">
                      <div class="activity-icon">
                        <i class="pi pi-file"></i>
                      </div>
                      <div class="activity-content">
                        <span class="activity-title">{{ doc.nome }}</span>
                        <span class="activity-meta">{{ doc.tipo }} • {{ dateUtils.formatToBrazilianDate(doc.created_at) }}</span>
                      </div>
                      <p-tag [value]="doc.status" [severity]="getStatusSeverity(doc.status)"></p-tag>
                    </div>
                  } @empty {
                    <div class="empty-state">
                      <i class="pi pi-file"></i>
                      <p>Nenhum documento enviado</p>
                      <span class="empty-subtitle">
                        Ainda não há documentos em sua conta. Comece enviando seu primeiro documento.
                      </span>
                      <button class="btn-primary" (click)="setActiveTab('documentos')">
                        <i class="pi pi-upload"></i>
                        Enviar Primeiro Documento
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Documentos Tab -->
          @if (!carregando() && activeTab() === 'documentos') {
            <div class="documents-content">
              <div class="page-header">
                <div>
                  <h2>Documentos</h2>
                  <p>Gerencie seus documentos e uploads</p>
                </div>
                <button class="btn-primary" (click)="abrirModalUpload()">
                  <i class="pi pi-upload"></i>
                  Enviar Documento
                </button>
              </div>

              <div class="documents-table">
                <p-table 
                  [value]="dadosDashboard()?.documentos || []" 
                  [rows]="10" 
                  [paginator]="true"
                  [responsive]="true"
                  styleClass="custom-table">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>Nome</th>
                      <th>Tipo</th>
                      <th>Status</th>
                      <th>Setor</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-doc>
                    <tr>
                      <td>
                        <div class="doc-info">
                          <i class="pi pi-file doc-icon"></i>
                          <span>{{ doc.nome }}</span>
                        </div>
                      </td>
                      <td>
                        <p-tag [value]="doc.tipo" severity="info"></p-tag>
                      </td>
                      <td>
                        <p-tag [value]="doc.status" [severity]="getStatusSeverity(doc.status)"></p-tag>
                      </td>
                      <td>{{ doc.setor_destino }}</td>
                      <td>{{ dateUtils.formatToBrazilianDate(doc.created_at) }}</td>
                      <td>
                        <button 
                          class="btn-action" 
                          (click)="downloadDocumento(doc)"
                          title="Download">
                          <i class="pi pi-download"></i>
                        </button>
                      </td>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="emptymessage">
                    <tr>
                      <td colspan="6" class="empty-table">
                        <div class="empty-state">
                          <i class="pi pi-file"></i>
                          <p>Nenhum documento enviado</p>
                          <span class="empty-subtitle">
                            Envie seus documentos para análise e aprovação. Suportamos formatos PDF, Word e imagens.
                          </span>
                          <button class="btn-primary" (click)="abrirModalUpload()">
                            <i class="pi pi-upload"></i>
                            Enviar Primeiro Documento
                          </button>
                        </div>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>
            </div>
          }

          <!-- Usuários Tab -->
          @if (!carregando() && activeTab() === 'usuarios') {
            <div class="users-content">
              <div class="page-header">
                <div>
                  <h2>Usuários</h2>
                  <p>Gerencie os usuários da sua empresa</p>
                </div>
                <button class="btn-primary" (click)="abrirModalUsuario()">
                  <i class="pi pi-plus"></i>
                  Adicionar Usuário
                </button>
              </div>

              <div class="users-table">
                <p-table 
                  [value]="dadosDashboard()?.usuarios || []" 
                  [rows]="10" 
                  [paginator]="true"
                  [responsive]="true"
                  styleClass="custom-table">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Data Cadastro</th>
                      <th>Ações</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-user>
                    <tr>
                      <td>
                        <div class="user-info">
                          <p-avatar
                            [label]="getInitials(user.nome)"
                            size="normal"
                            shape="circle">
                          </p-avatar>
                          <span>{{ user.nome }}</span>
                        </div>
                      </td>
                      <td>{{ user.email }}</td>
                      <td>
                        <p-tag [value]="user.status" [severity]="getStatusSeverity(user.status)"></p-tag>
                      </td>
                      <td>{{ dateUtils.formatToBrazilianDate(user.created_at) }}</td>
                      <td>
                        <button 
                          class="btn-danger" 
                          (click)="removerUsuario(user)"
                          title="Remover">
                          <i class="pi pi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="emptymessage">
                    <tr>
                      <td colspan="5" class="empty-table">
                        <div class="empty-state">
                          <i class="pi pi-users"></i>
                          <p>Nenhum usuário cadastrado</p>
                          <span class="empty-subtitle">
                            Comece adicionando usuários da sua empresa para gerenciar acessos e permissões no sistema.
                          </span>
                          <button class="btn-primary" (click)="abrirModalUsuario()">
                            <i class="pi pi-plus"></i>
                            Adicionar Primeiro Usuário
                          </button>
                        </div>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>
            </div>
          }

          <!-- Perfil Tab -->
          @if (!carregando() && activeTab() === 'perfil') {
            <div class="profile-content">
              <div class="page-header">
                <h2>Meu Perfil</h2>
                <p>Informações da sua conta e empresa</p>
              </div>

              <div class="profile-grid">
                <div class="profile-card user-profile-card">
                  <h3>Dados Pessoais</h3>
                  <div class="profile-info">
                    <div class="profile-avatar">
                      <p-avatar 
                        [label]="getInitials(dadosDashboard()?.perfil?.nome || '')" 
                        size="xlarge"
                        shape="circle">
                      </p-avatar>
                    </div>
                    <div class="profile-details">
                      <div class="detail-item">
                        <label>Nome</label>
                        <span>{{ dadosDashboard()?.perfil?.nome || 'N/A' }}</span>
                      </div>
                      <div class="detail-item">
                        <label>Email</label>
                        <span>{{ dadosDashboard()?.perfil?.email || 'N/A' }}</span>
                      </div>
                      <div class="detail-item">
                        <label>Papel</label>
                        <span>{{ dadosDashboard()?.perfil?.papel || 'N/A' }}</span>
                      </div>
                      <div class="detail-item">
                        <label>Último Acesso</label>
                        <span>{{ dateUtils.formatToBrazilianDateTime(dadosDashboard()?.perfil?.ultimo_acesso) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="profile-card company-profile-card">
                  <h3>Dados da Empresa</h3>
                  <div class="company-details">
                    <div class="detail-item">
                      <label>Razão Social</label>
                      <span>{{ dadosDashboard()?.empresa?.razao_social || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <label>Nome Fantasia</label>
                      <span>{{ dadosDashboard()?.empresa?.nome_fantasia || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <label>CNPJ</label>
                      <span>{{ dadosDashboard()?.empresa?.cnpj || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <label>Status</label>
                      <p-tag 
                        [value]="dadosDashboard()?.empresa?.status || 'N/A'" 
                        [severity]="getStatusSeverity(dadosDashboard()?.empresa?.status)">
                      </p-tag>
                    </div>
                    <div class="detail-item">
                      <label>Data de Cadastro</label>
                      <span>{{ dateUtils.formatToBrazilianDate(dadosDashboard()?.empresa?.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

        </div>
      </main>

      <!-- Modal Upload Documento -->
      <p-dialog 
        header="Enviar Documento" 
        [(visible)]="showUploadModal" 
        [modal]="true" 
        [style]="{width: '500px'}"
        styleClass="custom-dialog">
        <div class="upload-form">
          <div class="form-field">
            <label>Nome do Documento *</label>
            <input 
              pInputText 
              [(ngModel)]="novoDocumento().nome" 
              placeholder="Digite o nome do documento" 
              class="w-full">
          </div>

          <div class="form-field">
            <label>Tipo *</label>
            <p-dropdown 
              [(ngModel)]="novoDocumento().tipo" 
              [options]="tiposDocumento" 
              placeholder="Selecione o tipo"
              class="w-full">
            </p-dropdown>
          </div>

          <div class="form-field">
            <label>Setor Destino *</label>
            <p-dropdown 
              [(ngModel)]="novoDocumento().setor_destino" 
              [options]="setoresDestino" 
              placeholder="Selecione o setor"
              class="w-full">
            </p-dropdown>
          </div>

          <div class="form-field">
            <label>Arquivo *</label>
            <p-fileUpload 
              mode="basic" 
              chooseLabel="Selecionar Arquivo"
              [auto]="false"
              [multiple]="false"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxFileSize="10000000"
              (onSelect)="onArquivoSelecionado($event)"
              styleClass="w-full">
            </p-fileUpload>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="modal-actions">
            <button class="btn-secondary" (click)="cancelarUpload()">Cancelar</button>
            <button 
              class="btn-primary" 
              (click)="enviarDocumento()" 
              [disabled]="uploadandoDocumento()">
              @if (uploadandoDocumento()) {
                <i class="pi pi-spin pi-spinner"></i>
              } @else {
                <i class="pi pi-upload"></i>
              }
              Enviar
            </button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Modal Usuário -->
      <p-dialog 
        header="Adicionar Usuário" 
        [(visible)]="showUserModal" 
        [modal]="true" 
        [style]="{width: '400px'}"
        styleClass="custom-dialog">
        <div class="user-form">
          <div class="form-field">
            <label>Nome *</label>
            <input 
              pInputText 
              [(ngModel)]="novoUsuario().nome" 
              placeholder="Digite o nome completo" 
              class="w-full">
          </div>

          <div class="form-field">
            <label>Email *</label>
            <input 
              pInputText 
              [(ngModel)]="novoUsuario().email" 
              placeholder="Digite o email" 
              class="w-full">
          </div>

          <div class="form-field">
            <label>Senha *</label>
            <p-password 
              [(ngModel)]="novoUsuario().senha" 
              placeholder="Digite a senha" 
              [feedback]="false" 
              [toggleMask]="true" 
              class="w-full">
            </p-password>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="modal-actions">
            <button class="btn-secondary" (click)="cancelarUsuario()">Cancelar</button>
            <button class="btn-primary" (click)="criarUsuario()">
              <i class="pi pi-check"></i>
              Salvar
            </button>
          </div>
        </ng-template>
      </p-dialog>

    </div>
  `,
  styleUrls: ['./partner-dashboard-redesign.component.css']
})
export class PartnerDashboardRedesignComponent implements OnInit {
  // Injeção de dependências
  private readonly authService = inject(AuthService);
  private readonly parceiroApiService = inject(ParceiroApiService);
  private readonly messageService = inject(MessageService);
  protected readonly dateUtils = inject(DateUtilsService);

  // Estado principal
  protected readonly dadosDashboard = signal<DashboardParceiroAPI | null>(null);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly activeTab = signal<'dashboard' | 'documentos' | 'usuarios' | 'perfil'>('dashboard');

  // Estado dos modais
  protected readonly showUploadModal = signal(false);
  protected readonly showUserModal = signal(false);
  protected readonly uploadandoDocumento = signal(false);

  // Forms
  protected readonly novoDocumento = signal<Partial<DocumentoUploadAPI>>({
    nome: '',
    tipo: undefined,
    setor_destino: '',
    arquivo: undefined
  });

  protected readonly novoUsuario = signal<UsuarioVinculadoCreate>({
    nome: '',
    email: '',
    senha: ''
  });

  // Opções para dropdowns
  protected readonly tiposDocumento: DropdownOption[] = [
    { label: 'Jurídica', value: 'Jurídica' },
    { label: 'Financeiro', value: 'Financeiro' },
    { label: 'Contratual', value: 'Contratual' }
  ];

  protected readonly setoresDestino: DropdownOption[] = [
    { label: 'Jurídico', value: 'Jurídico' },
    { label: 'Financeiro', value: 'Financeiro' },
    { label: 'Comercial', value: 'Comercial' },
    { label: 'Operações', value: 'Operações' },
    { label: 'Administrativo', value: 'Administrativo' },
    { label: 'Compliance', value: 'Compliance' }
  ];

  ngOnInit(): void {
    this.carregarDados();
  }

  setActiveTab(tab: 'dashboard' | 'documentos' | 'usuarios' | 'perfil'): void {
    this.activeTab.set(tab);
  }

  async carregarDados(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const dashboard = await this.parceiroApiService.getDashboardCompleto().toPromise();
      this.dadosDashboard.set(dashboard || null);
    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      this.erro.set('Não foi possível carregar os dados do painel.');
      
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar dados'
      });
    } finally {
      this.carregando.set(false);
    }
  }

  // Métodos utilitários para o dashboard
  getDocumentosAprovados(): number {
    const documentos = this.dadosDashboard()?.documentos;
    if (!Array.isArray(documentos)) return 0;
    return documentos.filter(d => d.status === 'aprovado').length;
  }

  getUsuariosAtivos(): number {
    const usuarios = this.dadosDashboard()?.usuarios;
    if (!Array.isArray(usuarios)) return 0;
    return usuarios.filter(u => u.status === 'ativo').length;
  }

  getDocumentosRecentes(): DocumentoAPI[] {
    const documentos = this.dadosDashboard()?.documentos;
    if (!Array.isArray(documentos)) return [];
    return this.dateUtils.sortByTimestamp(documentos, 'created_at').slice(0, 5);
  }

  getInitials(nome: string | undefined | null): string {
    if (!nome || typeof nome !== 'string') {
      return 'NN';
    }

    return nome
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  logout(): void {
    this.authService.logout();
  }

  // Upload de documento
  abrirModalUpload(): void {
    this.novoDocumento.set({
      nome: '',
      tipo: undefined,
      setor_destino: '',
      arquivo: undefined
    });
    this.showUploadModal.set(true);
  }

  onArquivoSelecionado(event: any): void {
    const file = event.files?.[0] || event.target?.files?.[0];
    if (file) {
      this.novoDocumento.update(doc => ({ ...doc, arquivo: file }));
    }
  }

  async enviarDocumento(): Promise<void> {
    const doc = this.novoDocumento();
    
    if (!doc.nome || !doc.tipo || !doc.setor_destino || !doc.arquivo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    this.uploadandoDocumento.set(true);

    try {
      await this.parceiroApiService.uploadDocumento(doc as DocumentoUploadAPI).toPromise();
      
      this.showUploadModal.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Documento enviado com sucesso'
      });
      
      await this.carregarDados();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao enviar documento'
      });
    } finally {
      this.uploadandoDocumento.set(false);
    }
  }

  cancelarUpload(): void {
    this.showUploadModal.set(false);
  }

  async downloadDocumento(documento: DocumentoAPI): Promise<void> {
    try {
      await this.parceiroApiService.downloadDocumentoSeguro(documento).toPromise();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Download iniciado'
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao baixar documento'
      });
    }
  }

  // Gestão de usuários
  abrirModalUsuario(): void {
    this.novoUsuario.set({ nome: '', email: '', senha: '' });
    this.showUserModal.set(true);
  }

  async criarUsuario(): Promise<void> {
    const usuario = this.novoUsuario();
    
    if (!usuario.nome || !usuario.email || !usuario.senha) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos'
      });
      return;
    }

    try {
      await this.parceiroApiService.criarUsuario(usuario).toPromise();
      
      this.showUserModal.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuário criado com sucesso'
      });
      
      await this.carregarDados();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao criar usuário'
      });
    }
  }

  cancelarUsuario(): void {
    this.showUserModal.set(false);
  }

  async removerUsuario(usuario: UsuarioVinculado): Promise<void> {
    if (!confirm(`Confirma a remoção do usuário ${usuario.nome}?`)) {
      return;
    }

    try {
      await this.parceiroApiService.removerUsuario(usuario.id).toPromise();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuário removido com sucesso'
      });
      
      await this.carregarDados();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao remover usuário'
      });
    }
  }

  // Utilitários
  getStatusSeverity(status: string | undefined): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    if (!status) return 'secondary';

    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'aprovado':
      case 'ativo':
        return 'success';
      case 'pendente':
      case 'em_analise':
        return 'warning';
      case 'rejeitado':
      case 'inativo':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  // Método mantido para compatibilidade, mas agora usa DateUtilsService
  formatarData(data: string | undefined): string {
    return this.dateUtils.formatToBrazilianDateTime(data);
  }
}
