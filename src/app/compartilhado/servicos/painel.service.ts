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
export class PainelService {
  private readonly apiService = inject(ApiService);

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

  getResumoGeral(): Observable<any> {
    return this.apiService.get('/dashboard/estatisticas');
  }

  getMetricas(): Observable<any> {
    return this.apiService.get('/dashboard/estatisticas');
  }
}
