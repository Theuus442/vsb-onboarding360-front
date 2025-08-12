import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, PaginatorModule],
  template: `
    <div class="pagination-wrapper">
      <p-paginator
        [rows]="itemsPerPage"
        [totalRecords]="totalItems"
        [first]="first()"
        (onPageChange)="onPageChange($event)"
        [showCurrentPageReport]="true"
        [currentPageReportTemplate]="currentPageTemplate()"
        [pageLinkSize]="5"
        [showJumpToPageDropdown]="totalPages() > 10"
        [showPageLinks]="true">
      </p-paginator>
    </div>
  `,
  styles: [`
    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin: 2rem 0;
    }

    ::ng-deep .p-paginator {
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 1rem;
      padding: 1rem;
      backdrop-filter: blur(20px);
    }

    ::ng-deep .p-paginator .p-paginator-pages .p-paginator-page {
      background: transparent;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 0.5rem;
      margin: 0 0.25rem;
      transition: all 0.2s ease;
    }

    ::ng-deep .p-paginator .p-paginator-pages .p-paginator-page:hover {
      background: rgba(165, 40, 49, 0.1);
      border-color: #A52831;
    }

    ::ng-deep .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
      background: #A52831;
      border-color: #A52831;
      color: white;
    }

    ::ng-deep .p-paginator .p-paginator-first,
    ::ng-deep .p-paginator .p-paginator-prev,
    ::ng-deep .p-paginator .p-paginator-next,
    ::ng-deep .p-paginator .p-paginator-last {
      background: transparent;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 0.5rem;
      margin: 0 0.25rem;
      transition: all 0.2s ease;
    }

    ::ng-deep .p-paginator .p-paginator-first:hover,
    ::ng-deep .p-paginator .p-paginator-prev:hover,
    ::ng-deep .p-paginator .p-paginator-next:hover,
    ::ng-deep .p-paginator .p-paginator-last:hover {
      background: rgba(165, 40, 49, 0.1);
      border-color: #A52831;
    }
  `]
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() itemsPerPage = 15;
  @Input() totalItems = 0;
  @Input() itemsLabel = 'itens';
  @Output() pageChange = new EventEmitter<number>();

  protected readonly first = computed(() => (this.currentPage - 1) * this.itemsPerPage);
  protected readonly totalPages = computed(() => Math.ceil(this.totalItems / this.itemsPerPage));
  
  protected readonly currentPageTemplate = computed(() => {
    const start = this.first() + 1;
    const end = Math.min(this.first() + this.itemsPerPage, this.totalItems);
    return `Mostrando ${start} a ${end} de ${this.totalItems} ${this.itemsLabel}`;
  });

  onPageChange(event: any): void {
    const newPage = (event.first / event.rows) + 1;
    this.pageChange.emit(newPage);
  }
}
