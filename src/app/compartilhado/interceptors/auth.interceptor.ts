import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AutenticacaoService } from '../servicos/autenticacao.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AutenticacaoService);

  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Apenas fazer logout em 401 se não for uma tentativa de login/logout
      // e se a resposta indica token realmente inválido
      if (error.status === 401 && token && !req.url.includes('/auth/')) {
        console.warn('Token inválido ou expirado, realizando logout...');
        authService.logout().subscribe();
      }

      return throwError(() => error);
    })
  );
};
