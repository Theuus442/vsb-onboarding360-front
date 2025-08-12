import { Component, signal, inject, computed, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Layout e Componentes
import { LayoutComponent } from '../../../../../compartilhado/layout/layout.component';
import { DropdownModernoComponent, DropdownOption, CarregandoComponent } from '../../../../../compartilhado/componentes';

// Models e Services
import { Usuario, UsuarioUpdateRequest, PerfilUsuario, DepartamentoOption } from '../../../../../compartilhado/modelos';
import { UsuarioService } from '../../../../../compartilhado/servicos';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    LayoutComponent,
    DropdownModernoComponent,
    CarregandoComponent
  ],
  providers: [MessageService],
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EditarUsuarioComponent implements OnInit {
  // Injeção de dependências usando inject()
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly usuarioService = inject(UsuarioService);
  private readonly servicoMensagem = inject(MessageService);

  // Signals para estado reativo
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly usuario = signal<Usuario | null>(null);
  readonly usuarioId = signal<string | null>(null);
  readonly showPassword = signal(false);

  // Particles array for animation
  readonly particles = Array(10).fill(0);

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
      papel: ['interno', Validators.required],
      departamento: ['', Validators.required],
      status: ['ativo']
    });
  }

  ngOnInit(): void {
    this.carregarUsuario();
    this.carregarRascunho();
  }

  private carregarUsuario(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.servicoMensagem.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'ID do usuário não encontrado'
      });
      this.voltarParaLista();
      return;
    }

    this.usuarioId.set(id);
    this.carregando.set(true);

    this.usuarioService.getUsuario(id).subscribe({
      next: (usuario: Usuario) => {
        console.log('✅ Usuário carregado:', usuario);
        this.usuario.set(usuario);
        this.preencherFormulario(usuario);
        this.carregando.set(false);
      },
      error: (erro: any) => {
        console.error('❌ Erro ao carregar usuário:', erro);
        this.servicoMensagem.add({
          severity: 'error',
          summary: 'Erro ao Carregar Usuário',
          detail: erro?.message || 'Não foi possível carregar os dados do usuário',
          life: 5000
        });
        this.carregando.set(false);
        this.voltarParaLista();
      }
    });
  }

  private preencherFormulario(usuario: Usuario): void {
    this.formUsuario.patchValue({
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      departamento: usuario.departamento,
      status: usuario.status || 'ativo'
    });
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
    const id = this.usuarioId();
    if (!id) return;

    this.salvando.set(true);

    const dadosUsuario: UsuarioUpdateRequest = this.formUsuario.value;

    this.usuarioService.updateUsuario(id, dadosUsuario)
      .pipe(
        finalize(() => this.salvando.set(false))
      )
      .subscribe({
        next: (usuarioAtualizado: any) => {
          this.limparRascunho(); // Clear draft on success
          this.servicoMensagem.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Usuário "${usuarioAtualizado.nome}" atualizado com sucesso`
          });

          setTimeout(() => this.voltarParaLista(), 1500);
        },
        error: (erro: any) => {
          console.error('Erro ao atualizar usuário:', erro);
          const mensagem = erro?.message || 'Erro interno do servidor';
          this.servicoMensagem.add({
            severity: 'error',
            summary: 'Erro ao Atualizar Usuário',
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

  // Helpers para validação
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
      return `Mínimo de ${minLength} caracteres`;
    }

    return 'Campo inválido';
  }

  // Enhanced UI/UX Methods
  getFormProgress(): number {
    const fields = ['nome', 'email', 'papel', 'departamento'];
    const filledFields = fields.filter(field => {
      const control = this.formUsuario.get(field);
      return control?.value && !control.invalid;
    });
    return Math.round((filledFields.length / fields.length) * 100);
  }

  getFilledFieldsCount(): number {
    const fields = ['nome', 'email', 'papel', 'departamento'];
    return fields.filter(field => {
      const control = this.formUsuario.get(field);
      return control?.value && control.value.toString().trim() !== '';
    }).length;
  }

  getTotalFieldsCount(): number {
    return 4;
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
    return !!(nome?.valid && email?.valid &&
              nome?.value && email?.value);
  }

  validateEmail(): void {
    const control = this.formUsuario.get('email');
    if (control?.value) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
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

    localStorage.setItem('usuario-edicao-rascunho', JSON.stringify(rascunho));

    this.servicoMensagem.add({
      severity: 'info',
      summary: 'Rascunho Salvo',
      detail: 'Os dados foram salvos como rascunho',
      life: 3000
    });
  }

  private carregarRascunho(): void {
    const rascunho = localStorage.getItem('usuario-edicao-rascunho');
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
    localStorage.removeItem('usuario-edicao-rascunho');
  }

}
