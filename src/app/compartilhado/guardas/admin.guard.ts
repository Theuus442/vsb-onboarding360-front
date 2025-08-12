import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AutenticacaoService } from '../servicos/autenticacao.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AutenticacaoService);
  const router = inject(Router);

  // Verificar se usuário está autenticado
  if (!authService.isLoggedIn() && !authService.getToken()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Se há token, verificar papel do usuário
  const currentUser = authService.getUsuarioAtual();

  if (currentUser?.papel === 'admin' || currentUser?.papel === 'admin_parceiro') {
    return true;
  }

  // Se há token mas não há dados do usuário ou papel incorreto, redirecionar para painel
  if (authService.getToken()) {
    router.navigate(['/painel']);
    return false;
  }

  // Se não há token, redirecionar para login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
