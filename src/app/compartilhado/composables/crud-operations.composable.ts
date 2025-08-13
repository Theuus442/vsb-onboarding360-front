import { signal, computed, inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { NotificationService } from '../servicos/notification.service';

export interface CrudState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  selectedItem: T | null;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  filters?: Record<string, any>;
}

export interface CrudOperations<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  // Estado
  state: CrudState<T>;
  
  // Computed values
  totalPages: number;
  hasItems: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Operações
  loadItems(options?: PaginationOptions): void;
  createItem(data: CreateDTO): Observable<T>;
  updateItem(id: string | number, data: UpdateDTO): Observable<T>;
  deleteItem(id: string | number): Observable<void>;
  selectItem(item: T | null): void;
  setPage(page: number): void;
  setItemsPerPage(itemsPerPage: number): void;
  setSearch(search: string): void;
  setFilters(filters: Record<string, any>): void;
  refresh(): void;
  reset(): void;
}

export abstract class BaseCrudService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  abstract getItems(options: PaginationOptions): Observable<{ items: T[]; total: number }>;
  abstract getItem(id: string | number): Observable<T>;
  abstract createItem(data: CreateDTO): Observable<T>;
  abstract updateItem(id: string | number, data: UpdateDTO): Observable<T>;
  abstract deleteItem(id: string | number): Observable<void>;
}

