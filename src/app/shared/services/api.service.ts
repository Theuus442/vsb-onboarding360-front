import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';

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

  private getFormDataHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // Não definir Content-Type para FormData - deixar o browser definir automaticamente
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

  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<ApiResponse<T>>(
      this.buildUrl(endpoint),
      formData,
      { headers: this.getFormDataHeaders() }
    ).pipe(
      map(response => response.data || response as any),
      catchError(this.handleError)
    );
  }

  getBlob(endpoint: string, params?: Record<string, string>): Observable<Blob> {
    return this.http.get(
      this.buildUrl(endpoint),
      {
        headers: this.getHeaders(),
        params: this.createParams(params),
        responseType: 'blob'
      }
    ).pipe(
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

  private handleError = (error: any): Observable<never> => {
    console.error('API Error:', error);
    throw error;
  };
}
