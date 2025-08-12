import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiHealthStatus {
  isOnline: boolean;
  lastCheck: Date;
  responseTime?: number;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiHealthService {
  private readonly http = inject(HttpClient);
  
  private readonly _healthStatus = new BehaviorSubject<ApiHealthStatus>({
    isOnline: false,
    lastCheck: new Date()
  });

  public readonly healthStatus$ = this._healthStatus.asObservable();
  
  // Sinal reativo para uso em componentes
  public readonly isApiOnline = signal(false);
  
  private monitoringInterval: any;

  constructor() {
    this.startMonitoring();
  }

  /**
   * Inicia o monitoramento automático da API
   */
  startMonitoring(intervalMs: number = 30000): void {
    // Verificação inicial
    this.checkApiHealth().subscribe();
    
    // Verificação periódica
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = setInterval(() => {
      this.checkApiHealth().subscribe();
    }, intervalMs);
  }

  /**
   * Para o monitoramento automático
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Verifica o status da API manualmente
   */
  checkApiHealth(): Observable<ApiHealthStatus> {
    const startTime = Date.now();
    
    return this.http.get(`${environment.apiUrl}/dashboard/estatisticas`).pipe(
      map(response => {
        const responseTime = Date.now() - startTime;
        const status: ApiHealthStatus = {
          isOnline: true, // Se chegou aqui, a API está online
          lastCheck: new Date(),
          responseTime
        };

        this.updateStatus(status);
        return status;
      }),
      catchError(error => {
        const status: ApiHealthStatus = {
          isOnline: false,
          lastCheck: new Date(),
          error: error
        };
        
        this.updateStatus(status);
        return of(status);
      })
    );
  }

  /**
   * Obtém o status atual da API
   */
  getCurrentStatus(): ApiHealthStatus {
    return this._healthStatus.value;
  }

  /**
   * Verifica se a API está online (método síncrono)
   */
  isOnline(): boolean {
    return this._healthStatus.value.isOnline;
  }

  private updateStatus(status: ApiHealthStatus): void {
    this._healthStatus.next(status);
    this.isApiOnline.set(status.isOnline);
    
    // Log para debugging
    if (!environment.production) {
      const statusText = status.isOnline ? '✅ ONLINE' : '❌ OFFLINE';
      const responseTime = status.responseTime ? ` (${status.responseTime}ms)` : '';
      console.log(`🔗 API Status: ${statusText}${responseTime}`);
    }
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
  }
}
