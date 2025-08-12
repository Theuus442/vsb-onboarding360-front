import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  NotificacaoEmail, 
  SolicitacaoDocumento, 
  DocumentosPorParceiro,
  TipoDocumento 
} from '../modelos';

@Injectable({
  providedIn: 'root'
})
export class EmailNotificationService {
  private readonly apiService = inject(ApiService);

  /**
   * Solicitar documentos específicos para um parceiro
   */
  solicitarDocumentos(solicitacao: SolicitacaoDocumento): Observable<{ success: boolean; mensagem: string }> {
    return this.apiService.post<{ success: boolean; mensagem: string }>('/emails/solicitar-documentos', solicitacao);
  }

  /**
   * Enviar lembrete de documentos pendentes para um parceiro
   */
  enviarLembretePendencias(
    parceiro_id: number, 
    documentos_pendentes: string[],
    mensagem_personalizada?: string
  ): Observable<{ success: boolean; mensagem: string }> {
    const dados = {
      parceiro_id,
      documentos_pendentes,
      mensagem_personalizada,
      tipo: 'lembrete_pendencias'
    };
    
    return this.apiService.post<{ success: boolean; mensagem: string }>('/emails/lembrete-pendencias', dados);
  }

  /**
   * Enviar alerta de documentos vencendo
   */
  enviarAlertaVencimento(
    parceiro_id: number,
    documentos_vencendo: Array<{
      nome: string;
      tipo: TipoDocumento;
      dias_ate_vencimento: number;
      data_vencimento: string;
    }>,
    mensagem_personalizada?: string
  ): Observable<{ success: boolean; mensagem: string }> {
    const dados = {
      parceiro_id,
      documentos_vencendo,
      mensagem_personalizada,
      tipo: 'alerta_vencimento'
    };
    
    return this.apiService.post<{ success: boolean; mensagem: string }>('/emails/alerta-vencimento', dados);
  }

  /**
   * Enviar notificação em massa para múltiplos parceiros
   */
  enviarNotificacaoMassa(notificacao: {
    parceiros_ids: number[];
    tipo: 'solicitacao' | 'lembrete' | 'vencimento';
    assunto: string;
    mensagem: string;
    incluir_anexos?: boolean;
  }): Observable<{ 
    success: boolean; 
    mensagem: string; 
    resultados: Array<{
      parceiro_id: number;
      enviado: boolean;
      erro?: string;
    }>;
  }> {
    return this.apiService.post('/emails/notificacao-massa', notificacao);
  }

  /**
   * Obter templates de email disponíveis
   */
  getTemplatesEmail(): Observable<Array<{
    id: string;
    nome: string;
    tipo: 'solicitacao' | 'lembrete' | 'vencimento' | 'aprovacao' | 'rejeicao';
    assunto: string;
    corpo: string;
    variaveis_disponiveis: string[];
  }>> {
    return this.apiService.get('/emails/templates');
  }

  /**
   * Personalizar template de email
   */
  personalizarTemplate(
    template_id: string,
    variaveis: Record<string, string>
  ): Observable<{
    assunto: string;
    corpo: string;
  }> {
    return this.apiService.post(`/emails/templates/${template_id}/personalizar`, { variaveis });
  }

  /**
   * Enviar email personalizado
   */
  enviarEmailPersonalizado(email: NotificacaoEmail): Observable<{ success: boolean; mensagem: string }> {
    return this.apiService.post<{ success: boolean; mensagem: string }>('/emails/personalizado', email);
  }

