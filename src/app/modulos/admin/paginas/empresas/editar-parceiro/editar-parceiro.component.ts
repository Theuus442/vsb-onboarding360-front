import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize, forkJoin } from 'rxjs';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

// Shared Components
import { LayoutComponent } from '../../../../../compartilhado/layout/layout.component';
import { CarregandoComponent, DropdownModernoComponent, DropdownOption } from '../../../../../compartilhado/componentes';

// Models and Services
import { Parceiro, ParceiroUpdateRequest, Usuario } from '../../../../../compartilhado/modelos';
import { ParceiroService, UsuarioService } from '../../../../../compartilhado/servicos';

// Constants
const PHONE_MASK_REGEX = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
const CNPJ_MASK_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

@Component({
  selector: 'app-editar-parceiro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ProgressSpinnerModule,
    LayoutComponent,
    CarregandoComponent,
    DropdownModernoComponent
  ],
  providers: [MessageService],
  templateUrl: './editar-parceiro.component.html',
  styleUrls: ['./editar-parceiro.component.css']
})
export class EditarParceiroComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly parceiroService = inject(ParceiroService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  // Reactive state
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly parceiro = signal<Parceiro | null>(null);
  readonly responsaveis = signal<Usuario[]>([]);
  readonly parceiroId = signal<number | null>(null);
  readonly showPassword = signal(false);

  // Particles for animation
  readonly particles = Array(10).fill(0);

  // Form
  readonly parceiroForm: FormGroup;

  // Status options
  readonly statusOptions: DropdownOption[] = [
    { 
      label: 'Ativo', 
      value: 'ativo', 
      icon: 'check-circle', 
      description: 'Parceiro ativo no sistema', 
      color: '#22c55e' 
    },
    { 
      label: 'Inativo', 
      value: 'inativo', 
      icon: 'times-circle', 
      description: 'Parceiro inativo', 
      color: '#ef4444' 
    },
    { 
      label: 'Suspenso', 
      value: 'suspenso', 
      icon: 'ban', 
      description: 'Parceiro temporariamente suspenso', 
      color: '#f59e0b' 
    }
  ];

  // Computed properties
  readonly responsaveisOptions = computed(() => 
    this.responsaveis().map(usuario => ({
      label: usuario.nome,
      value: usuario.id,
      icon: 'user',
      description: usuario.email,
      color: '#6366f1'
    }))
  );

  readonly formProgress = computed(() => {
    const form = this.parceiroForm;
    if (!form) return 0;
    
    const fields = ['nome_fantasia', 'razao_social', 'cnpj', 'email', 'telefone', 'responsavel_id'];
    const filledFields = fields.filter(field => {
      const control = form.get(field);
      return control?.value && !control.invalid;
    });
    return Math.round((filledFields.length / fields.length) * 100);
  });

  readonly canSave = computed(() => 
    this.parceiroForm?.valid && !this.salvando() && !this.carregando()
  );

  constructor() {
    this.parceiroForm = this.formBuilder.group({
      nome_fantasia: ['', [Validators.required, Validators.minLength(2)]],
      razao_social: ['', [Validators.required, Validators.minLength(2)]],
      cnpj: ['', [Validators.required, Validators.pattern(CNPJ_MASK_REGEX)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(PHONE_MASK_REGEX)]],
      responsavel_id: ['', [Validators.required]],
      status: ['ativo', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const id = Number(params['id']);
      if (id && !isNaN(id)) {
        this.parceiroId.set(id);
        this.carregarDados();
      } else {
        this.showErrorMessage('ID do parceiro inválido');
        this.voltarParaLista();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (!this.parceiroForm.valid) {
      this.markAllFieldsAsTouched();
      this.showWarningMessage('Por favor, preencha todos os campos obrigatórios corretamente');
      return;
    }
    this.salvarParceiro();
  }

  voltarParaLista(): void {
    this.router.navigate(['/parceiros']);
  }

  // Field validation helpers
  isCampoInvalido(campo: string): boolean {
    const control = this.parceiroForm.get(campo);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  isCampoValido(campo: string): boolean {
    const control = this.parceiroForm.get(campo);
    return !!(control?.valid && control.value && (control.dirty || control.touched));
  }

  getMensagemErro(campo: string): string {
    const control = this.parceiroForm.get(campo);
    if (!control?.errors) return '';

    const { errors } = control;

    if (errors['required']) return 'Este campo é obrigatório';
    if (errors['email']) return 'Digite um email válido';
    if (errors['pattern']) {
      if (campo === 'cnpj') return 'CNPJ deve estar no formato 00.000.000/0000-00';
      if (campo === 'telefone') return 'Telefone deve estar no formato (00) 00000-0000';
    }
    if (errors['minlength']) {
      const minLength = errors['minlength'].requiredLength;
      return `Mínimo de ${minLength} caracteres`;
    }

    return 'Campo inválido';
  }

  // Mask formatters
  formatarCnpj(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      this.parceiroForm.get('cnpj')?.setValue(value);
    }
  }

  formatarTelefone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
      this.parceiroForm.get('telefone')?.setValue(value);
    }
  }

  validateEmail(): void {
    const control = this.parceiroForm.get('email');
    if (control?.value) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  // Private methods
  private carregarDados(): void {
    this.carregando.set(true);

    const parceiroId = this.parceiroId();
    if (!parceiroId) {
      this.carregando.set(false);
      return;
    }

    forkJoin({
      parceiro: this.parceiroService.getParceiroById(parceiroId),
      responsaveis: this.usuarioService.getUsuariosResponsaveis()
    }).pipe(
      finalize(() => this.carregando.set(false)),
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ parceiro, responsaveis }) => {
        this.parceiro.set(parceiro);
        this.responsaveis.set(responsaveis);
        this.preencherFormulario(parceiro);
      },
      error: (error) => {
        this.handleError('Erro ao carregar dados do parceiro', error);
        this.voltarParaLista();
      }
    });
  }

  private preencherFormulario(parceiro: Parceiro): void {
    this.parceiroForm.patchValue({
      nome_fantasia: parceiro.nome_fantasia,
      razao_social: parceiro.razao_social,
      cnpj: parceiro.cnpj,
      email: parceiro.email,
      telefone: parceiro.telefone,
      responsavel_id: parceiro.responsavel_id,
      status: parceiro.status
    });
  }

  private salvarParceiro(): void {
    const id = this.parceiroId();
    if (!id) return;

    this.salvando.set(true);
    
    const dadosAtualizacao: ParceiroUpdateRequest = this.parceiroForm.value;

    this.parceiroService.updateParceiro(id, dadosAtualizacao).pipe(
      finalize(() => this.salvando.set(false)),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (parceiroAtualizado) => {
        this.showSuccessMessage(`Parceiro "${parceiroAtualizado.nome_fantasia}" atualizado com sucesso`);
        setTimeout(() => this.voltarParaLista(), 1500);
      },
      error: (error) => this.handleError('Erro ao atualizar parceiro', error)
    });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.parceiroForm.controls).forEach(key => {
      this.parceiroForm.get(key)?.markAsTouched();
    });
  }

  private handleError(summary: string, error: any): void {
    const detail = error?.message || error?.error?.message || 'Erro interno do servidor';
    this.showErrorMessage(detail, summary);
    console.error(summary, error);
  }

  private showSuccessMessage(detail: string, summary: string = 'Sucesso'): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 5000
    });
  }

  private showErrorMessage(detail: string, summary: string = 'Erro'): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 7000
    });
  }

  private showWarningMessage(detail: string, summary: string = 'Atenção'): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 5000
    });
  }
}
