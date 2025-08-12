import { Component, signal, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Models e Services
import {
  DocumentosPorParceiro,
  SolicitacaoDocumento,
  TipoDocumento,
  NotificacaoEmail,
  Usuario
} from '../../../../compartilhado/modelos';
import { EmailNotificationService, ParceiroService, UsuarioService } from '../../../../compartilhado/servicos';

interface EmailOption {
  label: string;
  value: string;
  email: string;
}

interface EmailData {
  destinatario: string;
  assunto: string;
  mensagem: string;
}

@Component({
  selector: 'app-modal-solicitacao-documentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    CheckboxModule,
    ChipModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-dialog
      header="Enviar Email"
      [visible]="modalVisivel()"
      (visibleChange)="onModalVisibleChange($event)"
      [modal]="true"
      [style]="{width: '500px', maxHeight: '90vh'}"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      styleClass="modal-solicitacao email-modal">

      <div class="email-form-container">
        <form [formGroup]="emailForm" (ngSubmit)="enviar()" class="email-form">

          <!-- Campo Para -->
          <div class="form-field">
            <label for="destinatario" class="required">Para:</label>
            <p-dropdown
              id="destinatario"
              formControlName="destinatario"
              [options]="listaEmails()"
              placeholder="Selecione um destinatário"
              [filter]="true"
              filterBy="label"
              optionLabel="label"
              optionValue="value"
              styleClass="w-full email-dropdown"
              [class]="getFieldErrorClass('destinatario')"
              appendTo="body"
              [showClear]="true"
              scrollHeight="200px"
              filterPlaceholder="Buscar destinatário...">
            </p-dropdown>
            @if (emailForm.get('destinatario')?.invalid && emailForm.get('destinatario')?.touched) {
              <small class="error-message">
                <i class="pi pi-exclamation-triangle"></i>
                Campo obrigatório
              </small>
            }
          </div>

          <!-- Campo Assunto -->
          <div class="form-field">
            <label for="assunto" class="required">Assunto:</label>
            <input
              id="assunto"
              type="text"
              pInputText
              formControlName="assunto"
              placeholder="Digite o assunto do email"
              class="w-full"
              [class]="getFieldErrorClass('assunto')">
            @if (emailForm.get('assunto')?.invalid && emailForm.get('assunto')?.touched) {
              <small class="error-message">
                <i class="pi pi-exclamation-triangle"></i>
                Campo obrigatório
              </small>
            }
          </div>

          <!-- Campo Mensagem -->
          <div class="form-field">
            <label for="mensagem" class="required">Mensagem:</label>
            <textarea
              id="mensagem"
              pInputTextarea
              formControlName="mensagem"
              rows="6"
              placeholder="Digite a mensagem do email..."
              class="w-full"
              [class]="getFieldErrorClass('mensagem')"
              [autoResize]="true">
            </textarea>
            @if (emailForm.get('mensagem')?.invalid && emailForm.get('mensagem')?.touched) {
              <small class="error-message">
                <i class="pi pi-exclamation-triangle"></i>
                Campo obrigatório
              </small>
            }
          </div>

        </form>
      </div>
      
      <ng-template pTemplate="footer">
        <div class="email-footer">
          <button
            type="button"
            class="btn-secondary"
            (click)="cancelar()">
            <i class="pi pi-times"></i>
            <span>Cancelar</span>
          </button>

          <button
            type="button"
            class="btn-primary"
            (click)="enviar()"
            [disabled]="emailForm.invalid || enviando()">
            @if (enviando()) {
              <i class="pi pi-spin pi-spinner"></i>
            } @else {
              <i class="pi pi-send"></i>
            }
            <span>Enviar</span>
          </button>
        </div>
      </ng-template>
      
    </p-dialog>

    <!-- Toast para notificações -->
    <p-toast [showTransitionOptions]="'300ms ease-out'" [hideTransitionOptions]="'250ms ease-in'"></p-toast>
  `,
  styleUrl: './modal-solicitacao-documentos.component.css'
})
export class ModalSolicitacaoDocumentosComponent {
  private readonly fb = inject(FormBuilder);
  private readonly emailService = inject(EmailNotificationService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly messageService = inject(MessageService);

  // Inputs e Outputs
  visible = input<boolean>(false);
  parceirosPendencias = input<DocumentosPorParceiro[]>([]);
  onClose = output<void>();
  onSuccess = output<{
    tipo: string;
    destinatarios: number;
    agendado?: boolean;
  }>();

  // Signals
  protected readonly modalVisivel = signal(false);
  protected readonly enviando = signal(false);
  protected readonly listaEmails = signal<EmailOption[]>([]);

  // Form
  protected emailForm: FormGroup;


  constructor() {
    this.emailForm = this.fb.group({
      destinatario: ['', Validators.required],
      assunto: ['', Validators.required],
      mensagem: ['', Validators.required]
    });

    this.carregarListaEmails();

    // Sincronizar input signal com signal interno
    effect(() => {
      this.modalVisivel.set(this.visible());
    });
  }


  private carregarListaEmails(): void {
    // Carrega lista de emails dos usuários cadastrados
    this.usuarioService.listarEmails().subscribe({
      next: (response) => {
        const emailsOpcoes = response.data.map((usuario: Usuario) => ({
          label: `${usuario.nome} - ${usuario.email}`,
          value: usuario.email,
          email: usuario.email
        }));
        this.listaEmails.set(emailsOpcoes);
      },
      error: (error) => {
        console.error('Erro ao carregar lista de emails:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar a lista de emails',
          life: 3000
        });
      }
    });
  }

  protected getFieldErrorClass(fieldName: string): string {
    const field = this.emailForm.get(fieldName);
    return field?.invalid && field?.touched ? 'p-invalid' : '';
  }

  protected enviar(): void {
    if (this.emailForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.enviando.set(true);
    const formData = this.emailForm.value as EmailData;

    // Preparar dados para envio
    const emailData = {
      destinatario: formData.destinatario,
      assunto: formData.assunto,
      mensagem: formData.mensagem
    };

    // Fazer POST para /api/usuarios/emails
    this.emailService.enviarEmail(emailData).subscribe({
      next: (response) => {
        this.enviando.set(false);

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Email enviado com sucesso!',
          life: 4000
        });

        this.resetForm();
        this.modalVisivel.set(false);
        this.onClose.emit();
      },
      error: (error) => {
        this.enviando.set(false);

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao enviar email. Tente novamente.',
          life: 4000
        });
      }
    });
  }

  protected onModalVisibleChange(visible: boolean): void {
    this.modalVisivel.set(visible);
    if (!visible) {
      this.onClose.emit();
    }
  }

  protected cancelar(): void {
    this.resetForm();
    this.modalVisivel.set(false);
    this.onClose.emit();
  }

  private resetForm(): void {
    this.emailForm.reset();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.emailForm.controls).forEach(key => {
      const control = this.emailForm.get(key);
      control?.markAsTouched();
    });
  }
}
