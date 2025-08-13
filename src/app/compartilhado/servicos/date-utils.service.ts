import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {
  /**
   * Formata timestamp no formato ISO para data brasileira (DD/MM/AAAA)
   * @param timestamp - Timestamp no formato 2025-08-12T12:48:47.000000Z
   * @returns Data formatada como 12/08/2025
   */
  formatToBrazilianDate(timestamp: string | null | undefined): string {
    if (!timestamp) return '-';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  }

  /**
   * Formata timestamp para data e hora brasileira (DD/MM/AAAA HH:mm)
   * @param timestamp - Timestamp no formato 2025-08-12T12:48:47.000000Z
   * @returns Data e hora formatada como 12/08/2025 12:48
   */
  formatToBrazilianDateTime(timestamp: string | null | undefined): string {
    if (!timestamp) return '-';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  }

  /**
   * Formata timestamp para data e hora completa brasileira (DD/MM/AAAA HH:mm:ss)
   * @param timestamp - Timestamp no formato 2025-08-12T12:48:47.000000Z
   * @returns Data e hora completa formatada como 12/08/2025 12:48:47
   */
  formatToBrazilianDateTimeFull(timestamp: string | null | undefined): string {
    if (!timestamp) return '-';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '-';
    }
  }

  /**
   * Formata timestamp para formato relativo (há X minutos, há X horas, etc.)
   * @param timestamp - Timestamp no formato 2025-08-12T12:48:47.000000Z
   * @returns Formato relativo como "há 2 horas" ou "ontem"
   */
  formatToRelativeTime(timestamp: string | null | undefined): string {
    if (!timestamp) return '-';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '-';
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'há poucos segundos';
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `há ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `há ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return 'ontem';
      }
      
      if (diffInDays < 7) {
        return `há ${diffInDays} dias`;
      }
      
      // Para datas mais antigas, retorna data formatada
      return this.formatToBrazilianDate(timestamp);
    } catch {
      return '-';
    }
  }

  /**
   * Calcula dias restantes até uma data
   * @param timestamp - Timestamp da data futura
   * @returns Número de dias restantes (negativo se já passou)
   */
  getDaysUntil(timestamp: string | null | undefined): number | null {
    if (!timestamp) return null;
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return null;
      
      const now = new Date();
      const diffInTime = date.getTime() - now.getTime();
      return Math.ceil(diffInTime / (1000 * 3600 * 24));
    } catch {
      return null;
    }
  }

  /**
   * Verifica se uma data está próxima do vencimento
   * @param timestamp - Timestamp da data
   * @param daysThreshold - Número de dias para considerar "próximo" (padrão: 7)
   * @returns true se está próximo do vencimento
   */
  isExpiringSoon(timestamp: string | null | undefined, daysThreshold: number = 7): boolean {
    const days = this.getDaysUntil(timestamp);
    return days !== null && days >= 0 && days <= daysThreshold;
  }

  /**
   * Verifica se uma data já expirou
   * @param timestamp - Timestamp da data
   * @returns true se já expirou
   */
  isExpired(timestamp: string | null | undefined): boolean {
    const days = this.getDaysUntil(timestamp);
    return days !== null && days < 0;
  }

  /**
   * Formata timestamp para uso em inputs do tipo datetime-local
   * @param timestamp - Timestamp no formato ISO
   * @returns String formatada para datetime-local
   */
  formatForDateTimeInput(timestamp: string | null | undefined): string {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      // Format: YYYY-MM-DDTHH:MM
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  }

  /**
   * Formata timestamp para uso em inputs do tipo date
   * @param timestamp - Timestamp no formato ISO
   * @returns String formatada para date input (YYYY-MM-DD)
   */
  formatForDateInput(timestamp: string | null | undefined): string {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      // Format: YYYY-MM-DD
      return date.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  }

  /**
   * Converte data brasileira (DD/MM/AAAA) para ISO timestamp
   * @param dateString - Data no formato DD/MM/AAAA
   * @returns Timestamp ISO ou null se inválido
   */
  parseBrazilianDate(dateString: string): string | null {
    if (!dateString) return null;
    
    try {
      const parts = dateString.split('/');
      if (parts.length !== 3) return null;
      
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      
      const date = new Date(year, month, day);
      if (isNaN(date.getTime())) return null;
      
      return date.toISOString();
    } catch {
      return null;
    }
  }

  /**
   * Ordena array de objetos por timestamp (mais recente primeiro)
   * @param items - Array de objetos com propriedade de timestamp
   * @param timestampProperty - Nome da propriedade que contém o timestamp
   * @returns Array ordenado
   */
  sortByTimestamp<T>(items: T[], timestampProperty: keyof T): T[] {
    return [...items].sort((a, b) => {
      const timestampA = a[timestampProperty] as string;
      const timestampB = b[timestampProperty] as string;
      
      if (!timestampA || !timestampB) return 0;
      
      try {
        const dateA = new Date(timestampA);
        const dateB = new Date(timestampB);
        return dateB.getTime() - dateA.getTime();
      } catch {
        return 0;
      }
    });
  }
}
