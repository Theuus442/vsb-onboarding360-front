import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario, RespostaPaginada, UsuarioCreateRequest, UsuarioUpdateRequest, UsuarioFilter, DepartamentoOption, EstatisticasUsuarios } from '../modelos';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiService = inject(ApiService);

  getUsuarios(
    page: number = 1,
    perPage: number = 15,
    search: string = '',
    parceiroId?: number
  ): Observable<RespostaPaginada<Usuario>> {
    const params: Record<string, string> = { page: page.toString() };
    if (parceiroId) {
      params['parceiro_id'] = parceiroId.toString();
    }
    if (search) {
      params['search'] = search;
    }

    return this.apiService.get<RespostaPaginada<Usuario>>('/usuarios', params);
  }

  getUsuario(id: string): Observable<Usuario> {
    return this.apiService.get<Usuario>(`/usuarios/${id}`);
  }

  /**
   * Listar emails dos usuários para dropdown
   */
  listarEmails(): Observable<any> {
    return this.apiService.get<any>('/usuarios/emails');
  }

  createUsuario(usuario: UsuarioCreateRequest): Observable<Usuario> {
    // Mapear campos para o formato da API
    const usuarioData = {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      papel: usuario.papel, // "admin", "interno", "parceiro"
      departamento: usuario.departamento || '',
      parceiro_id: usuario.parceiro_id || undefined
    };

    return this.apiService.post<Usuario>('/usuarios', usuarioData);
  }

  updateUsuario(id: string, usuario: UsuarioUpdateRequest): Observable<Usuario> {
    // Mapear campos para o formato da API
    const usuarioData = {
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      departamento: usuario.departamento || ''
    };

    return this.apiService.put<Usuario>(`/usuarios/${id}`, usuarioData);
  }

  deleteUsuario(id: string): Observable<void> {
    return this.apiService.delete<void>(`/usuarios/${id}`);
  }

  toggleStatusUsuario(id: string): Observable<Usuario> {
    return this.apiService.patch<Usuario>(`/usuarios/${id}/toggle-status`);
  }

  getUsuariosResponsaveis(): Observable<any[]> {
    return this.apiService.get<any[]>('/usuarios/responsaveis');
  }

  getDepartamentos(): Observable<DepartamentoOption[]> {
    return this.apiService.get<DepartamentoOption[]>('/departamentos');
  }

  getEstatisticas(): Observable<EstatisticasUsuarios> {
    return this.apiService.get<EstatisticasUsuarios>('/usuarios/estatisticas');
  }

  updateStatus(id: string | number, status: string): Observable<Usuario> {
    return this.apiService.patch<Usuario>(`/usuarios/${id}/status`, { status });
  }

}