@Injectable()
export class CrudOperationsService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  private readonly notificationService = inject(NotificationService);

  // Estado reativo usando signals
  private readonly _items = signal<T[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _selectedItem = signal<T | null>(null);
  private readonly _totalItems = signal(0);
  private readonly _currentPage = signal(1);
  private readonly _itemsPerPage = signal(10);
  private readonly _search = signal('');
  private readonly _filters = signal<Record<string, any>>({});

  // Estado público (readonly)
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedItem = this._selectedItem.asReadonly();
  readonly totalItems = this._totalItems.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly itemsPerPage = this._itemsPerPage.asReadonly();
  readonly search = this._search.asReadonly();
  readonly filters = this._filters.asReadonly();

  // Computed values
  readonly totalPages = computed(() => 
    Math.ceil(this._totalItems() / this._itemsPerPage())
  );
  
  readonly hasItems = computed(() => this._items().length > 0);
  
  readonly hasNextPage = computed(() => 
    this._currentPage() < this.totalPages()
  );
  
  readonly hasPreviousPage = computed(() => 
    this._currentPage() > 1
  );

  readonly paginationOptions = computed((): PaginationOptions => ({
    page: this._currentPage(),
    limit: this._itemsPerPage(),
    search: this._search() || undefined,
    filters: Object.keys(this._filters()).length > 0 ? this._filters() : undefined
  }));

  constructor(
    private crudService: BaseCrudService<T, CreateDTO, UpdateDTO>,
    private entityName: string = 'item'
  ) {}

  loadItems(options?: Partial<PaginationOptions>): void {
    if (options) {
      if (options.page !== undefined) this._currentPage.set(options.page);
      if (options.limit !== undefined) this._itemsPerPage.set(options.limit);
      if (options.search !== undefined) this._search.set(options.search);
      if (options.filters !== undefined) this._filters.set(options.filters);
    }

    this._loading.set(true);
    this._error.set(null);

    this.crudService.getItems(this.paginationOptions()).pipe(
      finalize(() => this._loading.set(false)),
      catchError(error => {
        this._error.set(`Erro ao carregar ${this.entityName}s`);
        this.notificationService.error(
          `Erro ao carregar ${this.entityName}s`,
          'Erro de Carregamento'
        );
        return EMPTY;
      })
    ).subscribe(response => {
      this._items.set(response.items);
      this._totalItems.set(response.total);
    });
  }

  createItem(data: CreateDTO): Observable<T> {
    this._loading.set(true);
    
    return this.crudService.createItem(data).pipe(
      finalize(() => this._loading.set(false)),
      catchError(error => {
        this.notificationService.operationError('criar', this.entityName, error);
        throw error;
      })
    ).pipe(
      finalize(() => {
        // Recarregar lista após criação
        this.refresh();
        this.notificationService.operationSuccess('criar', this.entityName);
      })
    );
  }

  updateItem(id: string | number, data: UpdateDTO): Observable<T> {
    this._loading.set(true);
    
    return this.crudService.updateItem(id, data).pipe(
      finalize(() => this._loading.set(false)),
      catchError(error => {
        this.notificationService.operationError('atualizar', this.entityName, error);
        throw error;
      })
    ).pipe(
      finalize(() => {
        // Atualizar item na lista local
        const items = this._items();
        const index = items.findIndex((item: any) => item.id === id);
        if (index > -1) {
          const updatedItems = [...items];
          // updatedItems[index] = updatedItem; // Seria ideal ter o item atualizado do response
          this._items.set(updatedItems);
        }
        this.notificationService.operationSuccess('atualizar', this.entityName);
      })
    );
  }

  deleteItem(id: string | number): Observable<void> {
    return new Observable(observer => {
      this.notificationService.confirmation(
        `Tem certeza que deseja excluir este ${this.entityName}?`,
        () => {
          this._loading.set(true);
          
          this.crudService.deleteItem(id).pipe(
            finalize(() => this._loading.set(false)),
            catchError(error => {
              this.notificationService.operationError('excluir', this.entityName, error);
              observer.error(error);
              return EMPTY;
            })
          ).subscribe(() => {
            // Remover item da lista local
            const items = this._items();
            const filteredItems = items.filter((item: any) => item.id !== id);
            this._items.set(filteredItems);
            this._totalItems.set(this._totalItems() - 1);
            
            this.notificationService.operationSuccess('excluir', this.entityName);
            observer.next();
            observer.complete();
          });
        },
        () => {
          observer.complete();
        }
      );
    });
  }

  selectItem(item: T | null): void {
    this._selectedItem.set(item);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this._currentPage.set(page);
      this.loadItems();
    }
  }

  setItemsPerPage(itemsPerPage: number): void {
    this._itemsPerPage.set(itemsPerPage);
    this._currentPage.set(1); // Reset to first page
    this.loadItems();
  }

  setSearch(search: string): void {
    this._search.set(search);
    this._currentPage.set(1); // Reset to first page when searching
    this.loadItems();
  }

  setFilters(filters: Record<string, any>): void {
    this._filters.set(filters);
    this._currentPage.set(1); // Reset to first page when filtering
    this.loadItems();
  }

  refresh(): void {
    this.loadItems();
  }

  reset(): void {
    this._items.set([]);
    this._selectedItem.set(null);
    this._totalItems.set(0);
    this._currentPage.set(1);
    this._search.set('');
    this._filters.set({});
    this._error.set(null);
  }

  // Operações em lote
  selectMultipleItems(predicate: (item: T) => boolean): T[] {
    return this._items().filter(predicate);
  }

  deleteMultipleItems(ids: (string | number)[]): Observable<void> {
    return new Observable(observer => {
      this.notificationService.confirmation(
        `Tem certeza que deseja excluir ${ids.length} ${this.entityName}${ids.length > 1 ? 's' : ''}?`,
        () => {
          this._loading.set(true);
          
          // Implementar delete em lote se o serviço suportar
          // Por enquanto, deletar um por vez
          const deletePromises = ids.map(id => 
            this.crudService.deleteItem(id).toPromise()
          );

          Promise.all(deletePromises).then(() => {
            // Remover itens da lista local
            const items = this._items();
            const filteredItems = items.filter((item: any) => !ids.includes(item.id));
            this._items.set(filteredItems);
            this._totalItems.set(this._totalItems() - ids.length);
            
            this.notificationService.operationSuccess(
              'excluir', 
              `${ids.length} ${this.entityName}${ids.length > 1 ? 's' : ''}`
            );
            observer.next();
            observer.complete();
          }).catch(error => {
            this.notificationService.operationError('excluir', `${this.entityName}s`, error);
            observer.error(error);
          }).finally(() => {
            this._loading.set(false);
          });
        },
        () => {
          observer.complete();
        }
      );
    });
  }
}
