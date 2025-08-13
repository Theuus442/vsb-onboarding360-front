
export interface Estatistica {
  id: string;
  titulo: string;
  valor: number | string;
  icone: string;
  cor: string;
  tipo?: 'crescimento' | 'decrescimento' | 'neutro';
  tendencia?: 'up' | 'down' | 'stable';
  percentual_mudanca?: number;
  porcentagem?: number;
  descricao?: string;
  formato?: 'numero' | 'porcentagem' | 'moeda' | 'texto';
}

export interface AtividadeRecente {
  id: string | number;
  tipo: 'documento' | 'usuario' | 'parceiro' | 'sistema' | 'criação' | 'remoção' | string;
  titulo?: string;
  descricao: string;
  data?: string;
  timestamp?: string; 
  usuario?: string;
  icone?: string;
  icon?: string; 
  cor: string;
  link?: string;
}

export interface DocumentoPendente {
  id: string;
  nome: string;
  tipo: string;
  parceiro: string;
  data_upload: string;
  dias_pendente: number;
  prioridade: 'baixa' | 'media' | 'alta';
  url?: string;
}

export interface StatusIntegracao {
  id: string;
  servico: string;
  status: 'online' | 'offline' | 'warning' | 'manutencao';
  ultima_sincronizacao: string;
  mensagem?: string;
  uptime?: string;
  tempo_resposta?: number;
}

export interface AcessoRapido {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  cor: string;
  rota: string;
  permissao?: string;
  contador?: number;
  ativo: boolean;
}

export interface ResumoGeral {
  total_parceiros: number;
  total_usuarios: number;
  total_documentos: number;
  documentos_pendentes: number;
  parceiros_ativos: number;
  usuarios_ativos: number;
}

export interface MetricasTempo {
  periodo: 'dia' | 'semana' | 'mes' | 'ano';
  novos_parceiros: number;
  novos_usuarios: number;
  documentos_processados: number;
  tempo_medio_aprovacao: number;
}

// Interface para gráficos
export interface DadosGrafico {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// Interface para alertas do painel
export interface AlertaPainel {
  id: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  mensagem: string;
  data: string;
  lido: boolean;
  acao?: {
    texto: string;
    rota: string;
  };
}
