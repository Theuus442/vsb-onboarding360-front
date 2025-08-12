import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { ApiService } from './api.service';
import {
  PerfilUsuarioParceiro,
  DadosEmpresaParceira,
  DocumentoParceiro,
  UsuarioVinculadoParceiro,
  UsuarioVinculadoCreateRequest,
  DocumentoUploadRequest,
  DadosParceiroDashboard,
  ChecklistItemParceiro,
  EstatisticasParceiro
} from '../models/parceiro-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class ParceiroDashboardService {
  private readonly apiService = inject(ApiService);

  /**
   * 👤 PERFIL
   * Retorna informações básicas do parceiro logado (usuário, nome, email, papel)
   */
  getMeuPerfil(): Observable<PerfilUsuarioParceiro> {
    return this.apiService.get<PerfilUsuarioParceiro>('/meu-perfil');
  }

  /**
   * Retorna dados completos da empresa parceira (razão social, CNPJ, status, data de criação, etc.)
   */
  getMinhaEmpresa(): Observable<DadosEmpresaParceira> {
    return this.apiService.get<DadosEmpresaParceira>('/parceiro/me');
  }

  /**
   * 📂 DOCUMENTOS
   * Lista documentos enviados pelo parceiro
   */
  getDocumentos(): Observable<DocumentoParceiro[]> {
    return this.apiService.get<DocumentoParceiro[]>('/documentos');
  }

  /**
   * Faz upload de um documento
   */
  uploadDocumento(documento: DocumentoUploadRequest): Observable<DocumentoParceiro> {
    const formData = new FormData();
    formData.append('arquivo', documento.arquivo);
    formData.append('nome', documento.nome);

    if (documento.tipo) {
      formData.append('tipo', documento.tipo);
    }

    // Para FormData, usar método específico sem Content-Type header
    return this.apiService.postFormData<DocumentoParceiro>('/documentos', formData);
  }

  /**
   * Baixa o documento pelo ID
   */
  downloadDocumento(documentoId: string): Observable<Blob> {
    return this.apiService.getBlob(`/documentos/${documentoId}/download`);
  }

  /**
   * 👥 USUÁRIOS VINCULADOS
   * Lista todos os usuários vinculados à empresa parceira
   */
  getUsuariosVinculados(): Observable<UsuarioVinculadoParceiro[]> {
    return this.apiService.get<UsuarioVinculadoParceiro[]>('/parceiro/usuarios');
  }

  /**
   * Adiciona um novo usuário à empresa parceira
   */
  criarUsuario(usuario: UsuarioVinculadoCreateRequest): Observable<UsuarioVinculadoParceiro> {
    return this.apiService.post<UsuarioVinculadoParceiro>('/parceiro/usuarios', usuario);
  }

  /**
   * Remove usuário vinculado à empresa parceira pelo ID
   */
  removerUsuario(usuarioId: string): Observable<void> {
    return this.apiService.delete<void>(`/parceiro/usuarios/${usuarioId}`);
  }

  // Métodos auxiliares para compatibilidade com o código existente

  /**
   * Método de compatibilidade - combina dados do perfil e empresa
   */
  getDadosDashboard(): Observable<DadosParceiroDashboard> {
    // Combinar as chamadas para formar o dashboard completo
    return forkJoin({
      perfil: this.getMeuPerfil(),
      empresa: this.getMinhaEmpresa(),
      documentos: this.getDocumentos(),
      usuarios: this.getUsuariosVinculados()
    }).pipe(
      map(({ perfil, empresa, documentos, usuarios }) => ({
        perfil,
        empresa,
        documentos,
        usuarios,
        checklist: [],
        estatisticas: {
          total_documentos: documentos.length,
          documentos_aprovados: documentos.filter(d => d.status === 'aprovado').length,
          documentos_pendentes: documentos.filter(d => d.status === 'pendente').length,
          documentos_rejeitados: documentos.filter(d => d.status === 'rejeitado').length,
          total_usuarios: usuarios.length,
          usuarios_ativos: usuarios.filter(u => u.status === 'ativo').length,
          progresso_onboarding: 0,
        }
      }))
    );
  }

  /**
   * Método para obter dados básicos do parceiro (compatibilidade)
   */
  getMeusDados(): Observable<DadosEmpresaParceira> {
    return this.getMinhaEmpresa();
  }

  /**
   * Método de compatibilidade para obter URL de visualização
   */
  getUrlVisualizacao(documento: DocumentoParceiro): string {
    // Construir URL baseada no ambiente/configuração
    const baseUrl = this.apiService['baseUrl'] || '';
    return `${baseUrl}/documentos/${documento.id}/view`;
  }

  /**
   * Método auxiliar para download de documento com tratamento de erro melhorado
   */
  downloadDocumentoSeguro(documento: DocumentoParceiro): Observable<Blob> {
    return this.downloadDocumento(documento.id);
  }

  /**
   * Método para obter checklist do onboarding
   */
  getChecklistOnboarding(): Observable<ChecklistItemParceiro[]> {
    return this.apiService.get<ChecklistItemParceiro[]>('/parceiro/checklist');
  }

  /**
   * Método para atualizar item do checklist
   */
  atualizarChecklistItem(itemId: string, status: string): Observable<ChecklistItemParceiro> {
    return this.apiService.patch<ChecklistItemParceiro>(`/parceiro/checklist/${itemId}`, { status });
  }
}
