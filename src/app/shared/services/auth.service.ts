import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthUser, LoginCredentials, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  private readonly isAuthenticatedSignal = signal(false);
  public readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user && !this.isTokenExpired(token)) {
      this.setAuthState(user, token);
    }
    // Não limpar automaticamente - deixar token e tentar validar
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        this.setAuthState(response.usuario, response.token);
        this.storeAuthData(response.usuario, response.token);
      })
    );
  }

  logout(): void {
    this.clearAuthState();
    this.clearStoredData();
    this.router.navigate(['/login']);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.getStoredToken();
  }

  isAuthenticatedMethod(): boolean {
    return this.isAuthenticatedSignal();
  }

  hasValidToken(): boolean {
    const token = this.getStoredToken();
    return token !== null && !this.isTokenExpired(token);
  }

  private setAuthState(user: AuthUser, token: string): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSignal.set(true);
  }

  private clearAuthState(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSignal.set(false);
  }

  private storeAuthData(user: AuthUser, token: string): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  private clearStoredData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getStoredUser(): AuthUser | null {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp;
    } catch (error) {
      return true;
    }
  }
}
