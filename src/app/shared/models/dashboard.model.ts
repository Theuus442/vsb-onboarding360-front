export interface Estatistica {
  readonly valor: number;
  readonly crescimento: string;
  readonly texto: string;
  readonly tendencia: 'positiva' | 'negativa';
  readonly icone: string;
  readonly label: string;
}

export interface AtividadeRecente {
  readonly id: string;
  readonly icone: string;
  readonly descricao: string;
  readonly tempo: string;
}

export interface DocumentoPendente {
  readonly id: string;
  readonly nome: string;
  readonly tipo: DocumentoTipo;
  readonly status: DocumentoStatus;
}

export type DocumentoTipo = 'Jurídica' | 'Financeiro' | 'Contratual';
export type DocumentoStatus = 'Pendente' | 'Aprovado' | 'Rejeitado';

export interface StatusIntegracao {
  readonly percentualCompleto: number;
  readonly totalUsuarios: number;
  readonly emProgresso: number;
  readonly completos: number;
  readonly aguardandoAcao: number;
}

export interface AcessoRapido {
  readonly id: string;
  readonly icone: string;
  readonly titulo: string;
  readonly descricao: string;
  readonly rota?: string;
}
