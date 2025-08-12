import { Component, OnInit, signal, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

// Compartilhado
import { LayoutComponent } from '../../../../../compartilhado/layout/layout.component';
import { CarregandoComponent } from '../../../../../compartilhado/componentes/carregando/carregando.component';

// Models e Services
import { Parceiro, ParceiroUpdateRequest, Usuario } from '../../../../../compartilhado/modelos';
import { ParceiroService, UsuarioService } from '../../../../../compartilhado/servicos';

@Component({
  selector: 'app-editar-parceiro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    ProgressSpinnerModule,
    LayoutComponent,
    CarregandoComponent
  ],
  providers: [MessageService],
  templateUrl: './editar-parceiro.component.html',
  styleUrls: ['./editar-parceiro.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EditarParceiroComponent implements OnInit {
  // Injeção de dependências
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly parceiroService = inject(ParceiroService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly messageService = inject(MessageService);

  // Signals
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly parceiro = signal<Parceiro | null>(null);
  readonly responsaveis = signal<Usuario[]>([]);
  readonly parceiroId = signal<number | null>(null);

  // Formulário
  parceiroForm: FormGroup;

  // Opções de status
  readonly statusOptions = [
    { label: 'Ativo', value: 'ativo' },
    { label: 'Inativo', value: 'inativo' },
    { label: 'Suspenso', value: 'suspenso' }
  ];

  constructor() {
    this.parceiroForm = this.formBuilder.group({
      nome_fantasia: ['', [Validators.required, Validators.minLength(2)]],
      razao_social: ['', [Validators.required, Validators.minLength(2)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      responsavel_id: ['', [Validators.required]],
      status: ['ativo', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id && !isNaN(id)) {
        this.parceiroId.set(id);
        this.carregarDados();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'ID do parceiro inválido'
        });
        this.voltarParaLista();
      }
    });
  }

  private carregarDados(): void {
    this.carregando.set(true);
    
    // Carregar dados do parceiro e responsáveis em paralelo
    Promise.all([
      this.carregarParceiro(),
      this.carregarResponsaveis()
    ]).finally(() => {
      this.carregando.set(false);
    });
  }

  private carregarParceiro(): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = this.parceiroId();
      if (!id) {
        reject('ID não fornecido');
        return;
      }

      this.parceiroService.getParceiroById(id).subscribe({
        next: (parceiro: Parceiro) => {
          this.parceiro.set(parceiro);
          this.preencherFormulario(parceiro);
          resolve();
        },
        error: (error: any) => {
          console.error('Erro ao carregar parceiro:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar os dados do parceiro'
          });
          reject(error);
        }
      });
    });
  }

  private carregarResponsaveis(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.usuarioService.getUsuariosResponsaveis().subscribe({
        next: (usuarios: Usuario[]) => {
          this.responsaveis.set(usuarios);
          resolve();
        },
        error: (error: any) => {
          console.error('Erro ao carregar responsáveis:', error);
          // N��o bloqueia o carregamento se não conseguir carregar responsáveis
          this.responsaveis.set([]);
          resolve();
        }
      });
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

  onSubmit(): void {
    if (this.parceiroForm.valid) {
      this.salvarParceiro();
    } else {
      this.marcarCamposComoTocados();
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha todos os campos obrigatórios corretamente'
      });
    }
  }

  private salvarParceiro(): void {
    const id = this.parceiroId();
    if (!id) return;

    this.salvando.set(true);
    
    const dadosAtualizacao: ParceiroUpdateRequest = this.parceiroForm.value;

    this.parceiroService.updateParceiro(id, dadosAtualizacao).subscribe({
      next: (parceiroAtualizado: Parceiro) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Parceiro "${parceiroAtualizado.nome_fantasia}" atualizado com sucesso`
        });

        setTimeout(() => {
          this.voltarParaLista();
        }, 1500);
      },
      error: (error: any) => {
        console.error('Erro ao salvar parceiro:', error);
        
        let mensagemErro = 'Erro ao atualizar parceiro';
        if (error?.message) {
          mensagemErro = error.message;
        } else if (error?.error) {
          mensagemErro = error.error;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: mensagemErro
        });
        this.salvando.set(false);
      }
    });
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.parceiroForm.controls).forEach(key => {
      this.parceiroForm.get(key)?.markAsTouched();
    });
  }

  voltarParaLista(): void {
    this.router.navigate(['/parceiros']);
  }

  // Getters para validação
  get nomeFantasiaInvalido(): boolean {
    const control = this.parceiroForm.get('nome_fantasia');
    return !!(control && control.invalid && control.touched);
  }

  get razaoSocialInvalida(): boolean {
    const control = this.parceiroForm.get('razao_social');
    return !!(control && control.invalid && control.touched);
  }

  get cnpjInvalido(): boolean {
    const control = this.parceiroForm.get('cnpj');
    return !!(control && control.invalid && control.touched);
  }

  get emailInvalido(): boolean {
    const control = this.parceiroForm.get('email');
    return !!(control && control.invalid && control.touched);
  }

  get telefoneInvalido(): boolean {
    const control = this.parceiroForm.get('telefone');
    return !!(control && control.invalid && control.touched);
  }

  get responsavelInvalido(): boolean {
    const control = this.parceiroForm.get('responsavel_id');
    return !!(control && control.invalid && control.touched);
  }

  // Getters para opções dos dropdowns
  get responsaveisOptions() {
    const options = this.responsaveis().map(usuario => ({
      label: usuario.nome,
      value: usuario.id
    }));
    console.log('Responsáveis options:', options);
    return options;
  }

  // Formatação automática
  onCnpjInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      this.parceiroForm.get('cnpj')?.setValue(value);
    }
  }

  onTelefoneInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
      this.parceiroForm.get('telefone')?.setValue(value);
    }
  }
}
