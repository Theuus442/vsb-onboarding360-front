import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario, RespostaPaginada } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiService = inject(ApiService);

  getUsuarios(
    page: number = 1, 
    perPage: number = 15, 
    search: string = ''
  ): Observable<RespostaPaginada<Usuario>> {
    const params = { page: page.toString(), per_page: perPage.toString() };
    if (search) {
      Object.assign(params, { search });
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

  createUsuario(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.apiService.post<Usuario>('/usuarios', usuario);
  }

  updateUsuario(id: string, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.apiService.put<Usuario>(`/usuarios/${id}`, usuario);
  }

  deleteUsuario(id: string): Observable<void> {
    return this.apiService.delete<void>(`/usuarios/${id}`);
  }

  toggleStatusUsuario(id: string): Observable<Usuario> {
    return this.apiService.patch<Usuario>(`/usuarios/${id}/toggle-status`);
  }
}
