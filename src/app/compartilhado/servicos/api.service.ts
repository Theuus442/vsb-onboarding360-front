import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../modelos';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl || 'http://localhost:3000/api';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  private createParams(params?: Record<string, string>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return httpParams;
  }

  get<T>(endpoint: string, params?: Record<string, string>): Observable<T> {
    return this.http.get<ApiResponse<T>>(
      this.buildUrl(endpoint),
      {
        headers: this.getHeaders(),
        params: this.createParams(params)
      }
    ).pipe(
      map(response => {
        // Para endpoints de listagem que retornam dados paginados, preservar a estrutura completa
        if (endpoint.includes('/usuarios') || endpoint.includes('/parceiros') || endpoint.includes('/documentos')) {
          return response as any; // Preservar estrutura completa {data: [...], pagination: {...}}
        }
        // Para outros endpoints, usar o comportamento anterior
        return response.data || response as any;
      }),
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(
      this.buildUrl(endpoint),
      data,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || response as any),
      catchError(this.handleError)
    );
  }

  put<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(
      this.buildUrl(endpoint),
      data,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || response as any),
      catchError(this.handleError)
    );
  }

  patch<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.patch<ApiResponse<T>>(
      this.buildUrl(endpoint),
      data,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || response as any),
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(
      this.buildUrl(endpoint),
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || response as any),
      catchError(this.handleError)
    );
  }

  getBlob(endpoint: string): Observable<Blob> {
    return this.http.get(this.buildUrl(endpoint), {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  postFile<T>(endpoint: string, formData: FormData): Observable<T> {
    // Remove Content-Type header for FormData - browser will set it automatically with boundary
    const headers = this.getHeaders().delete('Content-Type');

    return this.http.post<ApiResponse<T>>(
      this.buildUrl(endpoint),
      formData,
      { headers }
    ).pipe(
      map(response => response.data || response as any),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Erro desconhecido occurred';
    let errorDetails = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = 'Erro de conexão';
      errorDetails = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'API não está rodando';
          errorDetails = `Verifique se o servidor backend está rodando na porta 3000. Execute o comando para iniciar a API.`;
          break;
        case 400:
          errorMessage = 'Dados inválidos';
          errorDetails = error.error?.message || 'Verifique os dados enviados';
          break;
        case 401:
          errorMessage = 'Não autorizado';
          errorDetails = 'Faça login novamente';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          errorDetails = 'Você não tem permissão para esta ação';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          errorDetails = 'O item solicitado não existe';
          break;
        case 422:
          errorMessage = 'Dados inválidos';
          errorDetails = error.error?.message || 'Verifique os dados fornecidos';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          errorDetails = 'Tente novamente em alguns minutos';
          break;
        default:
          errorMessage = `Erro ${error.status}`;
          errorDetails = error.error?.message || error.message || 'Erro desconhecido';
      }
    }

    // Log detailed error for debugging
    console.group('🚨 API Error Details');
    console.error('Status:', error.status);
    console.error('Message:', errorMessage);
    console.error('Details:', errorDetails);
    console.error('URL:', error.url);
    console.error('Full Error:', error);
    console.groupEnd();

    // Return user-friendly error
    const userError = {
      message: errorMessage,
      details: errorDetails,
      status: error.status,
      timestamp: new Date().toISOString()
    };

    return throwError(() => userError);
  };
}
