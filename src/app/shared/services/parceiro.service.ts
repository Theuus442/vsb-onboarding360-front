import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Parceiro, RespostaPaginada, Usuario, UsuarioResponsavel, DefinirResponsavelRequest, ParceiroCreateRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ParceiroService {
  private readonly apiService = inject(ApiService);

  getParceiros(
    page: number = 1, 
    perPage: number = 15, 
    search: string = ''
  ): Observable<RespostaPaginada<Parceiro>> {
    const params = { page: page.toString(), per_page: perPage.toString() };
    if (search) {
      Object.assign(params, { search });
    }
    return this.apiService.get<RespostaPaginada<Parceiro>>('/parceiros', params);
  }

  getParceiro(id: string): Observable<Parceiro> {
    return this.apiService.get<Parceiro>(`/parceiros/${id}`);
  }

  createParceiro(parceiro: ParceiroCreateRequest): Observable<Parceiro> {
    return this.apiService.post<Parceiro>('/parceiros', parceiro);
  }

  updateParceiro(id: string, parceiro: Partial<Parceiro>): Observable<Parceiro> {
    return this.apiService.put<Parceiro>(`/parceiros/${id}`, parceiro);
  }

  deleteParceiro(id: string): Observable<void> {
    return this.apiService.delete<void>(`/parceiros/${id}`);
  }

  toggleStatus(id: string): Observable<Parceiro> {
    return this.apiService.patch<Parceiro>(`/parceiros/${id}/toggle-status`);
  }

  // Métodos para Administrador Geral gerenciar usuários responsáveis dos parceiros

  /**
   * Lista usuários (responsáveis) de um parceiro - Exclusivo para Administrador Geral
   * GET /api/parceiros/{id}/usuarios
   */
  getUsuariosParceiro(parceiroId: string): Observable<UsuarioResponsavel[]> {
    return this.apiService.get<UsuarioResponsavel[]>(`/parceiros/${parceiroId}/usuarios`);
  }

  /**
   * Altera o responsável principal do parceiro - Exclusivo para Administrador Geral
   * PUT /api/parceiros/{id}/responsavel
   */
  alterarResponsavelPrincipal(parceiroId: string, request: DefinirResponsavelRequest): Observable<Parceiro> {
    return this.apiService.put<Parceiro>(`/parceiros/${parceiroId}/responsavel`, request);
  }
}
