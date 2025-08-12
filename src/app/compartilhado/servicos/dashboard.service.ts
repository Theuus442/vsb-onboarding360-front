import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError, map } from 'rxjs';
import { ApiService } from './api.service';
import {
  Estatistica,
  AtividadeRecente,
  DocumentoPendente,
  StatusIntegracao
} from '../modelos';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiService = inject(ApiService);

  getDashboardData(): Observable<any> {
    // Deprecated: Use specific endpoints instead
    return this.apiService.get<any>('/dashboard/estatisticas');
  }

  getDashboardParceiro(): Observable<any> {
    return this.apiService.get<any>('/dashboard/parceiro');
  }

  getEstatisticas(): Observable<Estatistica[]> {
    return this.apiService.get<Estatistica[]>('/dashboard/estatisticas').pipe(
      catchError(error => {
        console.error('Erro ao carregar estatísticas:', error);
        return of([]);
      })
    );
  }

  getAtividadesRecentes(): Observable<AtividadeRecente[]> {
    return this.apiService.get<AtividadeRecente[]>('/dashboard/atividades').pipe(
      catchError(error => {
        console.error('Erro ao carregar atividades:', error);
        return of([]);
      })
    );
  }

  getDocumentosPendentes(): Observable<DocumentoPendente[]> {
    return this.apiService.get<DocumentoPendente[]>('/dashboard/documentos-pendentes').pipe(
      catchError(error => {
        console.error('Erro ao carregar documentos pendentes:', error);
        return of([]);
      })
    );
  }

  getStatusIntegracao(): Observable<StatusIntegracao | null> {
    return this.apiService.get<StatusIntegracao>('/dashboard/status-integracao').pipe(
      catchError(error => {
        console.error('Erro ao carregar status de integração:', error);
        return of(null);
      })
    );
  }

}
