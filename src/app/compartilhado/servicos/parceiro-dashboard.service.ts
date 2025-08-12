import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ParceiroDashboardService {
  private readonly apiService = inject(ApiService);

  getDashboardData(): Observable<any> {
    return this.apiService.get('/parceiro/dashboard');
  }

  getEstatisticas(): Observable<any> {
    return this.apiService.get('/parceiro/estatisticas');
  }

  getAtividadesRecentes(): Observable<any> {
    return this.apiService.get('/parceiro/atividades-recentes');
  }

  getDocumentosPendentes(): Observable<any> {
    return this.apiService.get('/parceiro/documentos-pendentes');
  }

  getDadosDashboard(): Observable<any> {
    return this.apiService.get('/parceiro/dashboard-completo');
  }

  getMeusDados(): Observable<any> {
    return this.apiService.get('/parceiro/meus-dados');
  }

  criarUsuario(usuario: any): Observable<any> {
    return this.apiService.post('/parceiro/usuarios', usuario);
  }

  downloadDocumento(documento: any): Observable<any> {
    return this.apiService.get(`/documentos/${documento.id}/download`);
  }

  getUrlVisualizacao(documento: any): string {
    return `/documentos/${documento.id}/visualizar`;
  }
}
