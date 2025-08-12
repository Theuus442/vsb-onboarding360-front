import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  Estatistica, 
  AtividadeRecente, 
  DocumentoPendente, 
  StatusIntegracao 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class PainelService {
  private readonly apiService = inject(ApiService);

  getEstatisticas(): Observable<Estatistica[]> {
    return this.apiService.get<Estatistica[]>('/dashboard/estatisticas');
  }

  getAtividadesRecentes(): Observable<AtividadeRecente[]> {
    return this.apiService.get<AtividadeRecente[]>('/dashboard/atividades');
  }

  getDocumentosPendentes(): Observable<DocumentoPendente[]> {
    return this.apiService.get<DocumentoPendente[]>('/dashboard/documentos-pendentes');
  }

  getStatusIntegracao(): Observable<StatusIntegracao> {
    return this.apiService.get<StatusIntegracao>('/dashboard/status-integracao');
  }
}
