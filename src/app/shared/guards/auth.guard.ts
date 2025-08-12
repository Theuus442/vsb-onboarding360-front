import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar primeiro se está logado pelo signal
  if (authService.isAuthenticatedMethod()) {
    return true;
  }

  // Se não está logado, verificar se há token válido
  if (authService.hasValidToken()) {
    return true;
  }

  // Se não há nem signal nem token válido, redirecionar
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
