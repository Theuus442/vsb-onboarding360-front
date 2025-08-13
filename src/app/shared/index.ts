// =============================================================================
// SHARED - Index de Compatibilidade
// Re-exporta elementos do compartilhado para manter compatibilidade
// =============================================================================

// Re-exportar tudo do compartilhado para manter compatibilidade
export * from '../compartilhado';

// Manter exports específicos que podem estar sendo usados
export * from './components';
export * from './services';
export * from './models';
export * from './guards';

// Componentes específicos do shared que devem ser mantidos
export * from './layout/layout.component';

// Services específicos do shared
export * from './services/api.service';
export * from './services/auth.service';
export * from './services/dashboard.service';
export * from './services/parceiro-api.service';
export * from './services/parceiro-dashboard.service';
export * from './services/parceiro.service';
export * from './services/usuario.service';

// Models específicos do shared
export * from './models/api.model';
export * from './models/auth.model';
export * from './models/dashboard.model';
export * from './models/parceiro-api.model';
export * from './models/parceiro-dashboard.model';
export * from './models/parceiro.model';

// Guards específicos do shared
export * from './guards/admin.guard';
export * from './guards/auth.guard';
export * from './guards/parceiro.guard';

// Interceptors específicos do shared
export * from './interceptors/auth.interceptor';
