import { Injectable } from '@angular/core';

export interface ErrorInfo {
  message: string;
  details?: string;
  status?: number;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  
  /**
   * Handle and log errors with proper formatting
   */
  handleError(context: string, error: any): ErrorInfo {
    const errorInfo: ErrorInfo = {
      message: 'Erro desconhecido',
      details: '',
      status: 0,
      timestamp: new Date().toISOString()
    };

    // Extract error information
    if (error?.message) {
      errorInfo.message = error.message;
    }
    if (error?.details) {
      errorInfo.details = error.details;
    }
    if (error?.status) {
      errorInfo.status = error.status;
    }

    // Log error with context
    console.group(`🚨 ${context}`);
    console.error('Message:', errorInfo.message);
    if (errorInfo.details) {
      console.error('Details:', errorInfo.details);
    }
    if (errorInfo.status) {
      console.error('Status:', errorInfo.status);
    }
    console.error('Timestamp:', errorInfo.timestamp);
    console.error('Full Error:', error);
    console.groupEnd();

    return errorInfo;
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }
    
    if (error?.details) {
      return error.details;
    }

    if (error?.status) {
      switch (error.status) {
        case 0:
          return 'Servidor indisponível. Verifique sua conexão.';
        case 400:
          return 'Dados inválidos fornecidos.';
        case 401:
          return 'Sessão expirada. Faça login novamente.';
        case 403:
          return 'Você não tem permissão para esta ação.';
        case 404:
          return 'Recurso não encontrado.';
        case 422:
          return 'Dados fornecidos são inválidos.';
        case 500:
          return 'Erro interno do servidor. Tente novamente.';
        default:
          return `Erro ${error.status}. Tente novamente.`;
      }
    }

    return 'Erro inesperado. Tente novamente.';
  }

  /**
   * Check if error is a network/connection error
   */
  isNetworkError(error: any): boolean {
    return error?.status === 0 || !navigator.onLine;
  }

  /**
   * Check if error requires re-authentication
   */
  requiresReauth(error: any): boolean {
    return error?.status === 401;
  }
}
