import { Component, Input, Output, EventEmitter, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
// Removed DropdownModule - using custom dropdown
import { DropdownModernoComponent, DropdownOption } from '../../../compartilhado/componentes';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Models - temporarily using any, will be fixed later
// import { Documento } from '../../../shared/models';

interface Documento {
  id?: string;
  nome: string;
  tipo: string;
  status: string;
  created_at?: string;
}

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModernoComponent,
    ProgressBarModule,
    TooltipModule
  ],
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.css']
})
export class UploadModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() documentoUpload = new EventEmitter<Documento>();

  // Injeção de dependências
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  // Signals
  readonly arquivo = signal<File | null>(null);
  readonly uploading = signal(false);
  readonly progressoUpload = signal(0);

  // Form
  uploadForm: FormGroup;

  // Estado de drag and drop
  isDragOver = false;

  // Computed properties
  readonly arquivoSelecionado = () => this.arquivo() !== null;

  // Opções de setores conforme especificação
  readonly opcoesSetores: DropdownOption[] = [
    { label: 'Jurídico', value: 'juridico', icon: 'balance-scale', description: 'Departamento Jurídico', color: '#6366f1' },
    { label: 'Financeiro', value: 'financeiro', icon: 'dollar-sign', description: 'Setor Financeiro', color: '#22c55e' },
    { label: 'Recursos Humanos', value: 'rh', icon: 'users', description: 'Recursos Humanos', color: '#f59e0b' },
    { label: 'Comercial', value: 'comercial', icon: 'chart-line', description: 'Departamento Comercial', color: '#3b82f6' },
    { label: 'Operações', value: 'operacoes', icon: 'cog', description: 'Operações e Infraestrutura', color: '#f97316' },
    { label: 'Compliance', value: 'compliance', icon: 'shield-alt', description: 'Compliance e Auditoria', color: '#ef4444' }
  ];

  constructor() {
    this.uploadForm = this.fb.group({
      nome: ['', Validators.required],
      setor_destino: [null, Validators.required],
      arquivo: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    // Inicialização se necessário
  }

  // Validação de campos
  isFieldInvalid(fieldName: string): boolean {
    const field = this.uploadForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Manipulação de arquivos
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processarArquivo(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processarArquivo(event.dataTransfer.files[0]);
    }
  }

  private processarArquivo(file: File): void {
    // Validar se é PDF
    if (file.type !== 'application/pdf') {
      this.messageService.add({
        severity: 'error',
        summary: 'Arquivo Inválido',
        detail: 'Apenas arquivos PDF são aceitos',
        life: 5000
      });
      return;
    }

    // Validar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'Arquivo Muito Grande',
        detail: 'O arquivo deve ter no máximo 10MB',
        life: 5000
      });
      return;
    }

    this.arquivo.set(file);
    this.uploadForm.patchValue({ arquivo: file });
    this.uploadForm.get('arquivo')?.markAsTouched();
  }

  removerArquivo(event: Event): void {
    event.stopPropagation();
    this.arquivo.set(null);
    this.uploadForm.patchValue({ arquivo: null });
    this.uploadForm.get('arquivo')?.markAsTouched();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Envio do formulário seguindo especificações da API
  onSubmit(): void {
    if (this.uploadForm.invalid) {
      this.uploadForm.markAllAsTouched();
      return;
    }

    this.uploading.set(true);
    this.progressoUpload.set(0);

    const formValues = this.uploadForm.value;
    
    // Criar FormData conforme especificação da API
    const formData = new FormData();
    formData.append('nome', formValues.nome);
    formData.append('setor_destino', formValues.setor_destino);
    formData.append('arquivo', this.arquivo()!);
    
    // IMPORTANTE: NÃO enviar parceiro_id - será identificado automaticamente

    // Headers (sem Content-Type para que o browser defina automaticamente)
    const token = localStorage.getItem('authToken');
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Simular progresso
    const progressInterval = setInterval(() => {
      const current = this.progressoUpload();
      if (current < 90) {
        this.progressoUpload.set(current + 10);
      }
    }, 200);

    // Fazer requisição POST para /api/documentos
    this.http.post<Documento>('/api/documentos', formData, { headers }).subscribe({
      next: (documento: Documento) => {
        clearInterval(progressInterval);
        this.progressoUpload.set(100);
        
        setTimeout(() => {
          this.uploading.set(false);
          this.progressoUpload.set(0);
          this.documentoUpload.emit(documento);
          this.resetForm();
          this.fecharModal();
          
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Documento PDF enviado com sucesso',
            life: 3000
          });
        }, 500);
      },
      error: (erro) => {
        clearInterval(progressInterval);
        this.uploading.set(false);
        this.progressoUpload.set(0);
        
        console.error('Erro ao fazer upload:', erro);
        
        let mensagemErro = 'Erro ao enviar documento';
        if (erro.error?.message) {
          mensagemErro = erro.error.message;
        } else if (erro.message) {
          mensagemErro = erro.message;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erro no Upload',
          detail: mensagemErro,
          life: 5000
        });
      }
    });
  }

  onCancel(): void {
    this.fecharModal();
  }

  private fecharModal(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetForm();
  }

  private resetForm(): void {
    this.uploadForm.reset();
    this.arquivo.set(null);
    this.uploading.set(false);
    this.progressoUpload.set(0);
    this.isDragOver = false;
  }
}
