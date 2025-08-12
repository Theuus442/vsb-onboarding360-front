import { Component, signal, inject, computed, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Layout e Componentes
import { LayoutComponent } from '../../../../../compartilhado/layout/layout.component';
import { DropdownModernoComponent, DropdownOption } from '../../../../../compartilhado/componentes';

// Models e Services
import { UsuarioCreateRequest, PerfilUsuario, DepartamentoOption } from '../../../../../compartilhado/modelos';
import { UsuarioService } from '../../../../../compartilhado/servicos';

// Types para melhor type safety
type PapelOption = {
  label: string;
  value: PerfilUsuario;
};

@Component({
  selector: 'app-novo-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    LayoutComponent,
    DropdownModernoComponent
  ],
  providers: [MessageService],
  templateUrl: './novo-usuario.component.html',
  styleUrls: ['./novo-usuario.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NovoUsuarioComponent implements OnInit {
  // Injeção de dependências usando inject()
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);
  private readonly servicoMensagem = inject(MessageService);

  // Signals para estado reativo
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly showPassword = signal(false);

  // Opções fixas de departamento
  readonly opcoesDepartamento: DropdownOption[] = [
    {
      label: 'Desenvolvimento',
      value: 'desenvolvimento',
      icon: 'desktop',
      description: 'Equipe de Desenvolvimento',
      color: '#3b82f6'
    },
    {
      label: 'Operações',
      value: 'operacoes',
      icon: 'cog',
      description: 'Operações e Infraestrutura',
      color: '#f97316'
    },
    {
      label: 'Administrativo',
      value: 'administrativo',
      icon: 'briefcase',
      description: 'Setor Administrativo',
      color: '#22c55e'
    }
  ];

  // Particles array for animation
  readonly particles = Array(10).fill(0);

  // Computed para verificar se pode salvar
  podeSalvar(): boolean {
    return this.formUsuario.valid && !this.salvando() && !this.carregando();
  }

  // Formulário
  readonly formUsuario: FormGroup;

  // Opções de dropdown - constants para melhor performance
  readonly opcoesPapel: DropdownOption[] = [
    {
      label: 'Administrador',
      value: 'admin',
      icon: 'crown',
      description: 'Acesso total ao sistema',
      color: '#ef4444'
    },
    {
      label: 'Parceiro',
      value: 'parceiro',
      icon: 'users',
      description: 'Gerencia empresas e funcionários',
      color: '#6366f1'
    },
    {
      label: 'Interno',
      value: 'interno',
      icon: 'user',
      description: 'Acesso limitado às funcionalidades',
      color: '#22c55e'
    }
  ] as const;

  constructor() {
    this.formUsuario = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      papel: ['interno', Validators.required],
      departamento: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.carregarRascunho();
  }


  onSubmit(): void {
    if (!this.formUsuario.valid) {
      this.marcarCamposComoTocados();
      this.servicoMensagem.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha todos os campos obrigatórios corretamente'
      });
      return;
    }

    this.salvarUsuario();
  }

  private salvarUsuario(): void {
    this.salvando.set(true);

    const dadosUsuario: UsuarioCreateRequest = this.formUsuario.value;

    this.usuarioService.createUsuario(dadosUsuario)
      .pipe(
        finalize(() => this.salvando.set(false))
      )
      .subscribe({
        next: (usuarioCriado: any) => {
          this.limparRascunho(); // Clear draft on success
          this.servicoMensagem.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Usuário "${usuarioCriado.nome}" criado com sucesso`
          });

          setTimeout(() => this.voltarParaLista(), 1500);
        },
        error: (erro: any) => {
          console.error('Erro ao criar usuário:', erro);
          const mensagem = erro?.message;
          this.servicoMensagem.add({
            severity: 'error',
            summary: 'Erro ao Criar Usuário',
            detail: mensagem,
            life: 5000
          });
        }
      });
  }
  private marcarCamposComoTocados(): void {
    Object.keys(this.formUsuario.controls).forEach(campo => {
      this.formUsuario.get(campo)?.markAsTouched();
    });
  }

  voltarParaLista(): void {
    this.router.navigate(['/usuarios']);
  }

  // Helpers para validação com melhor type safety
  isCampoInvalido(campo: string): boolean {
    const controle = this.formUsuario.get(campo);
    return !!(controle?.invalid && (controle.dirty || controle.touched));
  }

  getMensagemErro(campo: string): string {
    const controle = this.formUsuario.get(campo);
    if (!controle?.errors) return '';

    const { errors } = controle;

    if (errors['required']) return 'Este campo é obrigatório';
    if (errors['email']) return 'Digite um email válido';
    if (errors['minlength']) {
      const minLength = errors['minlength'].requiredLength;
      if (campo === 'senha') return `A senha deve ter pelo menos ${minLength} caracteres`;
      return `Mínimo de ${minLength} caracteres`;
    }

    return 'Campo inválido';
  }

  // Enhanced UI/UX Methods
  getFormProgress(): number {
    const fields = ['nome', 'email', 'senha', 'papel', 'departamento'];
    const filledFields = fields.filter(field => {
      const control = this.formUsuario.get(field);
      return control?.value && !control.invalid;
    });
    return Math.round((filledFields.length / fields.length) * 100);
  }

  getFilledFieldsCount(): number {
    const fields = ['nome', 'email', 'senha', 'papel', 'departamento'];
    return fields.filter(field => {
      const control = this.formUsuario.get(field);
      return control?.value && control.value.toString().trim() !== '';
    }).length;
  }

  getTotalFieldsCount(): number {
    return 5;
  }

  hasFormData(): boolean {
    return Object.values(this.formUsuario.value).some(value =>
      value !== null && value !== undefined && value !== ''
    );
  }

  isCampoValido(campo: string): boolean {
    const controle = this.formUsuario.get(campo);
    return !!(controle?.valid && controle.value && (controle.dirty || controle.touched));
  }

  isPersonalDataValid(): boolean {
    const nome = this.formUsuario.get('nome');
    const email = this.formUsuario.get('email');
    const senha = this.formUsuario.get('senha');
    return !!(nome?.valid && email?.valid && senha?.valid &&
              nome?.value && email?.value && senha?.value);
  }

  validateEmail(): void {
    const control = this.formUsuario.get('email');
    if (control?.value) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  getPasswordStrength(): number {
    const senha = this.formUsuario.get('senha')?.value || '';
    if (!senha) return 0;

    let strength = 0;
    if (senha.length >= 6) strength += 25;
    if (senha.length >= 8) strength += 25;
    if (/[A-Z]/.test(senha)) strength += 25;
    if (/[0-9]/.test(senha) || /[^A-Za-z0-9]/.test(senha)) strength += 25;

    return strength;
  }

  getPasswordStrengthLevel(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 25) return 'weak';
    if (strength <= 50) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength === 0) return '';
    if (strength <= 25) return 'Fraca';
    if (strength <= 50) return 'Média';
    return 'Forte';
  }

  getRoleLabel(role: string): string {
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'parceiro': 'Parceiro',
      'admin_parceiro': 'Admin Parceiro',
      'interno': 'Interno'
    };
    return roleMap[role] || role;
  }

  getRoleDescription(role: string): string {
    const descMap: Record<string, string> = {
      'admin': 'Acesso total ao sistema',
      'parceiro': 'Acesso específico de parceiro',
      'admin_parceiro': 'Administrador de parceiro',
      'interno': 'Usuário interno da empresa'
    };
    return descMap[role] || '';
  }

  getSelectedDepartamento(): DropdownOption | null {
    const selectedValue = this.formUsuario.get('departamento')?.value;
    if (!selectedValue) return null;
    return this.opcoesDepartamento.find(dept => dept.value === selectedValue) || null;
  }

  salvarRascunho(): void {
    if (!this.hasFormData()) return;

    const rascunho = {
      ...this.formUsuario.value,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem('usuario-rascunho', JSON.stringify(rascunho));

    this.servicoMensagem.add({
      severity: 'info',
      summary: 'Rascunho Salvo',
      detail: 'Os dados foram salvos como rascunho',
      life: 3000
    });
  }

  private carregarRascunho(): void {
    const rascunho = localStorage.getItem('usuario-rascunho');
    if (rascunho) {
      try {
        const dados = JSON.parse(rascunho);
        delete dados.savedAt; // Remove timestamp
        this.formUsuario.patchValue(dados);
      } catch (error) {
        console.error('Erro ao carregar rascunho:', error);
      }
    }
  }

  private limparRascunho(): void {
    localStorage.removeItem('usuario-rascunho');
  }

}
