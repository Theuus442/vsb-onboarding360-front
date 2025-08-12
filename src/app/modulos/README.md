# Estrutura Modular do VSB Onboard360 🇧🇷

## 📁 Organização dos Módulos (pt-BR)

### 🔧 Módulo Admin (`/admin`)
Módulo para funcionalidades administrativas do sistema:
- **Painel Admin**: Dashboard administrativo principal
- **Usuários**: Gestão de usuários (CRUD)
- **Empresas**: Gestão de parceiros/empresas (CRUD)

**Páginas:**
- `/admin/painel-admin` - Dashboard administrativo
- `/admin/usuarios` - Lista de usuários
- `/admin/usuarios/novo-usuario` - Criar novo usuário
- `/admin/empresas` - Lista de empresas/parceiros
- `/admin/empresas/novo-parceiro` - Criar novo parceiro
- `/admin/empresas/:id/editar-parceiro` - Editar parceiro

### 📄 Módulo Documentos (`/documentos`)
Módulo para gestão de documentos:
- **Lista de Documentos**: Visualização e gestão de documentos
- **Modal Upload**: Componente para upload de arquivos

**Páginas:**
- `/documentos/lista` - Lista de documentos

### 🤝 Módulo Parceiro (`/parceiro`)
Módulo específico para parceiros:
- **Painel do Parceiro**: Dashboard específico para parceiros

**Páginas:**
- `/parceiro/painel-parceiro` - Dashboard do parceiro

### 🔄 Sistema Compartilhado (`/compartilhado`)
Sistema compartilhado entre todos os módulos:
- **Componentes**: Componentes reutilizáveis
- **Serviços**: Serviços de API e lógica de negócio
- **Modelos**: Interfaces e tipos TypeScript
- **Guardas**: Guards de rota
- **Layout**: Layout principal da aplicação

## 🏗️ Estrutura de Pastas

```
src/app/
├── modulos/                      # 📁 Módulos da aplicação
│   ├── admin/                    # 🔧 Módulo Administrativo
│   │   ├── paginas/
│   │   │   ├── painel-admin/     # Dashboard admin
│   │   │   ├── usuarios/         # Gestão de usuários
│   │   │   │   ├── admin-usuarios.component.*
│   │   │   │   └── novo-usuario/ # Criar usuário
│   │   │   └── empresas/         # Gestão de empresas
│   │   │       ├── admin-empresas.component.*
│   │   │       ├── gerenciar-empresas/
│   │   │       ├── novo-parceiro/
│   │   │       └── editar-parceiro/
│   │   ├── componentes/          # Componentes específicos admin
│   │   ├── admin.module.ts
│   │   └── admin-routing.module.ts
│   ├── documentos/               # 📄 Módulo de Documentos
│   │   ├── paginas/
│   │   │   └── lista-documentos/ # Lista de documentos
│   │   ├── componentes/
│   │   │   └── modal-upload/     # Modal de upload
│   │   ├── documentos.module.ts
│   │   └── documentos-routing.module.ts
│   ├── parceiro/                 # 🤝 Módulo de Parceiro
│   │   ├── paginas/
│   │   │   └─��� painel-parceiro/  # Dashboard do parceiro
│   │   ├── parceiro.module.ts
│   │   └── parceiro-routing.module.ts
│   └── README.md                 # Documentação da estrutura
├── compartilhado/                # 🔄 Sistema Compartilhado
│   ├── componentes/              # Componentes reutilizáveis
│   ├── servicos/                 # Serviços de API
│   ├── modelos/                  # Interfaces TypeScript
│   ├── guardas/                  # Guards de rota
│   └── layout/                   # Layout principal
└── login/                        # 🔑 Login (mantido separado)
```

## 🚀 Benefícios da Nova Estrutura

1. **🏗️ Arquitetura Limpa**: Separação clara de responsabilidades
2. **⚡ Performance**: Lazy loading de módulos
3. **🔧 Manutenibilidade**: Código organizado e fácil de manter
4. **📈 Escalabilidade**: Estrutura preparada para crescimento
5. **🔄 Reutilização**: Componentes shared bem organizados
6. **🎯 Clean Code**: Seguindo best practices do Angular 19
7. **🇧🇷 Português**: Toda estrutura em português brasileiro

## 🎯 Padrões Utilizados

- **Standalone Components**: Todos os componentes são standalone
- **Signals**: Estado reativo com Angular Signals
- **Inject Function**: Dependency injection moderna
- **Functional Guards**: Guards funcionais
- **Barrel Exports**: Exports organizados com index.ts
- **Nomes em Português**: Estrutura totalmente em pt-BR

## 🔧 Como Usar

Para criar novos componentes, siga a estrutura:
```
modulos/
  [nome-do-modulo]/
    paginas/
      [nome-da-pagina]/
        [nome-da-pagina].component.ts
    componentes/
      [nome-do-componente]/
        [nome-do-componente].component.ts
    [nome-do-modulo].module.ts
    [nome-do-modulo]-routing.module.ts
```

## 🎉 Estrutura 100% em Português Brasileiro!
