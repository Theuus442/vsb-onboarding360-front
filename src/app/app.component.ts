import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DevConfigService } from './compartilhado/servicos/dev-config.service';
import { AutenticacaoService } from './compartilhado/servicos/autenticacao.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent implements OnInit {
  title = 'VSB OnBoard360';

  private readonly devConfig = inject(DevConfigService);
  private readonly authService = inject(AutenticacaoService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.devConfig.initDevCommands();
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Deixar o sistema de autenticação gerenciar seu próprio estado
    // Os guards se encarregarão de redirecionar quando necessário
    // Não forçar redirecionamento automático no app component
  }
}
