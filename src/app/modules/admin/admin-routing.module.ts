import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent)
      },
      {
        path: 'empresas',
        loadComponent: () => import('./pages/empresas/admin-empresas.component').then(m => m.AdminEmpresasComponent)
      },
      {
        path: 'empresas/gerenciar',
        loadComponent: () => import('./pages/empresas/gerenciar-empresas/gerenciar-empresas.component').then(m => m.GerenciarEmpresasComponent)
      },
      {
        path: 'empresas/novo',
        loadComponent: () => import('./pages/empresas/novo-parceiro/novo-parceiro.component').then(m => m.NovoParceiroComponent)
      },
      {
        path: 'empresas/:id/editar',
        loadComponent: () => import('./pages/empresas/editar-parceiro/editar-parceiro.component').then(m => m.EditarParceiroComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
