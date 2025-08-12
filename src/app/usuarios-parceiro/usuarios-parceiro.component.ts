import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { LayoutComponent } from '../compartilhado/layout/layout.component';
import { ParceiroService } from '../compartilhado/servicos';
import { Usuario } from '../compartilhado/modelos';

@Component({
  selector: 'app-usuarios-parceiro',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    InputTextModule,
    MessageModule,
    SkeletonModule,
    ToastModule,
    TooltipModule,
    LayoutComponent
  ],
  providers: [MessageService],
  templateUrl: './usuarios-parceiro.component.html',
  styleUrls: ['./usuarios-parceiro.component.css']
})
export class UsuariosParceiroComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly parceiroService = inject(ParceiroService);
  private readonly messageService = inject(MessageService);

  // Signals
  usuarios = signal<Usuario[]>([]);
  carregando = signal(true);
  erro = signal<string | null>(null);
  parceiroId = signal<number | null>(null);
  nomeFantasia = signal<string>('');

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      const nome = params['nome'] || '';

      if (id) {
        this.parceiroId.set(id);
        this.nomeFantasia.set(decodeURIComponent(nome));
        this.carregarUsuarios(id);
      } else {
        this.erro.set('ID do parceiro não fornecido');
        this.carregando.set(false);
      }
    });
  }

  private carregarUsuarios(parceiroId: number) {
    this.carregando.set(true);
    this.erro.set(null);

    this.parceiroService.getUsuariosParceiro(parceiroId).subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios || []);
        this.carregando.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.erro.set('Erro ao carregar usuários do parceiro');
        this.usuarios.set([]);
        this.carregando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os usuários do parceiro'
        });
      }
    });
  }

  voltarParaParceiros() {
    this.router.navigate(['/parceiros']);
  }

  getSeverityByPapel(papel: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (papel) {
      case 'admin':
        return 'danger';
      case 'admin_parceiro':
        return 'warning';
      case 'parceiro':
        return 'info';
      case 'interno':
        return 'success';
      default:
        return 'info';
    }
  }

  getPapelLabel(papel: string): string {
    const labels: Record<string, string> = {
      'admin': 'Administrador',
      'admin_parceiro': 'Admin Parceiro',
      'parceiro': 'Parceiro',
      'interno': 'Interno'
    };
    return labels[papel] || papel;
  }

  formatarData(data: string): string {
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

  recarregar() {
    const id = this.parceiroId();
    if (id) {
      this.carregarUsuarios(id);
    }
  }

  novoUsuario() {
    const parceiroId = this.parceiroId();
    if (parceiroId) {
      this.router.navigate(['/usuarios/novo'], {
        queryParams: { parceiroId: parceiroId }
      });
    }
  }

  enviarEmail(usuario: Usuario) {
    const subject = encodeURIComponent('Contato via Sistema VSB Onboard360');
    const body = encodeURIComponent(`Olá ${usuario.nome},\n\nEscreva sua mensagem aqui...\n\nAtenciosamente,\nEquipe VSB Onboard360`);
    const mailtoUrl = `mailto:${usuario.email}?subject=${subject}&body=${body}`;

    window.open(mailtoUrl, '_blank');

    this.messageService.add({
      severity: 'info',
      summary: 'Email',
      detail: `Cliente de email aberto para ${usuario.email}`
    });
  }
}
