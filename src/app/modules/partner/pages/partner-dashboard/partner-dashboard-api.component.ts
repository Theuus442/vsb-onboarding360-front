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
import { MessageService } from 'primeng/api';

// Layout component
import { LayoutComponent } from '../../../../shared/layout/layout.component';

// Services and Models
import { AuthService } from '../../../../shared/services/auth.service';
import { ParceiroApiService } from '../../../../shared/services/parceiro-api.service';
import {
  MeuPerfil,
  EmpresaParceiraAPI,
  DocumentoAPI,
  DocumentoUploadAPI,
  UsuarioVinculado,
  UsuarioVinculadoCreate,
  DashboardParceiroAPI,
  TipoDocumento,
  SetorDestino
} from '../../../../shared/models/parceiro-api.model';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-partner-dashboard-api',
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
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <app-layout>
      <!-- Toast para notificações -->
      <p-toast></p-toast>

      <div class="conteudo-painel">
        
        <!-- Cabeçalho da Página -->
        <div class="cabecalho-pagina">
          <h1 class="titulo-pagina">Painel do Parceiro</h1>
          <p class="subtitulo-pagina">Gerencie seu perfil, documentos e usuários vinculados</p>
        </div>

        <!-- Loading State -->
        @if (carregando()) {
          <div class="loading-overlay">
            <div class="loading-spinner"></div>
          </div>
        }

        <!-- Estado de Erro -->
        @if (!carregando() && erro()) {
          <div class="error-state">
            <div class="error-content">
              <i class="pi pi-exclamation-triangle error-icon"></i>
              <h3>Erro ao carregar dados</h3>
              <p>{{ erro() }}</p>
              <button class="btn-retry" (click)="carregarDados()">
                <i class="pi pi-refresh"></i>
                Tentar Novamente
              </button>
            </div>
          </div>
        }

        <!-- Conteúdo Principal -->
        @if (!carregando() && dadosDashboard()) {
          
          <!-- Seção Perfil -->
          <section class="secao-perfil">
            <h2>👤 Meu Perfil</h2>
            <div class="perfil-card">
              <div class="perfil-info">
                <h3>{{ dadosDashboard()?.perfil?.nome }}</h3>
                <p><strong>Email:</strong> {{ dadosDashboard()?.perfil?.email }}</p>
                <p><strong>Papel:</strong> {{ dadosDashboard()?.perfil?.papel }}</p>
                <p><strong>Último acesso:</strong> {{ formatarData(dadosDashboard()?.perfil?.ultimo_acesso) }}</p>
              </div>
            </div>

            <h3>Dados da Empresa</h3>
            <div class="empresa-card">
              <div class="empresa-grid">
                <div class="dado-item">
                  <label>Razão Social:</label>
                  <span>{{ dadosDashboard()?.empresa?.razao_social }}</span>
                </div>
                <div class="dado-item">
                  <label>CNPJ:</label>
                  <span>{{ dadosDashboard()?.empresa?.cnpj }}</span>
                </div>
                <div class="dado-item">
                  <label>Status:</label>
                  <p-tag [value]="dadosDashboard()?.empresa?.status" [severity]="getSeverityStatus(dadosDashboard()?.empresa?.status)"></p-tag>
                </div>
                <div class="dado-item">
                  <label>Data de Criação:</label>
                  <span>{{ formatarData(dadosDashboard()?.empresa?.created_at) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Seção Documentos -->
          <section class="secao-documentos">
            <div class="secao-header">
              <h2>📂 Documentos</h2>
              <button class="btn-primary" (click)="abrirModalUpload()">
                <i class="pi pi-upload"></i>
                Enviar Documento
              </button>
            </div>

            <div class="documentos-table-wrapper">
              <p-table [value]="dadosDashboard()?.documentos || []" [rows]="10" [paginator]="true">
                <ng-template pTemplate="header">
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Setor Destino</th>
                    <th>Data Criação</th>
                    <th>Ações</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-doc>
                  <tr>
                    <td>{{ doc.id }}</td>
                    <td>{{ doc.nome }}</td>
                    <td>
                      <p-tag [value]="doc.tipo" severity="info"></p-tag>
                    </td>
                    <td>
                      <p-tag [value]="doc.status" [severity]="getSeverityStatus(doc.status)"></p-tag>
                    </td>
                    <td>{{ doc.setor_destino }}</td>
                    <td>{{ formatarData(doc.created_at) }}</td>
                    <td>
                      <button class="btn-action" (click)="downloadDocumento(doc)" title="Download">
                        <i class="pi pi-download"></i>
                      </button>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </section>

          <!-- Seção Usuários -->
          <section class="secao-usuarios">
            <div class="secao-header">
              <h2>👥 Usuários Vinculados</h2>
              <button class="btn-primary" (click)="abrirModalUsuario()">
                <i class="pi pi-plus"></i>
                Adicionar Usuário
              </button>
            </div>

            <div class="usuarios-table-wrapper">
              <p-table [value]="dadosDashboard()?.usuarios || []" [rows]="10" [paginator]="true">
                <ng-template pTemplate="header">
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Data Criação</th>
                    <th>Ações</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-usuario>
                  <tr>
                    <td>{{ usuario.id }}</td>
                    <td>{{ usuario.nome }}</td>
                    <td>{{ usuario.email }}</td>
                    <td>
                      <p-tag [value]="usuario.status" [severity]="getSeverityStatus(usuario.status)"></p-tag>
                    </td>
                    <td>{{ formatarData(usuario.created_at) }}</td>
                    <td>
                      <button class="btn-danger" (click)="removerUsuario(usuario)" title="Remover">
                        <i class="pi pi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </section>
        }

        <!-- Modal Upload Documento -->
        <p-dialog header="Enviar Documento" [(visible)]="showUploadModal" [modal]="true" [style]="{width: '500px'}">
          <div class="upload-form">
            <div class="form-field">
              <label>Nome do Documento *</label>
              <input pInputText [(ngModel)]="novoDocumento().nome" placeholder="Digite o nome do documento" class="w-full">
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
                (onSelect)="onArquivoSelecionado($event)">
              </p-fileUpload>
            </div>
          </div>

          <ng-template pTemplate="footer">
            <div class="modal-actions">
              <button class="btn-secondary" (click)="cancelarUpload()">Cancelar</button>
              <button class="btn-primary" (click)="enviarDocumento()" [disabled]="uploadandoDocumento()">
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
        <p-dialog header="Adicionar Usuário" [(visible)]="showUserModal" [modal]="true" [style]="{width: '400px'}">
          <div class="user-form">
            <div class="form-field">
              <label>Nome *</label>
              <input pInputText [(ngModel)]="novoUsuario().nome" placeholder="Digite o nome completo" class="w-full">
            </div>

            <div class="form-field">
              <label>Email *</label>
              <input pInputText [(ngModel)]="novoUsuario().email" placeholder="Digite o email" class="w-full">
            </div>

            <div class="form-field">
              <label>Senha *</label>
              <p-password [(ngModel)]="novoUsuario().senha" placeholder="Digite a senha" [feedback]="false" [toggleMask]="true" class="w-full"></p-password>
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
    </app-layout>
  `,
  styleUrls: ['./partner-dashboard.component.css']
})
export class PartnerDashboardApiComponent implements OnInit {
  // Injeção de dependências
  private readonly authService = inject(AuthService);
  private readonly parceiroApiService = inject(ParceiroApiService);
  private readonly messageService = inject(MessageService);

  // Estado principal
  protected readonly dadosDashboard = signal<DashboardParceiroAPI | null>(null);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);

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

  async carregarDados(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const dashboard = await this.parceiroApiService.getDashboardCompleto().toPromise();
      this.dadosDashboard.set(dashboard || null);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Dados carregados com sucesso'
      });
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
  getSeverityStatus(status: string | undefined): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
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

  formatarData(data: string | undefined): string {
    if (!data) return 'N/A';
    
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
