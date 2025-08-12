import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Layout component
import { LayoutComponent } from '../../../../compartilhado/layout/layout.component';

// Dashboard components
import {
  StatisticsGridComponent,
  ActivitiesListComponent,
  IntegrationStatusComponent,
  DocumentsTableComponent,
  QuickAccessComponent
} from '../../components';

// Models and Services
import {
  Estatistica,
  AtividadeRecente,
  DocumentoPendente,
  StatusIntegracao,
  AcessoRapido
} from '../../../../compartilhado/modelos';
import { DashboardService } from '../../../../compartilhado/servicos/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LayoutComponent,
    StatisticsGridComponent,
    ActivitiesListComponent,
    IntegrationStatusComponent,
    DocumentsTableComponent,
    QuickAccessComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);

  // Signals para estado reativo
  protected readonly estatisticas = signal<Estatistica[]>([]);
  protected readonly atividadesRecentes = signal<AtividadeRecente[]>([]);
  protected readonly statusIntegracao = signal<StatusIntegracao | null>(null);
  protected readonly documentosPendentes = signal<DocumentoPendente[]>([]);
  protected readonly loading = signal(false);
  protected readonly acessoRapido = signal<AcessoRapido[]>([]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);

    // Carregar estatísticas
    this.dashboardService.getEstatisticas().subscribe({
      next: (data: Estatistica[]) => this.estatisticas.set(data),
      error: (error: any) => console.error('Erro ao carregar estatísticas:', error)
    });

    // Carregar atividades recentes
    this.dashboardService.getAtividadesRecentes().subscribe({
      next: (data: AtividadeRecente[]) => this.atividadesRecentes.set(data),
      error: (error: any) => console.error('Erro ao carregar atividades:', error)
    });

    // Carregar documentos pendentes
    this.dashboardService.getDocumentosPendentes().subscribe({
      next: (data: DocumentoPendente[]) => this.documentosPendentes.set(data),
      error: (error: any) => console.error('Erro ao carregar documentos:', error)
    });

    // Carregar status de integração
    this.dashboardService.getStatusIntegracao().subscribe({
      next: (data: StatusIntegracao | null) => {
        this.statusIntegracao.set(data);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Erro ao carregar status de integração:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Navegar para página de todos os documentos
   */
  verTodosDocumentos(): void {
    this.router.navigate(['/documentos']);
  }

  /**
   * Ação ao clicar em card de acesso rápido
   */
  onAcessoRapidoClick(item: AcessoRapido): void {
    if (item.rota) {
      this.router.navigate([item.rota]);
    }
  }
}
