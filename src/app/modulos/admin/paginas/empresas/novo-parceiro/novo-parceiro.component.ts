import { Component, signal, inject, computed, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
// Removed DropdownModule - using custom dropdown
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Layout e Componentes
import { LayoutComponent } from '../../../../../compartilhado/layout/layout.component';
import { DropdownModernoComponent, DropdownOption } from '../../../../../compartilhado/componentes';

// Models e Services
import { Parceiro, ParceiroStatus, ParceiroCreateRequest } from '../../../../../compartilhado/modelos';
import { ParceiroService, UsuarioService } from '../../../../../compartilhado/servicos';

interface UsuarioOption {
  id: string;
  nome: string;
  label?: string; // Alias for compatibility
  value?: string; // Alias for id
}

// Types para melhor type safety
type StatusOption = {
  label: string;
  value: ParceiroStatus;
};

@Component({
  selector: 'app-novo-parceiro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModernoComponent,
    ButtonModule,
    ToastModule,
    LayoutComponent
  ],
  providers: [MessageService],
  templateUrl: './novo-parceiro.component.html',
  styleUrls: ['./novo-parceiro.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NovoParceiroComponent implements OnInit {
  // Injeção de dependências usando inject()
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly parceiroService = inject(ParceiroService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly servicoMensagem = inject(MessageService);

  // Signals para estado reativo
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly carregandoResponsaveis = signal(false);
  readonly responsaveis = signal<UsuarioOption[]>([]);

  // Particles array for animation
  readonly particles = Array(10).fill(0);

  // Computed para verificar se pode salvar
  readonly podeSalvar = computed(() =>
    this.formParceiro.valid && !this.salvando() && !this.carregando()
  );

  // Converter UsuarioOption para DropdownOption
  readonly responsaveisOptions = computed((): DropdownOption[] => {
    return this.responsaveis().map(usuario => ({
      label: usuario.label || usuario.nome || 'Usuário sem nome',
      value: usuario.value,
      icon: 'user',
      description: `ID: ${usuario.value}`,
      color: '#6366f1'
    }));
  });

  // Formulário
  readonly formParceiro: FormGroup;

  // Opções de dropdown - constants para melhor performance
  readonly opcoesStatus: DropdownOption[] = [
    { label: 'Ativo', value: 'Ativa', icon: 'check-circle', description: 'Empresa ativa', color: '#22c55e' },
    { label: 'Inativo', value: 'Inativa', icon: 'times-circle', description: 'Empresa inativa', color: '#ef4444' },
    { label: 'Suspenso', value: 'Pendente', icon: 'pause-circle', description: 'Aguardando aprovação', color: '#f59e0b' }
  ] as const;

  constructor() {
    this.formParceiro = this.fb.group({
      nome_fantasia: ['', [Validators.required, Validators.minLength(2)]],
      razao_social: ['', [Validators.required, Validators.minLength(2)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      status: ['Ativa', Validators.required],
      responsavel_id: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.carregarResponsaveis();
    this.carregarRascunho();
  }

  private carregarResponsaveis(): void {
    this.carregandoResponsaveis.set(true);
    
    this.usuarioService.getUsuarios().subscribe({
      next: (response: any) => {
        const responsaveis = response.data || [];
        this.responsaveis.set(responsaveis);
        this.carregandoResponsaveis.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar responsáveis:', JSON.stringify(erro, null, 2));

        let mensagem = erro?.message;
        let severidade: 'error' | 'warn' | 'info' = 'warn';
        let titulo = 'Aviso';

        if (erro?.statusCode === 0) {
          mensagem = 'API não disponível. Verifique se o backend está rodando.';
          severidade = 'error';
          titulo = 'Erro de Conexão';
        }

        this.servicoMensagem.add({
          severity: severidade,
          summary: titulo,
          detail: mensagem,
          life: 5000
        });
        this.carregandoResponsaveis.set(false);
      }
    });
  }

  onSubmit(): void {
    if (!this.formParceiro.valid) {
      this.marcarCamposComoTocados();
      this.servicoMensagem.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha todos os campos obrigatórios corretamente'
      });
      return;
    }

    this.salvarParceiro();
  }

  private salvarParceiro(): void {
    this.salvando.set(true);

    const formValue = this.formParceiro.value;
    const dadosParceiro: ParceiroCreateRequest = {
      nome: formValue.nome || '',
      nome_fantasia: formValue.nome_fantasia,
      razao_social: formValue.razao_social,
      cnpj: formValue.cnpj || '',
      email: formValue.email || '',
      telefone: formValue.telefone || '',
      status: formValue.status,
      responsavel_id: formValue.responsavel_id
    };

    this.parceiroService.createParceiro(dadosParceiro).subscribe({
      next: (parceiroCriado) => {
        this.limparRascunho(); // Clear draft on success
        this.servicoMensagem.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Parceiro "${parceiroCriado.nome_fantasia}" criado com sucesso`
        });

        // Aguardar um momento para mostrar a mensagem e então navegar
        setTimeout(() => this.voltarParaLista(), 1500);
      },
      error: (erro) => {
        console.error('Erro ao criar parceiro:', JSON.stringify(erro, null, 2));
        const mensagem = erro?.message;
        this.servicoMensagem.add({
          severity: 'error',
          summary: 'Erro ao Criar Parceiro',
          detail: mensagem,
          life: 5000
        });
        this.salvando.set(false);
      }
    });
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.formParceiro.controls).forEach(campo => {
      this.formParceiro.get(campo)?.markAsTouched();
    });
  }

  voltarParaLista(): void {
    this.router.navigate(['/parceiros']);
  }

  // Helpers para validação com melhor type safety
  isCampoInvalido(campo: keyof ParceiroCreateRequest): boolean {
    const controle = this.formParceiro.get(campo);
    return !!(controle?.invalid && (controle.dirty || controle.touched));
  }

  getMensagemErro(campo: keyof ParceiroCreateRequest): string {
    const controle = this.formParceiro.get(campo);
    if (!controle?.errors) return '';

    const { errors } = controle;
    
    if (errors['required']) return 'Este campo é obrigatório';
    if (errors['email']) return 'Digite um email válido';
    if (errors['minlength']) {
      return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['pattern']) {
      if (campo === 'cnpj') return 'CNPJ deve estar no formato: 00.000.000/0000-00';
      if (campo === 'telefone') return 'Telefone deve estar no formato: (00) 00000-0000';
    }
    
    return 'Campo inválido';
  }

  // Enhanced UI/UX Methods
  getFormProgress(): number {
    const fields = ['nome_fantasia', 'razao_social', 'cnpj', 'email', 'telefone', 'status', 'responsavel_id'];
    const filledFields = fields.filter(field => {
      const control = this.formParceiro.get(field);
      return control?.value && !control.invalid;
    });
    return Math.round((filledFields.length / fields.length) * 100);
  }

  getFilledFieldsCount(): number {
    const fields = ['nome_fantasia', 'razao_social', 'cnpj', 'email', 'telefone', 'status', 'responsavel_id'];
    return fields.filter(field => {
      const control = this.formParceiro.get(field);
      return control?.value && control.value.toString().trim() !== '';
    }).length;
  }

  getTotalFieldsCount(): number {
    return 7;
  }

  hasFormData(): boolean {
    return Object.values(this.formParceiro.value).some(value =>
      value !== null && value !== undefined && value !== ''
    );
  }

  isCampoValido(campo: keyof ParceiroCreateRequest): boolean {
    const controle = this.formParceiro.get(campo);
    return !!(controle?.valid && controle.value && (controle.dirty || controle.touched));
  }

  validateCnpj(): void {
    const control = this.formParceiro.get('cnpj');
    if (control?.value) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  validateEmail(): void {
    const control = this.formParceiro.get('email');
    if (control?.value) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      'Ativa': 'Ativo',
      'Inativa': 'Inativo',
      'Pendente': 'Suspenso',
      'ativo': 'Ativo',
      'inativo': 'Inativo',
      'suspenso': 'Suspenso'
    };
    return statusMap[status] || status;
  }

  getSelectedResponsavel(): UsuarioOption | null {
    const selectedId = this.formParceiro.get('responsavel_id')?.value;
    if (!selectedId) return null;
    return this.responsaveis().find(resp => (resp.value || resp.id) === selectedId) || null;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  salvarRascunho(): void {
    if (!this.hasFormData()) return;

    const rascunho = {
      ...this.formParceiro.value,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem('parceiro-rascunho', JSON.stringify(rascunho));

    this.servicoMensagem.add({
      severity: 'info',
      summary: 'Rascunho Salvo',
      detail: 'Os dados foram salvos como rascunho',
      life: 3000
    });
  }

  private carregarRascunho(): void {
    const rascunho = localStorage.getItem('parceiro-rascunho');
    if (rascunho) {
      try {
        const dados = JSON.parse(rascunho);
        delete dados.savedAt; // Remove timestamp
        this.formParceiro.patchValue(dados);
      } catch (error) {
        console.error('Erro ao carregar rascunho:', error);
      }
    }
  }

  private limparRascunho(): void {
    localStorage.removeItem('parceiro-rascunho');
  }

  // Métodos para formatação automática com melhor performance
  formatarCnpj(event: Event): void {
    const target = event.target as HTMLInputElement;
    let valor = target.value.replace(/\D/g, '');

    if (valor.length > 14) {
      valor = valor.slice(0, 14);
    }

    // Aplicar máscara
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
    valor = valor.replace(/(\d{4})(\d)/, '$1-$2');

    this.formParceiro.get('cnpj')?.setValue(valor);
  }

  formatarTelefone(event: Event): void {
    const target = event.target as HTMLInputElement;
    let valor = target.value.replace(/\D/g, '');

    if (valor.length > 11) {
      valor = valor.slice(0, 11);
    }

    // Aplicar máscara
    valor = valor.replace(/^(\d{2})(\d)/, '($1) $2');
    valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    valor = valor.replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');

    this.formParceiro.get('telefone')?.setValue(valor);
  }
}
