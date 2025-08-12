import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { 
  Documento, 
  DocumentoFilter, 
  DocumentoCreateRequest, 
  DocumentoUpdateRequest,
  DocumentoAcaoRequest,
  RespostaPaginada 
} from '../modelos';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private readonly apiService = inject(ApiService);

  getDocumentos(
    page: number = 1,
    limit: number = 15,
    filtros?: DocumentoFilter
  ): Observable<RespostaPaginada<Documento>> {
    const params: Record<string, string> = {
      page: page.toString()
    };

    // Adicionar filtro de parceiro se fornecido
    if (filtros?.parceiro_id) {
      params['parceiro_id'] = filtros.parceiro_id.toString();
    }

    return this.apiService.get<RespostaPaginada<Documento>>('/documentos', params);
  }

  getDocumento(id: string): Observable<Documento> {
    return this.apiService.get<Documento>(`/documentos/${id}`);
  }

  createDocumento(dados: DocumentoCreateRequest): Observable<Documento> {
    // A API espera multipart/form-data para upload
    // Este método será usado quando não há arquivo
    return this.apiService.post<Documento>('/documentos', dados);
  }

  updateDocumento(id: string, dados: DocumentoUpdateRequest): Observable<Documento> {
    // A API espera apenas status: "pendente", "aprovado", "reprovado"
    const updateData = {
      status: dados.status
    };
    return this.apiService.put<Documento>(`/documentos/${id}`, updateData);
  }

  excluirDocumento(id: string): Observable<void> {
    return this.apiService.delete<void>(`/documentos/${id}`);
  }

  aprovarDocumento(id: string, dados?: DocumentoAcaoRequest): Observable<Documento> {
    return this.apiService.post<Documento>(`/documentos/${id}/aprovar`, dados || {});
  }

  rejeitarDocumento(id: string, motivo: string): Observable<Documento> {
    const dados: DocumentoAcaoRequest = { motivo };
    return this.apiService.post<Documento>(`/documentos/${id}/rejeitar`, dados);
  }

  downloadDocumento(id: string): Observable<Blob> {
    return this.apiService.getBlob(`/documentos/${id}/download`);
  }

  uploadDocumento(arquivo: File, dados: DocumentoCreateRequest): Observable<Documento> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('parceiro_id', dados.parceiro_id.toString());
    formData.append('nome', dados.nome);

    return this.apiService.postFile<Documento>('/documentos', formData);
  }

  // Métodos para estatísticas
  getEstatisticasDocumentos(): Observable<{
    total: number;
    pendentes: number;
    aprovados: number;
    rejeitados: number;
    em_analise: number;
    expirados: number;
  }> {
    return this.apiService.get('/documentos/estatisticas');
  }

  getDocumentosPorStatus(): Observable<{
    status: string;
    quantidade: number;
  }[]> {
    return this.apiService.get('/documentos/por-status');
  }

  getDocumentosPorTipo(): Observable<{
    tipo: string;
    quantidade: number;
  }[]> {
    return this.apiService.get('/documentos/por-tipo');
  }

  // Validações
  validarArquivo(arquivo: File): { valido: boolean; erro?: string } {
    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    const tamanhoMaximo = 10 * 1024 * 1024; // 10MB

    if (!tiposPermitidos.includes(arquivo.type)) {
      return {
        valido: false,
        erro: 'Tipo de arquivo não permitido. Use PDF, DOC, DOCX, JPG ou PNG.'
      };
    }

    if (arquivo.size > tamanhoMaximo) {
      return {
        valido: false,
        erro: 'Arquivo muito grande. Tamanho máximo: 10MB.'
      };
    }

    return { valido: true };
  }
}
