import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtividadeRecente } from '../../../../compartilhado/modelos';
import { getIconClass } from '../../../../compartilhado/utilitarios/icon.util';

@Component({
  selector: 'app-lista-atividades',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lista-atividades">
      <h3 class="titulo-secao">Atividades Recentes</h3>
      
      <div class="atividades-container">
        <div 
          *ngFor="let atividade of atividades" 
          class="item-atividade"
        >
          <div class="icone-atividade" [style.backgroundColor]="atividade.cor">
            <i [class]="getIconClass(atividade.icone)"></i>
          </div>
          
          <div class="conteudo-atividade">
            <h4 class="titulo-atividade">{{ atividade.titulo }}</h4>
            <p class="descricao-atividade">{{ atividade.descricao }}</p>
            <span class="data-atividade">{{ formatarData(atividade.data) }}</span>
          </div>
        </div>
        
        <div *ngIf="!atividades?.length" class="sem-atividades">
          <i class="pi pi-info-circle"></i>
          <p>Nenhuma atividade recente</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lista-atividades {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .titulo-secao {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
    }
    
    .atividades-container {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .item-atividade {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .item-atividade:last-child {
      border-bottom: none;
    }
    
    .icone-atividade {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1rem;
      flex-shrink: 0;
    }
    
    .conteudo-atividade {
      flex: 1;
    }
    
    .titulo-atividade {
      margin: 0 0 0.25rem 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
    }
    
    .descricao-atividade {
      margin: 0 0 0.5rem 0;
      font-size: 0.85rem;
      color: #666;
      line-height: 1.4;
    }
    
    .data-atividade {
      font-size: 0.75rem;
      color: #999;
    }
    
    .sem-atividades {
      text-align: center;
      padding: 2rem;
      color: #999;
    }
    
    .sem-atividades i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      display: block;
    }
  `]
})
export class ListaAtividadesComponent {
  @Input() atividades: AtividadeRecente[] = [];

  formatarData(data: string): string {
    const agora = new Date();
    const dataAtividade = new Date(data);
    const diffMs = agora.getTime() - dataAtividade.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor(diffMs / (1000 * 60));

    if (diffMinutos < 60) {
      return `${diffMinutos}min atrás`;
    } else if (diffHoras < 24) {
      return `${diffHoras}h atrás`;
    } else {
      return dataAtividade.toLocaleDateString('pt-BR');
    }
  }

  getIconClass = getIconClass;
}
