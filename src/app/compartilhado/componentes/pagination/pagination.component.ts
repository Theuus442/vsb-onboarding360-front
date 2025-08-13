import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
}

export interface PageChangeEvent {
  page: number;
  itemsPerPage: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pagination-container" [class.disabled]="disabled">
      <!-- Items per page selector -->
      @if (showItemsPerPage) {
        <div class="items-per-page">
          <label for="itemsPerPage">Itens por página:</label>
          <select 
            id="itemsPerPage"
            [ngModel]="currentItemsPerPage" 
            (ngModelChange)="onItemsPerPageChange($event)"
            [disabled]="disabled">
            @for (option of itemsPerPageOptions; track option) {
              <option [value]="option">{{ option }}</option>
            }
          </select>
        </div>
      }

      <!-- Pagination info -->
      @if (showInfo && paginationInfo().totalItems > 0) {
        <div class="pagination-info">
          <span>
            Mostrando {{ paginationInfo().startItem }} - {{ paginationInfo().endItem }} 
            de {{ paginationInfo().totalItems }} itens
          </span>
        </div>
      }

      <!-- Pagination controls -->
      @if (paginationInfo().totalPages > 1) {
        <nav class="pagination-nav" aria-label="Navegação de páginas">
          <ul class="pagination-list">
            <!-- First page button -->
            @if (showFirstLast) {
              <li class="pagination-item">
                <button 
                  class="pagination-button first"
                  [disabled]="isFirstPage() || disabled"
                  (click)="goToPage(1)"
                  aria-label="Primeira página"
                  title="Primeira página">
                  <i class="pi pi-angle-double-left"></i>
                </button>
              </li>
            }

            <!-- Previous page button -->
            <li class="pagination-item">
              <button 
                class="pagination-button prev"
                [disabled]="isFirstPage() || disabled"
                (click)="goToPage(currentPage - 1)"
                aria-label="Página anterior"
                title="Página anterior">
                <i class="pi pi-angle-left"></i>
              </button>
            </li>

            <!-- Page numbers -->
            @for (page of visiblePages(); track page) {
              @if (page === '...') {
                <li class="pagination-item ellipsis">
                  <span class="pagination-ellipsis">...</span>
                </li>
              } @else {
                <li class="pagination-item">
                  <button 
                    class="pagination-button page-number"
                    [class.active]="page === currentPage"
                    [disabled]="disabled"
                    (click)="goToPage($any(page))"
                    [attr.aria-label]="'Página ' + page"
                    [attr.aria-current]="page === currentPage ? 'page' : null">
                    {{ page }}
                  </button>
                </li>
              }
            }

            <!-- Next page button -->
            <li class="pagination-item">
              <button 
                class="pagination-button next"
                [disabled]="isLastPage() || disabled"
                (click)="goToPage(currentPage + 1)"
                aria-label="Próxima página"
                title="Próxima página">
                <i class="pi pi-angle-right"></i>
              </button>
            </li>

            <!-- Last page button -->
            @if (showFirstLast) {
              <li class="pagination-item">
                <button 
                  class="pagination-button last"
                  [disabled]="isLastPage() || disabled"
                  (click)="goToPage(paginationInfo().totalPages)"
                  aria-label="Última página"
                  title="Última página">
                  <i class="pi pi-angle-double-right"></i>
                </button>
              </li>
            }
          </ul>
        </nav>
      }

      <!-- Quick page input -->
      @if (showQuickJump && paginationInfo().totalPages > quickJumpThreshold) {
        <div class="quick-jump">
          <label for="quickJumpInput">Ir para página:</label>
          <input 
            id="quickJumpInput"
            type="number" 
            min="1" 
            [max]="paginationInfo().totalPages"
            [ngModel]="quickJumpPage()" 
            (ngModelChange)="quickJumpPage.set($event)"
            (keyup.enter)="onQuickJump()"
            [disabled]="disabled"
            class="quick-jump-input">
          <button 
            class="quick-jump-button" 
            (click)="onQuickJump()"
            [disabled]="disabled || !isValidQuickJumpPage()"
            title="Ir para página">
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      padding: 16px 0;
      
      &.disabled {
        opacity: 0.6;
        pointer-events: none;
      }
    }

