/**
 * Utilitário simples e robusto para ícones PrimeNG
 */

export function normalizeIconClass(icon: string | undefined | null): string {
  // Se não há ícone, usar fallback
  if (!icon || typeof icon !== 'string') {
    return 'pi pi-info-circle';
  }

  // Limpar espaços extras
  const cleanIcon = icon.trim();

  // Se já está formatado corretamente (pi pi-xxx)
  if (/^pi\s+pi-\w+/.test(cleanIcon)) {
    return cleanIcon;
  }

  // Se tem só o prefixo pi- (pi-xxx)
  if (/^pi-\w+/.test(cleanIcon)) {
    return `pi ${cleanIcon}`;
  }

  // Se é só o nome do ícone (xxx)
  if (/^\w+/.test(cleanIcon)) {
    return `pi pi-${cleanIcon}`;
  }

  // Fallback para casos problemáticos
  return 'pi pi-info-circle';
}

/**
 * Mapeia ícones que podem não existir para equivalentes válidos
 */
export function mapToValidIcon(iconClass: string): string {
  const iconMap: Record<string, string> = {
    'pi pi-user-plus': 'pi pi-user',
    'pi pi-user-minus': 'pi pi-user', 
    'pi pi-user-times': 'pi pi-user',
    'pi pi-file-edit': 'pi pi-file',
    'pi pi-file-plus': 'pi pi-file',
    'pi pi-folder-open': 'pi pi-folder',
    'pi pi-arrow-up-right': 'pi pi-arrow-up',
    'pi pi-arrow-down-right': 'pi pi-arrow-down',
    'pi pi-chart-area': 'pi pi-chart-bar',
    'pi pi-chart-column': 'pi pi-chart-bar'
  };

  return iconMap[iconClass] || iconClass;
}

/**
 * Função principal para obter classe de ícone válida
 */
export function getIconClass(icon: string | undefined | null): string {
  const normalized = normalizeIconClass(icon);
  return mapToValidIcon(normalized);
}