  /**
   * Obter histórico de emails enviados
   */
  getHistoricoEmails(
    parceiro_id?: number,
    tipo?: 'solicitacao' | 'lembrete' | 'vencimento' | 'aprovacao' | 'rejeicao',
    data_inicio?: string,
    data_fim?: string,
    page: number = 1,
    limit: number = 20
  ): Observable<{
    data: Array<{
      id: string;
      parceiro_id: number;
      parceiro_nome: string;
      tipo: string;
      assunto: string;
      status: 'enviado' | 'falha' | 'pendente';
      data_envio: string;
      data_abertura?: string;
      data_clique?: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      last_page: number;
    };
  }> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString()
    };

    if (parceiro_id) params['parceiro_id'] = parceiro_id.toString();
    if (tipo) params['tipo'] = tipo;
    if (data_inicio) params['data_inicio'] = data_inicio;
    if (data_fim) params['data_fim'] = data_fim;

    return this.apiService.get('/emails/historico', params);
  }

  /**
   * Obter estatísticas de emails
   */
  getEstatisticasEmails(): Observable<{
    total_enviados: number;
    taxa_abertura: number;
    taxa_clique: number;
    emails_por_tipo: Array<{
      tipo: string;
      quantidade: number;
    }>;
    emails_por_mes: Array<{
      mes: string;
      quantidade: number;
    }>;
  }> {
    return this.apiService.get('/emails/estatisticas');
  }

  /**
   * Configurar notificações automáticas
   */
  configurarNotificacoesAutomaticas(configuracao: {
    lembrete_pendencias: {
      ativo: boolean;
      dias_apos_upload: number;
      repetir_a_cada_dias: number;
    };
    alerta_vencimento: {
      ativo: boolean;
      dias_antes_vencimento: number[];
      repetir_ate_renovacao: boolean;
    };
    notificacao_aprovacao: {
      ativo: boolean;
      incluir_documento_aprovado: boolean;
    };
    notificacao_rejeicao: {
      ativo: boolean;
      incluir_motivo_rejeicao: boolean;
    };
  }): Observable<{ success: boolean; mensagem: string }> {
    return this.apiService.post('/emails/configurar-automaticas', configuracao);
  }

  /**
   * Obter configurações atuais de notificações automáticas
   */
  getConfiguracaoNotificacoes(): Observable<{
    lembrete_pendencias: {
      ativo: boolean;
      dias_apos_upload: number;
      repetir_a_cada_dias: number;
    };
    alerta_vencimento: {
      ativo: boolean;
      dias_antes_vencimento: number[];
      repetir_ate_renovacao: boolean;
    };
    notificacao_aprovacao: {
      ativo: boolean;
      incluir_documento_aprovado: boolean;
    };
    notificacao_rejeicao: {
      ativo: boolean;
      incluir_motivo_rejeicao: boolean;
    };
  }> {
    return this.apiService.get('/emails/configuracao');
  }

  /**
   * Validar endereços de email
   */
  validarEmails(emails: string[]): Observable<{
    emails_validos: string[];
    emails_invalidos: string[];
  }> {
    return this.apiService.post('/emails/validar', { emails });
  }

  /**
   * Testar configuração de email
   */
  testarConfiguracao(email_teste: string): Observable<{ success: boolean; mensagem: string }> {
    return this.apiService.post('/emails/testar-configuracao', { email_teste });
  }

  /**
   * Enviar email personalizado para usuário específico
   */
  enviarEmail(emailData: { destinatario: string; assunto: string; mensagem: string }): Observable<any> {
    return this.apiService.post<any>('/emails/enviar', emailData);
  }

  // Métodos de conveniência para ações comuns

  /**
   * Solicitar todos os documentos obrigatórios faltantes para um parceiro
   */
  solicitarDocumentosObrigatoriosFaltantes(parceiro: DocumentosPorParceiro): Observable<{ success: boolean; mensagem: string }> {
    const documentos_faltantes = parceiro.documentos_obrigatorios
      .filter(doc => !doc.presente)
      .map(doc => doc.tipo);

    if (documentos_faltantes.length === 0) {
      throw new Error('Nenhum documento obrigatório faltante para este parceiro');
    }

    const solicitacao: SolicitacaoDocumento = {
      parceiro_id: parceiro.parceiro.id,
      tipos_documentos: documentos_faltantes,
      assunto: 'Solicitação de Documentos Obrigatórios',
      mensagem_personalizada: `
        Prezado(a) responsável pela ${parceiro.parceiro.nome},
        
        Identificamos que alguns documentos obrigatórios ainda não foram enviados para finalizar seu cadastro.
        
        Por favor, envie os seguintes documentos:
        ${documentos_faltantes.map(tipo => `- ${this.getTipoDocumentoLabel(tipo)}`).join('\n')}
        
        Agradecemos a colaboração.
      `,
      prazo_dias: 7
    };

    return this.solicitarDocumentos(solicitacao);
  }

  /**
   * Enviar lembrete de documentos vencendo em breve
   */
  enviarLembreteDocumentosVencendo(parceiro: DocumentosPorParceiro): Observable<{ success: boolean; mensagem: string }> {
    const documentos_vencendo = parceiro.documentos
      .filter(doc => doc.dias_ate_vencimento !== undefined && doc.dias_ate_vencimento <= 30)
      .map(doc => ({
        nome: doc.nome,
        tipo: doc.tipo,
        dias_ate_vencimento: doc.dias_ate_vencimento!,
        data_vencimento: doc.data_vencimento || ''
      }));

    if (documentos_vencendo.length === 0) {
      throw new Error('Nenhum documento vencendo para este parceiro');
    }

    return this.enviarAlertaVencimento(
      parceiro.parceiro.id,
      documentos_vencendo,
      `
        Prezado(a) responsável pela ${parceiro.parceiro.nome},
        
        Alguns de seus documentos estão próximos do vencimento. Por favor, providencie a renovação:
        
        ${documentos_vencendo.map(doc => 
          `- ${doc.nome}: ${doc.dias_ate_vencimento > 0 ? `vence em ${doc.dias_ate_vencimento} dias` : 'VENCIDO'}`
        ).join('\n')}
        
        Agradecemos a atenção.
      `
    );
  }

  /**
   * Helper para obter label do tipo de documento
   */
  private getTipoDocumentoLabel(tipo: TipoDocumento): string {
    const labels: Record<TipoDocumento, string> = {
      'cnpj': 'Cartão CNPJ',
      'contrato_social': 'Contrato Social',
      'certificado_digital': 'Certificado Digital',
      'comprovante_endereco': 'Comprovante de Endereço',
      'outros': 'Outros Documentos'
    };
    
    return labels[tipo] || tipo;
  }
}
