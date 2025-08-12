import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./paginas/painel-admin/painel-admin.component').then(m => m.PainelAdminComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./paginas/usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent)
      },
      {
        path: 'usuarios/novo',
        loadComponent: () => import('./paginas/usuarios/novo-usuario/novo-usuario.component').then(m => m.NovoUsuarioComponent)
      },
      {
        path: 'empresas',
        loadComponent: () => import('./paginas/empresas/admin-empresas.component').then(m => m.AdminEmpresasComponent)
      },
      {
        path: 'empresas/gerenciar',
        loadComponent: () => import('./paginas/empresas/gerenciar-empresas/gerenciar-empresas.component').then(m => m.GerenciarEmpresasComponent)
      },
      {
        path: 'empresas/novo',
        loadComponent: () => import('./paginas/empresas/novo-parceiro/novo-parceiro.component').then(m => m.NovoParceiroComponent)
      },
      {
        path: 'empresas/:id/editar',
        loadComponent: () => import('./paginas/empresas/editar-parceiro/editar-parceiro.component').then(m => m.EditarParceiroComponent)
      },
      {
        path: 'documentos',
        loadComponent: () => import('./paginas/gestao-documentos/gestao-documentos.component').then(m => m.GestaoDocumentosComponent)
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
