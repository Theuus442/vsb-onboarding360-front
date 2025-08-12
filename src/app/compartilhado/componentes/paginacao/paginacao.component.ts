import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginacao',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="paginacao-container" *ngIf="totalPaginas() > 1">
      <div class="paginacao-info">
        <span>
          Mostrando {{ itemInicial() }} a {{ itemFinal() }} de {{ totalItens }} itens
        </span>
      </div>
      
      <nav class="paginacao-nav" aria-label="Paginação">
        <button 
          class="btn-pagina"
          [disabled]="paginaAtual === 1"
          (click)="irParaPagina(1)"
          title="Primeira página"
        >
          <i class="pi pi-angle-double-left"></i>
        </button>
        
        <button 
          class="btn-pagina"
          [disabled]="paginaAtual === 1"
          (click)="irParaPagina(paginaAtual - 1)"
          title="Página anterior"
        >
          <i class="pi pi-angle-left"></i>
        </button>
        
        <div class="numeros-pagina">
          <button 
            *ngFor="let pagina of paginasVisiveis()"
            class="btn-numero"
            [ngClass]="{ 'ativa': +pagina === paginaAtual, 'reticencias': pagina === '...' }"
            [disabled]="pagina === '...'"
            (click)="pagina !== '...' && irParaPagina(+pagina)"
          >
            {{ pagina }}
          </button>
        </div>
        
        <button 
          class="btn-pagina"
          [disabled]="paginaAtual === totalPaginas()"
          (click)="irParaPagina(paginaAtual + 1)"
          title="Próxima página"
        >
          <i class="pi pi-angle-right"></i>
        </button>
        
        <button 
          class="btn-pagina"
          [disabled]="paginaAtual === totalPaginas()"
          (click)="irParaPagina(totalPaginas())"
          title="Última página"
        >
          <i class="pi pi-angle-double-right"></i>
        </button>
      </nav>
    </div>
  `,
  styles: [`
    .paginacao-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .paginacao-info {
      color: #666;
      font-size: 0.9rem;
    }
    
    .paginacao-nav {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .btn-pagina,
    .btn-numero {
      background: none;
      border: 1px solid #d1d5db;
      color: #374151;
      cursor: pointer;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      transition: all 0.2s;
      font-size: 0.9rem;
      min-width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-pagina:hover:not(:disabled),
    .btn-numero:hover:not(:disabled):not(.reticencias) {
      background-color: #f3f4f6;
      border-color: #9ca3af;
    }
    
    .btn-pagina:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-numero.ativa {
      background-color: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }
    
    .btn-numero.reticencias {
      border: none;
      cursor: default;
      font-weight: bold;
    }
    
    .numeros-pagina {
      display: flex;
      gap: 0.25rem;
      margin: 0 0.5rem;
    }
    
    @media (max-width: 640px) {
      .paginacao-container {
        flex-direction: column;
        text-align: center;
      }
      
      .numeros-pagina {
        margin: 0;
      }
      
      .btn-pagina,
      .btn-numero {
        padding: 0.5rem;
        min-width: 35px;
      }
    }
  `]
})
export class PaginacaoComponent {
  @Input() paginaAtual: number = 1;
  @Input() totalItens: number = 0;
  @Input() itensPorPagina: number = 15;
  @Input() maxPaginasVisiveis: number = 5;
  
  @Output() mudancaPagina = new EventEmitter<number>();

  readonly totalPaginas = computed(() => 
    Math.ceil(this.totalItens / this.itensPorPagina)
  );

  readonly itemInicial = computed(() => 
    (this.paginaAtual - 1) * this.itensPorPagina + 1
  );

  readonly itemFinal = computed(() => 
    Math.min(this.paginaAtual * this.itensPorPagina, this.totalItens)
  );

  readonly paginasVisiveis = computed(() => {
    const total = this.totalPaginas();
    const atual = this.paginaAtual;
    const max = this.maxPaginasVisiveis;
    
    if (total <= max) {
      return Array.from({ length: total }, (_, i) => (i + 1).toString());
    }
    
    const pages: (string | number)[] = [];
    const metade = Math.floor(max / 2);
    
    let inicio = Math.max(1, atual - metade);
    let fim = Math.min(total, atual + metade);
    
    // Ajustar se estivermos muito perto do início ou fim
    if (atual <= metade) {
      fim = max;
    } else if (atual >= total - metade) {
      inicio = total - max + 1;
    }
    
    // Adicionar primeira página e reticências se necessário
    if (inicio > 1) {
      pages.push(1);
      if (inicio > 2) {
        pages.push('...');
      }
    }
    
    // Adicionar páginas do meio
    for (let i = inicio; i <= fim; i++) {
      pages.push(i);
    }
    
    // Adicionar reticências e última página se necessário
    if (fim < total) {
      if (fim < total - 1) {
        pages.push('...');
      }
      pages.push(total);
    }
    
    return pages.map(p => p.toString());
  });

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas() && pagina !== this.paginaAtual) {
      this.mudancaPagina.emit(pagina);
    }
  }
}
