import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AutenticacaoService } from '../servicos/autenticacao.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AutenticacaoService);
  const router = inject(Router);

  // Verificar primeiro se está logado pelo signal
  if (authService.isLoggedIn()) {
    return true;
  }

  // Se não está logado, verificar se há token
  const token = authService.getToken();
  if (token) {
    return true;
  }

  // Se não há nem signal nem token, redirecionar
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
