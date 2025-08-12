// Interfaces para checklist de onboarding

export interface ChecklistItem {
  id: string;
  titulo: string;
  descricao: string;
  concluido: boolean;
  obrigatorio: boolean;
  ordem: number;
  categoria: ChecklistCategoria;
  data_conclusao?: string;
  usuario_conclusao?: string;
  observacoes?: string;
  dependencias?: string[];
}

export type ChecklistCategoria = 
  | 'documentacao'
  | 'configuracao'
  | 'integracao'
  | 'treinamento'
  | 'validacao';

export interface Checklist {
  id: string;
  parceiro_id: string;
  nome: string;
  descricao?: string;
  itens: ChecklistItem[];
  progresso: number;
  status: ChecklistStatus;
  created_at: string;
  updated_at?: string;
  data_conclusao?: string;
}

export type ChecklistStatus = 
  | 'nao_iniciado'
  | 'em_andamento'
  | 'concluido'
  | 'bloqueado';

export interface ChecklistTemplate {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  itens: Omit<ChecklistItem, 'id' | 'concluido' | 'data_conclusao' | 'usuario_conclusao'>[];
  ativo: boolean;
  created_at: string;
}

export interface ChecklistProgresso {
  total_itens: number;
  itens_concluidos: number;
  percentual: number;
  itens_obrigatorios_pendentes: number;
  pode_finalizar: boolean;
}

export interface ChecklistAction {
  item_id: string;
  acao: 'concluir' | 'reverter' | 'pular';
  observacoes?: string;
}
