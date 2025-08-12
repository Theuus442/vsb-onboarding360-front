import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

// Models and Components
import { DocumentoUpload, TipoDocumento, Documento } from '../../../../compartilhado/modelos';
import { DropdownModernoComponent, DropdownOption } from '../../../../compartilhado/componentes';

@Component({
  selector: 'app-modal-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    FileUploadModule,
    InputTextareaModule,
    ButtonModule,
    DropdownModernoComponent
  ],
  template: `
    <p-dialog 
      [(visible)]="visivel" 
      [modal]="true" 
      [style]="{width: '50vw'}"
      header="Upload de Documento"
      [closable]="false"
    >
      <form [formGroup]="formUpload" (ngSubmit)="onSubmit()">
        <div class="grid">
          <div class="col-12">
            <label for="arquivo" class="block text-900 font-medium mb-2">
              Arquivo *
            </label>
            <p-fileUpload 
              mode="basic" 
              name="arquivo"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              [maxFileSize]="10000000"
              (onSelect)="onArquivoSelecionado($event)"
              chooseLabel="Selecionar Arquivo"
              [auto]="false"
            ></p-fileUpload>
            <small class="block text-500 mt-1">
              Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
            </small>
          </div>

          <div class="col-12">
            <label for="tipo" class="block text-900 font-medium mb-2">
              Tipo de Documento *
            </label>
            <app-dropdown-moderno
              [options]="opcoesTipos"
              placeholder="Selecione o tipo de documento"
              formControlName="tipo"
              ariaLabel="Tipo de documento"
              [searchable]="false"
              [showFooter]="false">
            </app-dropdown-moderno>
          </div>

          <div class="col-12">
            <label for="observacoes" class="block text-900 font-medium mb-2">
              Observações
            </label>
            <textarea 
              formControlName="observacoes"
              pInputTextarea 
              rows="3" 
              class="w-full"
              placeholder="Observações sobre o documento (opcional)"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-4">
          <button 
            type="button" 
            pButton 
            label="Cancelar" 
            class="p-button-text"
            (click)="cancelar()"
            [disabled]="enviando()"
          ></button>
          <button 
            type="submit" 
            pButton 
            label="Enviar" 
            [disabled]="!podeEnviar()"
            [loading]="enviando()"
          ></button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .p-fileupload-basic {
      width: 100%;
    }
    
    :host ::ng-deep .p-fileupload-basic .p-button {
      width: 100%;
    }
  `]
})
export class ModalUploadComponent {
  @Input() visivel = false;
  @Output() visivelChange = new EventEmitter<boolean>();
  @Output() documentoEnviado = new EventEmitter<Documento>();

  // Injeção de dependências
  private readonly fb = inject(FormBuilder);
  private readonly servicoMensagem = inject(MessageService);

  // Signals
  readonly enviando = signal(false);
  
  // Formulário
  readonly formUpload: FormGroup;

  // Arquivo selecionado
  arquivoSelecionado: File | null = null;

  // Opções para dropdown
  readonly opcoesTipos: DropdownOption[] = [
    {
      label: 'CNPJ',
      value: 'cnpj',
      icon: 'id-card',
      description: 'Cadastro Nacional da Pessoa Jurídica',
      color: '#3b82f6'
    },
    {
      label: 'Contrato Social',
      value: 'contrato_social',
      icon: 'file-text',
      description: 'Documento de constituição da empresa',
      color: '#22c55e'
    },
    {
      label: 'Certificado Digital',
      value: 'certificado_digital',
      icon: 'shield',
      description: 'Certificado de segurança digital',
      color: '#f59e0b'
    },
    {
      label: 'Comprovante de Endereço',
      value: 'comprovante_endereco',
      icon: 'home',
      description: 'Documento que comprova o endereço',
      color: '#8b5cf6'
    },
    {
      label: 'Outros',
      value: 'outros',
      icon: 'file',
      description: 'Outros tipos de documentos',
      color: '#6b7280'
    }
  ];

  constructor() {
    this.formUpload = this.fb.group({
      tipo: ['', Validators.required],
      observacoes: ['']
    });
  }

  onArquivoSelecionado(event: any): void {
    const arquivo = event.files[0];
    if (arquivo) {
      this.arquivoSelecionado = arquivo;
    }
  }

  podeEnviar(): boolean {
    return this.formUpload.valid && 
           this.arquivoSelecionado !== null && 
           !this.enviando();
  }

  onSubmit(): void {
    if (!this.podeEnviar()) {
      return;
    }

    this.enviando.set(true);

    // Simular upload (substituir por service real)
    const documentoUpload: DocumentoUpload = {
      arquivo: this.arquivoSelecionado!,
      tipo: this.formUpload.get('tipo')?.value,
      observacoes: this.formUpload.get('observacoes')?.value || undefined
    };

    // Simular delay de upload
    setTimeout(() => {
      const novoDocumento: Documento = {
        id: Date.now().toString(),
        nome: this.arquivoSelecionado!.name,
        tipo: documentoUpload.tipo,
        status: 'pendente',
        created_at: new Date().toISOString(),
        observacoes: documentoUpload.observacoes
      };

      this.documentoEnviado.emit(novoDocumento);
      this.resetarFormulario();
      this.fecharModal();
      this.enviando.set(false);
    }, 2000);
  }

  cancelar(): void {
    this.resetarFormulario();
    this.fecharModal();
  }

  private fecharModal(): void {
    this.visivel = false;
    this.visivelChange.emit(false);
  }

  private resetarFormulario(): void {
    this.formUpload.reset();
    this.arquivoSelecionado = null;
  }
}
