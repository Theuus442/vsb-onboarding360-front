import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { ApiService } from './api.service';
import {
  MeuPerfil,
  EmpresaParceiraAPI,
  DocumentoAPI,
  DocumentoUploadAPI,
  UsuarioVinculado,
  UsuarioVinculadoCreate,
  DashboardParceiroAPI,
  TipoDocumento,
  SetorDestino,
  TIPOS_DOCUMENTO,
  SETORES_DESTINO
} from '../models/parceiro-api.model';

@Injectable({
  providedIn: 'root'
})
export class ParceiroApiService {
  private readonly apiService = inject(ApiService);

  /**
   * 👤 PERFIL
   * GET /api/meu-perfil
   * Retorna informações básicas do parceiro logado (usuário, nome, email, papel)
   */
  getMeuPerfil(): Observable<MeuPerfil> {
    return this.apiService.get<MeuPerfil>('/meu-perfil');
  }

  /**
   * GET /api/parceiro/me
   * Retorna dados completos da empresa parceira (razão social, CNPJ, status, data de criação, etc.)
   */
  getDadosEmpresa(): Observable<EmpresaParceiraAPI> {
    return this.apiService.get<EmpresaParceiraAPI>('/parceiro/me');
  }

  /**
   * 📂 DOCUMENTOS
   * GET /api/documentos
   * Retorna todos os documentos enviados pelo parceiro autenticado
   */
  getDocumentos(): Observable<DocumentoAPI[]> {
    return this.apiService.get<DocumentoAPI[]>('/documentos');
  }

  /**
   * POST /api/documentos
   * Faz upload de um documento vinculado ao parceiro logado
   * Body: FormData com arquivo, nome, tipo, setor_destino
   */
  uploadDocumento(documento: DocumentoUploadAPI): Observable<DocumentoAPI> {
    const formData = new FormData();
    formData.append('arquivo', documento.arquivo);
    formData.append('nome', documento.nome);
    formData.append('tipo', documento.tipo);
    formData.append('setor_destino', documento.setor_destino);

    return this.apiService.postFormData<DocumentoAPI>('/documentos', formData);
  }

  /**
   * GET /api/documentos/{id}/download
   * Baixa o documento pelo ID
   */
  downloadDocumento(id: number): Observable<Blob> {
    return this.apiService.getBlob(`/documentos/${id}/download`);
  }

  /**
   * 👥 USUÁRIOS VINCULADOS
   * GET /api/parceiro/usuarios
   * Lista todos os usuários vinculados à empresa parceira
   */
  getUsuariosVinculados(): Observable<UsuarioVinculado[]> {
    return this.apiService.get<UsuarioVinculado[]>('/parceiro/usuarios');
  }

  /**
   * POST /api/parceiro/usuarios
   * Adiciona um novo usuário à empresa parceira
   */
  criarUsuario(usuario: UsuarioVinculadoCreate): Observable<UsuarioVinculado> {
    return this.apiService.post<UsuarioVinculado>('/parceiro/usuarios', usuario);
  }

  /**
   * DELETE /api/parceiro/usuarios/{usuarioId}
   * Remove usuário vinculado à empresa parceira pelo ID
   */
  removerUsuario(usuarioId: number): Observable<void> {
    return this.apiService.delete<void>(`/parceiro/usuarios/${usuarioId}`);
  }

  /**
   * Método combinado para carregar todos os dados do dashboard
   */
  getDashboardCompleto(): Observable<DashboardParceiroAPI> {
    return forkJoin({
      perfil: this.getMeuPerfil(),
      empresa: this.getDadosEmpresa(),
      documentos: this.getDocumentos(),
      usuarios: this.getUsuariosVinculados()
    }).pipe(
      map(({ perfil, empresa, documentos, usuarios }) => ({
        perfil,
        empresa,
        documentos,
        usuarios
      }))
    );
  }

  /**
   * Métodos utilitários
   */
  getTiposDocumento(): TipoDocumento[] {
    return [...TIPOS_DOCUMENTO];
  }

  getSetoresDestino(): SetorDestino[] {
    return [...SETORES_DESTINO];
  }

  /**
   * Download seguro de documento com tratamento de erro
   */
  downloadDocumentoSeguro(documento: DocumentoAPI): Observable<void> {
    return new Observable(observer => {
      this.downloadDocumento(documento.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = documento.arquivo;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          observer.next();
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
