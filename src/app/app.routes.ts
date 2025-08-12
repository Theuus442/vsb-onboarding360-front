import { Routes } from '@angular/router';
import { authGuard, adminGuard, parceiroGuard } from './compartilhado/guardas';

export const routes: Routes = [
  { path: '', redirectTo: '/painel', pathMatch: 'full' },

  // Autenticação
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  
  // Módulos lazy-loaded
  {
    path: 'admin',
    loadChildren: () => import('./modulos/admin/admin.module').then(m => m.AdminModule),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/documentos',
    loadComponent: () => import('./modulos/admin/paginas/gestao-documentos/gestao-documentos.component').then(m => m.GestaoDocumentosComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'parceiro',
    loadChildren: () => import('./modulos/parceiro/parceiro.module').then(m => m.ParceiroModule),
    canActivate: [parceiroGuard]
  },
  {
    path: 'documentos',
    loadChildren: () => import('./modulos/documentos/documentos.module').then(m => m.DocumentosModule),
    canActivate: [authGuard]
  },
  
  // Rotas diretas (compatibilidade)
  {
    path: 'painel',
    loadComponent: () => import('./modulos/admin/paginas/painel-admin/painel-admin.component').then(m => m.PainelAdminComponent),
    canActivate: [authGuard]
  },
  {
    path: 'painel-parceiro',
    loadComponent: () => import('./modules/partner/pages/partner-dashboard/partner-dashboard-redesign.component').then(m => m.PartnerDashboardRedesignComponent),
    canActivate: [parceiroGuard]
  },
  {
    path: 'dashboard',
    redirectTo: '/painel',
    pathMatch: 'full'
  },
  {
    path: 'parceiros',
    loadComponent: () => import('./modulos/admin/paginas/empresas/admin-empresas.component').then(m => m.AdminEmpresasComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'parceiros/novo',
    loadComponent: () => import('./modulos/admin/paginas/empresas/novo-parceiro/novo-parceiro.component').then(m => m.NovoParceiroComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'parceiros/:id/editar',
    loadComponent: () => import('./modulos/admin/paginas/empresas/editar-parceiro/editar-parceiro.component').then(m => m.EditarParceiroComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'parceiros/:id/usuarios/:nome',
    loadComponent: () => import('./modulos/admin/paginas/empresas/usuarios-parceiro/usuarios-parceiro.component').then(m => m.UsuariosParceiroComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./modulos/admin/paginas/usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'usuarios/novo',
    loadComponent: () => import('./modulos/admin/paginas/usuarios/novo-usuario/novo-usuario.component').then(m => m.NovoUsuarioComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'usuarios/:id/editar',
    loadComponent: () => import('./modulos/admin/paginas/usuarios/editar-usuario/editar-usuario.component').then(m => m.EditarUsuarioComponent),
    canActivate: [adminGuard]
  },
  
  // Redirecionamentos
  {
    path: 'empresas',
    redirectTo: '/parceiros',
    pathMatch: 'full'
  },
  
  // Fallback
  { path: '**', redirectTo: '/painel' }
];
