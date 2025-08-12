import { 
  DocumentosPorParceiro, 
  DocumentoAdmin, 
  StatusDocumento,
  TipoDocumento 
} from '../../../../compartilhado/modelos';
import { DOCUMENTOS_OBRIGATORIOS, DIAS_VENCIMENTO, SEVERITY_MAP } from './gestao-documentos.constants';

export class GestaoDocumentosUtils {
  
  /**
   * Calcula dias até o vencimento de um documento
   */
  static calcularDiasAteVencimento(dataVencimento?: string): number | null {
    if (!dataVencimento) return null;
    
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Conta documentos vencendo em X dias
   */
  static contarDocumentosVencendoEm(documentos: any[], dias: number): number {
    return documentos.filter(doc => {
      if (!doc.data_vencimento) return false;
      const diasAteVencimento = this.calcularDiasAteVencimento(doc.data_vencimento);
      return diasAteVencimento !== null && diasAteVencimento >= 0 && diasAteVencimento <= dias;
    }).length;
  }

  /**
   * Gera lista de documentos obrigatórios com status atual
   */
  static getDocumentosObrigatorios(documentos: any[]): Array<{
    tipo: TipoDocumento;
    nome: string;
    obrigatorio: boolean;
    presente: boolean;
    status?: StatusDocumento;
    data_vencimento?: string;
  }> {
    return DOCUMENTOS_OBRIGATORIOS.map(tipoObrigatorio => {
      const documento = documentos.find(d => d.tipo === tipoObrigatorio.tipo);
      
      return {
        tipo: tipoObrigatorio.tipo,
        nome: tipoObrigatorio.nome,
        obrigatorio: true,
        presente: !!documento,
        status: documento?.status,
        data_vencimento: documento?.data_vencimento
      };
    });
  }

  /**
   * Processa estatísticas de documentos de um parceiro
   */
  static calcularEstatisticasDocumentos(documentos: any[]) {
    return {
      total: documentos.length,
      pendentes: documentos.filter(d => d.status === 'pendente').length,
      aprovados: documentos.filter(d => d.status === 'aprovado').length,
      rejeitados: documentos.filter(d => d.status === 'rejeitado').length,
      expirados: documentos.filter(d => d.status === 'expirado').length,
      vencendo_em_7_dias: this.contarDocumentosVencendoEm(documentos, DIAS_VENCIMENTO.CRITICO),
      vencendo_em_30_dias: this.contarDocumentosVencendoEm(documentos, DIAS_VENCIMENTO.ATENCAO)
    };
  }

  /**
   * Converte documento para DocumentoAdmin
   */
  static converterParaDocumentoAdmin(doc: any, parceiro: any): DocumentoAdmin {
    return {
      ...doc,
      parceiro: {
        id: parceiro.id,
        nome: parceiro.nome || parceiro.nome_fantasia,
        cnpj: parceiro.cnpj,
        email: parceiro.email,
        telefone: parceiro.telefone,
        status: parceiro.status || 'ativo',
        responsavel_principal: parceiro.responsavel_principal
      },
      dias_ate_vencimento: this.calcularDiasAteVencimento(doc.data_vencimento)
    };
  }

  /**
   * Processa dados de um parceiro com seus documentos
   */
  static processarDocumentosParceiro(parceiro: any, documentos: any[]): DocumentosPorParceiro {
    const estatisticas = this.calcularEstatisticasDocumentos(documentos);
    const documentosObrigatorios = this.getDocumentosObrigatorios(documentos);
    const documentosAdmin = documentos.map(doc => this.converterParaDocumentoAdmin(doc, parceiro));

    return {
      parceiro: {
        id: parceiro.id,
        nome: parceiro.nome || parceiro.nome_fantasia,
        cnpj: parceiro.cnpj,
        email: parceiro.email,
        telefone: parceiro.telefone,
        status: parceiro.status || 'ativo',
        responsavel_principal: parceiro.responsavel_principal
      },
      documentos: documentosAdmin,
      estatisticas,
      documentos_obrigatorios: documentosObrigatorios
    };
  }

  /**
   * Filtra parceiros por texto de pesquisa
   */
  static filtrarPorPesquisa(parceiros: DocumentosPorParceiro[], pesquisa: string): DocumentosPorParceiro[] {
    if (!pesquisa) return parceiros;
    
    const termo = pesquisa.toLowerCase();
    return parceiros.filter(p => 
      p.parceiro.nome.toLowerCase().includes(termo) ||
      p.parceiro.cnpj.includes(termo) ||
      p.documentos.some(d => d.nome.toLowerCase().includes(termo))
    );
  }

  /**
   * Filtra parceiros por status de documento
   */
  static filtrarPorStatus(parceiros: DocumentosPorParceiro[], status: StatusDocumento): DocumentosPorParceiro[] {
    return parceiros.filter(p => 
      p.documentos.some(d => d.status === status)
    );
  }

  /**
   * Filtra parceiros por vencimento
   */
  static filtrarPorVencimento(
    parceiros: DocumentosPorParceiro[], 
    vencimento: 'vencendo_7' | 'vencendo_30' | 'expirados' | 'sem_vencimento'
  ): DocumentosPorParceiro[] {
    switch (vencimento) {
      case 'vencendo_7':
        return parceiros.filter(p => p.estatisticas.vencendo_em_7_dias > 0);
      case 'vencendo_30':
        return parceiros.filter(p => p.estatisticas.vencendo_em_30_dias > 0);
      case 'expirados':
        return parceiros.filter(p => p.estatisticas.expirados > 0);
      default:
        return parceiros;
    }
  }

  /**
   * Determina a severidade para tags do PrimeNG
   */
  static getSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    return (SEVERITY_MAP as any)[status] || 'info';
  }

