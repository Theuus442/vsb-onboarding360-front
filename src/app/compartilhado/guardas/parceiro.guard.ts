import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AutenticacaoService } from '../servicos/autenticacao.service';

export const parceiroGuard: CanActivateFn = (route, state) => {
  const authService = inject(AutenticacaoService);
  const router = inject(Router);

  // Verificar autenticação primeiro
  if (!authService.isLoggedIn() && !authService.getToken()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Se há token, permitir acesso (validação de papel pode ser feita depois)
  const token = authService.getToken();
  if (token) {
    return true;
  }

  const currentUser = authService.getUsuarioAtual();
  if (currentUser?.papel === 'parceiro' || currentUser?.papel === 'admin_parceiro') {
    return true;
  }

  router.navigate(['/painel']);
  return false;
};