    .items-per-page {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      
      label {
        color: #6b7280;
        font-weight: 500;
      }
      
      select {
        padding: 4px 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: white;
        font-size: 14px;
        
        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }
      }
    }

    .pagination-info {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }

    .pagination-nav {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .pagination-list {
      display: flex;
      align-items: center;
      gap: 4px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .pagination-item {
      display: flex;
    }

    .pagination-button {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      border: 1px solid #e5e7eb;
      background: white;
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover:not(:disabled) {
        background: #f9fafb;
        border-color: #d1d5db;
        color: #374151;
      }
      
      &:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      &.active {
        background: #3b82f6;
        border-color: #3b82f6;
        color: white;
        
        &:hover {
          background: #2563eb;
          border-color: #2563eb;
        }
      }
      
      i {
        font-size: 12px;
      }
    }

    .pagination-ellipsis {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      color: #9ca3af;
      font-weight: 500;
    }

    .quick-jump {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      
      label {
        color: #6b7280;
        font-weight: 500;
      }
      
      .quick-jump-input {
        width: 60px;
        padding: 4px 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: white;
        font-size: 14px;
        text-align: center;
        
        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }
      }
      
      .quick-jump-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: 1px solid #d1d5db;
        background: white;
        color: #6b7280;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
          color: #374151;
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        i {
          font-size: 12px;
        }
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .pagination-container {
        flex-direction: column;
        gap: 12px;
      }
      
      .pagination-info {
        order: -1;
      }
      
      .items-per-page {
        order: 2;
      }
    }
  `]
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() maxVisiblePages: number = 7;
  @Input() showInfo: boolean = true;
  @Input() showItemsPerPage: boolean = true;
  @Input() showFirstLast: boolean = true;
  @Input() showQuickJump: boolean = true;
  @Input() quickJumpThreshold: number = 10;
  @Input() itemsPerPageOptions: number[] = [5, 10, 25, 50, 100];
  @Input() disabled: boolean = false;

  @Output() pageChange = new EventEmitter<PageChangeEvent>();

  protected readonly quickJumpPage = signal<number>(1);
  protected readonly currentItemsPerPage = this.itemsPerPage;

  readonly paginationInfo = computed((): PaginationInfo => {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    const startItem = this.totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);

    return {
      currentPage: this.currentPage,
      totalPages,
      totalItems: this.totalItems,
      itemsPerPage: this.itemsPerPage,
      startItem,
      endItem
    };
  });

  readonly visiblePages = computed(() => {
    const totalPages = this.paginationInfo().totalPages;
    const current = this.currentPage;
    const maxVisible = this.maxVisiblePages;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const sidePages = Math.floor((maxVisible - 3) / 2); // Account for first, last, and current

    if (current <= sidePages + 2) {
      // Near the beginning
      for (let i = 1; i <= Math.min(maxVisible - 2, totalPages); i++) {
        pages.push(i);
      }
      if (totalPages > maxVisible - 2) {
        pages.push('...');
        pages.push(totalPages);
      }
    } else if (current >= totalPages - sidePages - 1) {
      // Near the end
      pages.push(1);
      if (totalPages > maxVisible - 2) {
        pages.push('...');
      }
      for (let i = Math.max(totalPages - maxVisible + 3, 2); i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // In the middle
      pages.push(1);
      pages.push('...');
      for (let i = current - sidePages; i <= current + sidePages; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  });

  isFirstPage(): boolean {
    return this.currentPage <= 1;
  }

  isLastPage(): boolean {
    return this.currentPage >= this.paginationInfo().totalPages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.paginationInfo().totalPages && page !== this.currentPage) {
      this.pageChange.emit({
        page,
        itemsPerPage: this.itemsPerPage
      });
    }
  }

  onItemsPerPageChange(newItemsPerPage: number): void {
    const newPage = Math.ceil(((this.currentPage - 1) * this.itemsPerPage + 1) / newItemsPerPage);
    this.pageChange.emit({
      page: newPage,
      itemsPerPage: newItemsPerPage
    });
  }

  onQuickJump(): void {
    const page = this.quickJumpPage();
    if (this.isValidQuickJumpPage()) {
      this.goToPage(page);
    }
  }

  isValidQuickJumpPage(): boolean {
    const page = this.quickJumpPage();
    return page >= 1 && page <= this.paginationInfo().totalPages;
  }
}
