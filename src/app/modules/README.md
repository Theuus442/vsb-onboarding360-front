# Estrutura Modular do VSB Onboard360

## 📁 Organização dos Módulos

### 🔧 Admin Module (`/admin`)
Módulo para funcionalidades administrativas do sistema:
- **Dashboard**: Painel administrativo principal
- **Usuários**: Gestão de usuários (CRUD)
- **Empresas**: Gestão de parceiros/empresas (CRUD)

**Páginas:**
- `/admin/dashboard` - Dashboard administrativo
- `/admin/usuarios` - Lista de usuários
- `/admin/usuarios/novo` - Criar novo usuário
- `/admin/empresas` - Lista de empresas/parceiros
- `/admin/empresas/novo` - Criar novo parceiro
- `/admin/empresas/:id/editar` - Editar parceiro

### 📄 Documents Module (`/documents`)
Módulo para gestão de documentos:
- **Lista de Documentos**: Visualização e gestão de documentos
- **Upload Modal**: Componente para upload de arquivos

**Páginas:**
- `/documents/lista` - Lista de documentos

### 🤝 Partner Module (`/partner`)
Módulo específico para parceiros:
- **Dashboard do Parceiro**: Painel específico para parceiros

**Páginas:**
- `/partner/dashboard` - Dashboard do parceiro

### 🔄 Shared Module (`/shared`)
Sistema compartilhado entre todos os módulos:
- **Components**: Componentes reutilizáveis
- **Services**: Serviços de API e lógica de negócio
- **Models**: Interfaces e tipos TypeScript
- **Guards**: Guards de rota
- **Layout**: Layout principal da aplicação

## 🚀 Benefícios da Nova Estrutura

1. **Modularidade**: Cada módulo tem responsabilidades bem definidas
2. **Lazy Loading**: Módulos carregados sob demanda
3. **Manutenibilidade**: Código organizado e fácil de manter
4. **Escalabilidade**: Estrutura preparada para crescimento
5. **Reutilização**: Componentes e serviços compartilhados
6. **Clean Architecture**: Seguindo padrões modernos do Angular

## 🎯 Padrões Utilizados

- **Standalone Components**: Todos os componentes são standalone
- **Signals**: Estado reativo com Angular Signals
- **Inject Function**: Dependency injection moderna
- **Functional Guards**: Guards funcionais
- **Barrel Exports**: Exports organizados com index.ts

## 🔧 Como Usar

Para criar novos componentes, siga a estrutura:
```
modules/
  [module-name]/
    pages/
      [page-name]/
        [page-name].component.ts
    components/
      [component-name]/
        [component-name].component.ts
    [module-name].module.ts
    [module-name]-routing.module.ts
```
