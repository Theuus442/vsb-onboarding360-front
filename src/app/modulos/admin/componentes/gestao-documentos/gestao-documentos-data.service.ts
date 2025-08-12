import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { 
  DocumentosPorParceiro, 
  RelatorioDocumentos,
  StatusDocumento
} from '../../../../compartilhado/modelos';
import { DocumentoService, ParceiroService } from '../../../../compartilhado/servicos';
import { GestaoDocumentosUtils } from './gestao-documentos.utils';

interface FiltroGestao {
  status?: StatusDocumento;
  vencimento?: 'vencendo_7' | 'vencendo_30' | 'expirados' | 'sem_vencimento';
}

@Injectable({
  providedIn: 'root'
})
export class GestaoDocumentosDataService {
  private readonly documentoService = inject(DocumentoService);
  private readonly parceiroService = inject(ParceiroService);

  /**
   * Carrega relatório completo de documentos
   */
  carregarRelatorioDocumentos(): Observable<RelatorioDocumentos> {
    return this.parceiroService.getParceiros(1, 100).pipe(
      map(resposta => resposta.data),
      switchMap(parceiros => this.processarParceiros(parceiros)),
      catchError(erro => {
        console.error('Erro ao carregar parceiros:', erro);
        // Retornar relatório vazio em caso de erro
        return of(this.getRelatorioVazio());
      })
    );
  }

  /**
   * Processa lista de parceiros e busca seus documentos
   */
  private processarParceiros(parceiros: any[]): Observable<RelatorioDocumentos> {
    if (parceiros.length === 0) {
      return of(this.getRelatorioVazio());
    }

    // Buscar documentos para todos os parceiros
    const documentoRequests = parceiros.map(parceiro =>
      this.documentoService.getDocumentos(1, 100, { parceiro_id: parceiro.id }).pipe(
        map(resposta => ({
          parceiro,
          documentos: resposta.data || []
        })),
        catchError(erro => {
          console.error(`Erro ao carregar documentos do parceiro ${parceiro.nome}:`, erro);
          return of({
            parceiro,
            documentos: []
          });
        })
      )
    );

    return forkJoin(documentoRequests).pipe(
      map(resultados => this.montarRelatorio(resultados))
    );
  }

  /**
   * Monta relatório final com base nos dados processados
   */
  private montarRelatorio(resultados: Array<{ parceiro: any; documentos: any[] }>): RelatorioDocumentos {
    // Processar cada parceiro
    const parceirosProcessados = resultados.map(resultado => 
      GestaoDocumentosUtils.processarDocumentosParceiro(resultado.parceiro, resultado.documentos)
    );

    // Identificar parceiros com problemas
    const parceirosComPendencias = GestaoDocumentosUtils.identificarParceirosComPendencias(parceirosProcessados);
    const parceirosComExpiracoes = GestaoDocumentosUtils.identificarParceirosComExpiracoes(parceirosProcessados);

    // Calcular estatísticas gerais
    const estatisticasGerais = GestaoDocumentosUtils.calcularEstatisticasGerais(
      parceirosProcessados,
      parceirosComPendencias,
      parceirosComExpiracoes
    );

    return {
      parceiros_com_pendencias: parceirosComPendencias,
      parceiros_com_expiracoes: parceirosComExpiracoes,
      estatisticas_gerais: estatisticasGerais
    };
  }

  /**
   * Aplica filtros ao relatório
   */
  aplicarFiltros(
    relatorio: RelatorioDocumentos, 
    filtros: FiltroGestao, 
    pesquisa: string
  ): RelatorioDocumentos {
    let parceirosComPendencias = [...relatorio.parceiros_com_pendencias];
    let parceirosComExpiracoes = [...relatorio.parceiros_com_expiracoes];

    // Aplicar filtro de pesquisa
    if (pesquisa) {
      parceirosComPendencias = GestaoDocumentosUtils.filtrarPorPesquisa(parceirosComPendencias, pesquisa);
      parceirosComExpiracoes = GestaoDocumentosUtils.filtrarPorPesquisa(parceirosComExpiracoes, pesquisa);
    }

    // Aplicar filtro por status
    if (filtros.status) {
      parceirosComPendencias = GestaoDocumentosUtils.filtrarPorStatus(parceirosComPendencias, filtros.status);
      parceirosComExpiracoes = GestaoDocumentosUtils.filtrarPorStatus(parceirosComExpiracoes, filtros.status);
    }

    // Aplicar filtro por vencimento
    if (filtros.vencimento) {
      parceirosComExpiracoes = GestaoDocumentosUtils.filtrarPorVencimento(parceirosComExpiracoes, filtros.vencimento);
    }

    return {
      ...relatorio,
      parceiros_com_pendencias: parceirosComPendencias,
      parceiros_com_expiracoes: parceirosComExpiracoes
    };
  }

  /**
   * Retorna relatório vazio para casos de erro
   */
  private getRelatorioVazio(): RelatorioDocumentos {
    return {
      parceiros_com_pendencias: [],
      parceiros_com_expiracoes: [],
      estatisticas_gerais: {
        total_parceiros: 0,
        parceiros_em_dia: 0,
        parceiros_com_pendencias: 0,
        parceiros_com_expiracoes: 0,
        documentos_pendentes: 0,
        documentos_expirando: 0
      }
    };
  }

}
