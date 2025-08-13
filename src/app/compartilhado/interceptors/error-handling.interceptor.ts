import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, retryWhen, delayWhen, take } from 'rxjs/operators';
import { Router } from '@angular/router';

import { NotificationService } from '../servicos/notification.service';
import { AutenticacaoService } from '../servicos/autenticacao.service';

export interface RetryConfig {
  maxRetries: number;
  scalingDuration: number;
  excludedStatusCodes: number[];
}

@Injectable()
export class ErrorHandlingInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AutenticacaoService);

  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    scalingDuration: 1000,
    excludedStatusCodes: [400, 401, 403, 404, 422]
  };

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retryWhen(errors => this.retryStrategy(errors, this.defaultRetryConfig)),
      catchError((error: HttpErrorResponse) => this.handleError(error, req))
    );
  }

  private retryStrategy(errors: Observable<any>, config: RetryConfig): Observable<any> {
    return errors.pipe(
      delayWhen((error: HttpErrorResponse, index: number) => {
        // Não tentar novamente para códigos de status excluídos
        if (config.excludedStatusCodes.includes(error.status)) {
          return throwError(error);
        }

        // Não tentar novamente se excedeu o máximo de tentativas
        if (index >= config.maxRetries) {
          return throwError(error);
        }

        // Delay exponencial: 1s, 2s, 4s, etc.
        const delayTime = config.scalingDuration * Math.pow(2, index);
        
        console.log(`Tentativa ${index + 1} de ${config.maxRetries} em ${delayTime}ms para ${error.url}`);
        
        return timer(delayTime);
      }),
      take(config.maxRetries)
    );
  }

  private handleError(error: HttpErrorResponse, request: HttpRequest<any>): Observable<never> {
    console.error('Erro HTTP capturado:', {
      url: error.url,
      status: error.status,
      message: error.message,
      error: error.error
    });

    // Tratar diferentes tipos de erro
    switch (error.status) {
      case 0:
        this.handleNetworkError();
        break;
      case 400:
        this.handleBadRequestError(error);
        break;
      case 401:
        this.handleUnauthorizedError();
        break;
      case 403:
        this.handleForbiddenError();
        break;
      case 404:
        this.handleNotFoundError(error);
        break;
      case 422:
        this.handleValidationError(error);
        break;
      case 429:
        this.handleTooManyRequestsError();
        break;
      case 500:
        this.handleInternalServerError();
        break;
      case 502:
      case 503:
      case 504:
        this.handleServerUnavailableError(error.status);
        break;
      default:
        this.handleGenericError(error);
    }

    return throwError(error);
  }

  private handleNetworkError(): void {
    this.notificationService.connectionLost();
  }

  private handleBadRequestError(error: HttpErrorResponse): void {
    const message = this.extractErrorMessage(error) || 'Requisição inválida';
    this.notificationService.error(message, 'Erro de Requisição');
  }

  private handleUnauthorizedError(): void {
    // Limpar dados de autenticação e redirecionar para login
    this.authService.logout().subscribe({
      complete: () => {
        this.notificationService.warn(
          'Sua sessão expirou. Faça login novamente.',
          'Sessão Expirada'
        );
        this.router.navigate(['/login']);
      }
    });
  }

  private handleForbiddenError(): void {
    this.notificationService.error(
      'Você não tem permissão para acessar este recurso',
      'Acesso Negado'
    );
  }

  private handleNotFoundError(error: HttpErrorResponse): void {
    // Para requisições da API, mostrar erro mais específico
    if (error.url?.includes('/api/')) {
      this.notificationService.error(
        'O recurso solicitado não foi encontrado',
        'Recurso Não Encontrado'
      );
    }
    // Para outras URLs, pode ser um erro de roteamento
  }

  private handleValidationError(error: HttpErrorResponse): void {
    const validationErrors = this.extractValidationErrors(error);
    
    if (validationErrors.length > 0) {
      const message = validationErrors.join('\n');
      this.notificationService.validationError(message);
    } else {
      this.notificationService.validationError(
        'Dados inválidos. Verifique os campos obrigatórios.'
      );
    }
  }

  private handleTooManyRequestsError(): void {
    this.notificationService.warn(
      'Muitas requisições. Tente novamente em alguns instantes.',
      'Limite Excedido'
    );
  }

  private handleInternalServerError(): void {
    this.notificationService.error(
      'Erro interno do servidor. Nossa equipe foi notificada.',
      'Erro do Servidor'
    );
  }

  private handleServerUnavailableError(status: number): void {
    const messages = {
      502: 'Servidor temporariamente indisponível',
      503: 'Serviço em manutenção',
      504: 'Tempo limite excedido'
    };

    this.notificationService.error(
      messages[status as keyof typeof messages] || 'Servidor indisponível',
      'Servidor Indisponível'
    );
  }

  private handleGenericError(error: HttpErrorResponse): void {
    const message = this.extractErrorMessage(error) || 
                   `Erro inesperado (${error.status})`;
    
    this.notificationService.error(message, 'Erro Inesperado');
  }

  private extractErrorMessage(error: HttpErrorResponse): string | null {
    // Tentar extrair mensagem de diferentes formatos de resposta
    if (typeof error.error === 'string') {
      return error.error;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.error?.error) {
      return error.error.error;
    }

    if (error.error?.detail) {
      return error.error.detail;
    }

    if (error.message) {
      return error.message;
    }

    return null;
  }

  private extractValidationErrors(error: HttpErrorResponse): string[] {
    const errors: string[] = [];

    // Formato Laravel/Symfony
    if (error.error?.errors) {
      Object.values(error.error.errors).forEach((fieldErrors: any) => {
        if (Array.isArray(fieldErrors)) {
          errors.push(...fieldErrors);
        } else if (typeof fieldErrors === 'string') {
          errors.push(fieldErrors);
        }
      });
    }

    // Formato Spring Boot
    if (error.error?.fieldErrors) {
      error.error.fieldErrors.forEach((fieldError: any) => {
        if (fieldError.defaultMessage) {
          errors.push(fieldError.defaultMessage);
        }
      });
    }

    // Formato personalizado
    if (error.error?.validation_errors) {
      if (Array.isArray(error.error.validation_errors)) {
        errors.push(...error.error.validation_errors);
      }
    }

    return errors;
  }
}
