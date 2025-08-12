import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { Parceiro, RespostaPaginada, UsuarioResponsavel, DefinirResponsavelRequest, ParceiroCreateRequest } from '../modelos';
import { environment } from '../../../environments/environment';

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
    const params = { page: page.toString() };
    if (search) {
      Object.assign(params, { search });
    }
    return this.apiService.get<RespostaPaginada<Parceiro>>('/parceiros', params);
  }

  getParceiro(id: string): Observable<Parceiro> {
    return this.apiService.get<Parceiro>(`/parceiros/${id}`);
  }

  createParceiro(parceiro: ParceiroCreateRequest): Observable<Parceiro> {
    // Mapeia os campos para o formato da API
    const parceiroData = {
      nome_fantasia: parceiro.nome_fantasia || parceiro.nome,
      razao_social: parceiro.razao_social || parceiro.nome,
      cnpj: parceiro.cnpj,
      email: parceiro.email,
      telefone: parceiro.telefone,
      responsavel_id: parceiro.responsavel_id
    };
    return this.apiService.post<Parceiro>('/parceiros', parceiroData);
  }

  updateParceiro(id: string | number, parceiro: any): Observable<Parceiro> {
    // Mapeia os campos para o formato da API (apenas campos atualizáveis)
    const parceiroData = {
      nome_fantasia: parceiro.nome_fantasia || parceiro.nome,
      email: parceiro.email,
      telefone: parceiro.telefone
    };
    return this.apiService.put<Parceiro>(`/parceiros/${id}`, parceiroData);
  }

  deleteParceiro(id: string | number): Observable<void> {
    return this.apiService.delete<void>(`/parceiros/${id}`);
  }

  toggleStatus(id: string | number): Observable<Parceiro> {
    return this.apiService.patch<Parceiro>(`/parceiros/${id}/toggle-status`);
  }

  updateParceiroStatus(id: string | number, status: string): Observable<Parceiro> {
    return this.apiService.patch<Parceiro>(`/parceiros/${id}/status`, { status });
  }

  getParceiroById(id: string | number): Observable<Parceiro> {
    return this.getParceiro(id.toString());
  }

  getParceiroLogado(): Observable<any> {
    return this.apiService.get<any>('/parceiro/me');
  }

  // Métodos para Administrador Geral gerenciar usuários responsáveis dos parceiros

  /**
   * Lista usuários (responsáveis) de um parceiro - Exclusivo para Administrador Geral
   * GET /api/parceiros/{id}/usuarios
   */
  getUsuariosParceiro(parceiroId: string | number): Observable<UsuarioResponsavel[]> {
    return this.apiService.get<UsuarioResponsavel[]>(`/parceiros/${parceiroId}/usuarios`);
  }

  /**
   * Altera o responsável principal do parceiro - Exclusivo para Administrador Geral
   * PUT /api/parceiros/{id}/responsavel
   */
  alterarResponsavelPrincipal(parceiroId: string | number, request: DefinirResponsavelRequest): Observable<Parceiro> {
    return this.apiService.put<Parceiro>(`/parceiros/${parceiroId}/responsavel`, request);
  }

}
