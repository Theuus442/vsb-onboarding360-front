# VSB Onboard360 - Frontend 🚀

Sistema modular de onboarding desenvolvido em **Angular 19** com arquitetura limpa e padrões modernos.

## 📋 Sobre o Projeto

O VSB Onboard360 é uma plataforma completa de gerenciamento de onboarding que permite:

- **Gestão de Parceiros**: CRUD completo de empresas parceiras
- **Administração de Usuários**: Controle de acesso e permissões
- **Gestão de Documentos**: Upload, visualização e aprovação
- **Dashboards Personalizados**: Visão administrativa e do parceiro
- **Sistema de Autenticação**: Login seguro com guards

## 🏗️ Arquitetura

### Estrutura Modular em Português 🇧🇷

```
src/app/
├── modulos/                      # 📁 Módulos da Aplicação
│   ├── admin/                    # 🔧 Módulo Administrativo
│   │   ├── paginas/              # Páginas do admin
│   │   │   ├── painel-admin/     # Dashboard principal
│   │   │   ├── usuarios/         # Gestão de usuários
│   │   │   └── empresas/         # Gestão de parceiros
│   │   ├── componentes/          # Componentes específicos
│   │   └── admin.module.ts       # Configuração do módulo
│   ├── documentos/               # 📄 Módulo de Documentos
│   │   ├── paginas/
│   │   │   └── lista-documentos/ # Lista de documentos
│   │   ├── componentes/
│   │   │   └── modal-upload/     # Upload de arquivos
│   │   └── documentos.module.ts  # Configuração do módulo
│   ├── parceiro/                 # 🤝 Módulo do Parceiro
│   │   ├── paginas/
│   │   │   └── painel-parceiro/  # Dashboard do parceiro
│   │   └── parceiro.module.ts    # Configuração do módulo
│   └── README.md                 # Documentação dos módulos
├── compartilhado/                # 🔄 Sistema Compartilhado
│   ├── componentes/              # Componentes reutilizáveis
│   ├── servicos/                 # Serviços da API
│   ├── modelos/                  # Interfaces TypeScript
│   ├── guardas/                  # Guards de rota
│   └── layout/                   # Layout principal
└── login/                        # 🔑 Módulo de Login
```

## 🚀 Tecnologias

- **Angular 19** - Framework principal
- **TypeScript** - Tipagem estática
- **PrimeNG** - Biblioteca de componentes
- **Angular Signals** - Estado reativo
- **Standalone Components** - Componentes independentes
- **Lazy Loading** - Carregamento sob demanda

## 📦 Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Instale as dependências
npm install --legacy-peer-deps

# Inicie o servidor de desenvolvimento
npm start

# Acesse em http://localhost:4200
```

## 🛠️ Scripts Disponíveis

```bash
npm start          # Inicia servidor de desenvolvimento
npm run build      # Build de produção
npm test           # Executa testes unitários
npm run lint       # Análise de código
```

## 🎯 Funcionalidades Principais

### 🔧 Módulo Administrativo
- Dashboard com métricas em tempo real
- Gestão completa de usuários (CRUD)
- Gerenciamento de parceiros/empresas
- Controle de acesso e permissões

### 📄 Módulo de Documentos  
- Lista de documentos com filtros
- Upload de arquivos com validação
- Aprovação e rejeição de documentos
- Histórico de alterações

### 🤝 Módulo do Parceiro
- Dashboard personalizado por parceiro
- Visualização de status de onboarding
- Gestão de documentos próprios
- Checklist de tarefas

## 🏛️ Padrões de Arquitetura

### Clean Architecture
- **Separação de responsabilidades** clara
- **Dependency Injection** com `inject()`
- **Single Responsibility Principle**
- **Interface Segregation**

### Padrões Modernos Angular 19
- **Standalone Components** em toda aplicação
- **Signals** para estado reativo
- **Functional Guards** para proteção de rotas
- **Lazy Loading** de módulos
- **Barrel Exports** para organização

### Estrutura de Pastas
- **Nomenclatura em português** para melhor compreensão
- **Modularização** por domínio de negócio
- **Componentes compartilhados** reutilizáveis
- **Services centralizados** para API

## 🛡️ Segurança

- **JWT Authentication** para autenticação
- **Route Guards** para proteção de rotas
- **Role-based Access Control** (RBAC)
- **XSS Protection** com sanitização

## 📱 Responsividade

- Design **mobile-first**
- **Breakpoints** otimizados
- **Componentes adaptativos**
- Suporte a **todos os dispositivos**

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes e2e
npm run e2e
```

## 📈 Performance

- **Lazy Loading** de módulos
- **OnPush Change Detection**
- **Tree Shaking** automático
- **Code Splitting** por rota
- **Service Workers** para cache

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Convenções de Código

- **Nomes em português** para componentes e serviços
- **CamelCase** para variáveis e métodos
- **PascalCase** para classes e interfaces
- **Kebab-case** para arquivos e pastas
- **Comentários JSDoc** para documentaç��o

## 🔧 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ 
- npm 8+
- Angular CLI 19+

### Variáveis de Ambiente
```bash
# src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  version: '1.0.0'
};
```

## 📞 Suporte

Para dúvidas e suporte:
- **Documentação**: Consulte a pasta `/docs`
- **Issues**: Abra uma issue no repositório
- **Wiki**: Acesse a wiki do projeto

---

**Desenvolvido com ❤️ usando Angular 19 e as melhores práticas de desenvolvimento frontend.**