  /**
   * Obtém texto de urgência baseado nas estatísticas
   */
  static getUrgenciaText(item: DocumentosPorParceiro): string {
    if (item.estatisticas.expirados > 0) return 'Crítico';
    if (item.estatisticas.vencendo_em_7_dias > 0) return 'Urgente';
    if (item.estatisticas.vencendo_em_30_dias > 0) return 'Atenção';
    return 'Normal';
  }

  /**
   * Calcula estatísticas gerais do relatório
   */
  static calcularEstatisticasGerais(
    parceirosProcessados: DocumentosPorParceiro[],
    parceirosComPendencias: DocumentosPorParceiro[],
    parceirosComExpiracoes: DocumentosPorParceiro[]
  ) {
    return {
      total_parceiros: parceirosProcessados.length,
      parceiros_em_dia: parceirosProcessados.length - parceirosComPendencias.length - parceirosComExpiracoes.length,
      parceiros_com_pendencias: parceirosComPendencias.length,
      parceiros_com_expiracoes: parceirosComExpiracoes.length,
      documentos_pendentes: parceirosProcessados.reduce((acc, p) => acc + p.estatisticas.pendentes, 0),
      documentos_expirando: parceirosProcessados.reduce((acc, p) => 
        acc + p.estatisticas.vencendo_em_7_dias + p.estatisticas.vencendo_em_30_dias, 0)
    };
  }

  /**
   * Identifica parceiros com pendências
   */
  static identificarParceirosComPendencias(parceiros: DocumentosPorParceiro[]): DocumentosPorParceiro[] {
    return parceiros.filter(p => 
      p.estatisticas.pendentes > 0 || 
      p.documentos_obrigatorios.some(doc => !doc.presente)
    );
  }

  /**
   * Identifica parceiros com expirações
   */
  static identificarParceirosComExpiracoes(parceiros: DocumentosPorParceiro[]): DocumentosPorParceiro[] {
    return parceiros.filter(p => 
      p.estatisticas.expirados > 0 || 
      p.estatisticas.vencendo_em_7_dias > 0 || 
      p.estatisticas.vencendo_em_30_dias > 0
    );
  }

  /**
   * Obtém documentos vencendo de um parceiro
   */
  static getDocumentosVencendo(item: DocumentosPorParceiro): DocumentoAdmin[] {
    return item.documentos.filter(doc => 
      doc.dias_ate_vencimento !== undefined && doc.dias_ate_vencimento <= DIAS_VENCIMENTO.ATENCAO
    );
  }
}
