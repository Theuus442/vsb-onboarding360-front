import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

import { ApiService } from './api.service';
import { 
  AuthUser, 
  LoginRequest, 
  LoginResponse, 
  SessionValidation 
} from '../modelos/autenticacao.model';

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  // Signals para estado reativo
  private readonly _isAuthenticated = signal(false);
  private readonly _currentUser = signal<AuthUser | null>(null);

  // BehaviorSubject para compatibilidade com código legado
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  // Getters para os signals (readonly)
  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly currentUser = this._currentUser.asReadonly();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      // Se há token, assumir como autenticado para evitar redirect
      this._isAuthenticated.set(true);

      // Tentar recuperar usuário do localStorage primeiro
      const storedUser = this.getStoredUser();
      if (storedUser) {
        this.setAuthenticatedUser(storedUser);
      }

      // Validar em background (sem bloquear navegação)
      setTimeout(() => {
        this.validateSession().subscribe({
          next: (validation) => {
            if (validation.valida && validation.usuario) {
              this.setAuthenticatedUser(validation.usuario);
              this.storeUser(validation.usuario);
            }
            // Não limpar auth automaticamente se validação falhar
          },
          error: () => {
            // Não limpar auth automaticamente em caso de erro de rede
            console.warn('Erro na validação da sessão, mantendo token');
          }
        });
      }, 500); // Delay maior para não interferir na inicialização
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Mapeia email/senha para o formato da API
    const loginData = {
      email: credentials.email,
      senha: credentials.senha
    };

    return this.apiService.post<LoginResponse>('/auth/login', loginData).pipe(
      tap(response => {
        if (response.token && response.usuario) {
          this.setAuthData(response);
        }
      }),
      catchError(error => {
        this.clearAuth();
        throw error;
      })
    );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    
    return this.apiService.post('/auth/logout', { token }).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        // Mesmo com erro, limpar dados locais
        this.clearAuth();
        this.router.navigate(['/login']);
        return of(null);
      })
    );
  }

  validateSession(): Observable<SessionValidation> {
    const token = this.getToken();
    if (!token) {
      return of({ valida: false, message: 'Token não encontrado' });
    }

    // Se há token, assumir como válido (validação será feita nos interceptors)
    // Se houver erro em alguma requisição autenticada, o interceptor fará logout
    const storedUser = this.getStoredUser();
    if (storedUser) {
      return of({ valida: true, usuario: storedUser });
    }

    // Se não há usuário armazenado mas há token, assumir válido
    return of({ valida: true, message: 'Token presente' });
  }

  // Método para compatibilidade
  getUsuarioAtual(): AuthUser | null {
    return this._currentUser();
  }

  isLoggedIn(): boolean {
    return this._isAuthenticated();
  }

  hasRole(role: string): boolean {
    const user = this._currentUser();
    return user?.papel === role;
  }

  hasPermission(permission: string): boolean {
    const user = this._currentUser();
    return user?.permissions?.includes(permission) ?? false;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setAuthData(response: LoginResponse): void {
    localStorage.setItem('auth_token', response.token);
    this.storeUser(response.usuario);
    this.setAuthenticatedUser(response.usuario);
  }

  private setAuthenticatedUser(user: AuthUser): void {
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
    this.currentUserSubject.next(user);
  }

  private clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this.currentUserSubject.next(null);
  }

  private storeUser(user: AuthUser): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  private getStoredUser(): AuthUser | null {
    try {
      const userStr = localStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.warn('Erro ao recuperar usuário do localStorage:', error);
      return null;
    }
  }
}
