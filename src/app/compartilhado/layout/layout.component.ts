import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AutenticacaoService } from '../servicos/autenticacao.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout-container">
      <header class="layout-header">
        <div class="header-content">
          <div class="header-brand">
            <h1 class="brand-title">VSB Onboard360</h1>
          </div>
          
          <nav class="header-nav">
            <a routerLink="/painel" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
              <i class="pi pi-home"></i>
              Dashboard
            </a>
            @if (isAdmin()) {
              <a routerLink="/usuarios" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}" class="nav-link">
                <i class="pi pi-users"></i>
                Usuários
              </a>
              <a routerLink="/parceiros" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}" class="nav-link">
                <i class="pi pi-building"></i>
                Parceiros
              </a>
              <a routerLink="/admin/documentos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
                <i class="pi pi-folder"></i>
                Gestão de Documentos
              </a>
            } @else {
              <a routerLink="/documentos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}" class="nav-link">
                <i class="pi pi-file"></i>
                Documentos
              </a>
            }
          </nav>

          <div class="header-actions">
            @if (currentUser$ | async; as user) {
              <div class="user-info">
                <span class="user-name">{{ user.nome }}</span>
                <span class="user-role">{{ getRoleLabel(user.papel) }}</span>
              </div>
            } @else {
              <div class="user-info">
                <span class="user-name">Usuário Temporário</span>
                <span class="user-role">ADMIN</span>
              </div>
            }
            <button class="logout-btn" (click)="logout()">
              <i class="pi pi-sign-out"></i>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main class="layout-main">
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .layout-header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(20px);
    }

    .header-content {
      display: flex;
      align-items: center;
      padding: 1rem 2rem;
      max-width: 100%;
      margin: 0 auto;
    }

    .header-brand {
      margin-right: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .brand-title {
      font: 700 1.5rem 'Inter', sans-serif;
      color: #ffffff;
      margin: 0;
      background: linear-gradient(135deg, #A52831 0%, #C73E1D 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }


    .header-nav {
      display: flex;
      gap: 1rem;
      flex: 1;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      font: 500 0.875rem 'Inter', sans-serif;
    }

    .nav-link:hover,
    .nav-link.active {
      background: rgba(165, 40, 49, 0.2);
      color: #ffffff;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-left: auto;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-right: 1rem;
    }

    .user-name {
      font: 600 0.875rem 'Inter', sans-serif;
      color: #ffffff;
    }

    .user-role {
      font: 400 0.75rem 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border-radius: 0.5rem;
      font: 500 0.875rem 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .logout-btn:hover {
      background: #ef4444;
      color: white;
    }

    .layout-main {
      flex: 1;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }

      .header-nav {
        order: 3;
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
      }

      .nav-link {
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
      }

      .header-actions {
        order: 2;
        margin-left: 0;
      }

      .user-info {
        margin-right: 0;
        align-items: center;
        text-align: center;
      }
    }
  `]
})
export class LayoutComponent {
  private readonly authService = inject(AutenticacaoService);
  private readonly router = inject(Router);

  protected readonly currentUser$ = this.authService.currentUser$;

  logout(): void {
    this.authService.logout().subscribe();
  }

  isAdmin(): boolean {
    const user = this.authService.getUsuarioAtual();
    const token = this.authService.getToken();

    // Se há token mas ainda não carregou o usuário, assumir admin
    if (token && !user) {
      return true;
    }

    // Se tem usuário, verificar papel
    if (user) {
      return user.papel === 'admin' || user.papel === 'admin_parceiro';
    }

    // Se há token (mesmo sem usuário), mostrar menu admin
    return !!token;
  }

  getRoleLabel(papel?: string): string {
    const roleLabels: Record<string, string> = {
      'admin': 'Administrador',
      'parceiro': 'Parceiro',
      'admin_parceiro': 'Admin Parceiro',
      'interno': 'Interno'
    };
    return roleLabels[papel || ''] || papel || '';
  }
}
