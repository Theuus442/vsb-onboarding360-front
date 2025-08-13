import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  forwardRef,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { getIconClass } from '../../utilitarios/icon.util';

export interface DropdownOption {
  label: string;
  value: any;
  icon?: string;
  description?: string;
  color?: string;
  badge?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-dropdown-simples',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownSimplesComponent),
      multi: true
    }
  ],
  template: `
    <div class="dropdown-simples" [class.open]="isOpen" [class.disabled]="disabled">
      <div 
        #trigger
        class="dropdown-trigger"
        [tabindex]="disabled ? -1 : 0"
        (click)="toggle()"
        (keydown)="onKeyDown($event)">
        
        <div class="dropdown-content">
          <span *ngIf="selectedOption; else placeholderTpl" class="selected-text">
            <i *ngIf="selectedOption.icon" [class]="getIconClass(selectedOption.icon)" class="option-icon"></i>
            {{ selectedOption.label }}
          </span>
          <ng-template #placeholderTpl>
            <span class="placeholder">{{ placeholder }}</span>
          </ng-template>
        </div>
        
        <div class="dropdown-actions">
          <button 
            *ngIf="clearable && selectedOption && !disabled"
            type="button"
            class="clear-btn"
            (click)="clear($event)">
            <i class="pi pi-times"></i>
          </button>
          <div class="arrow" [class.rotated]="isOpen">
            <i class="pi pi-chevron-down"></i>
          </div>
        </div>
      </div>
      
      <div *ngIf="isOpen" #panel class="dropdown-panel">
        
        <div *ngIf="searchable" class="search-section">
          <div class="search-wrapper">
            <i class="pi pi-search search-icon"></i>
            <input 
              #searchInput
              type="text"
              class="search-input"
              [placeholder]="searchPlaceholder"
              [(ngModel)]="searchTerm"
              (input)="filterOptions()">
          </div>
        </div>
        
        <div class="options-list">
          <div 
            *ngFor="let option of filteredOptions; let i = index"
            class="option-item"
            [class.selected]="isSelected(option)"
            [class.highlighted]="highlightedIndex === i"
            [class.disabled]="option.disabled"
            (click)="selectOption(option)"
            (mouseenter)="highlightedIndex = i">
            
            <i *ngIf="option.icon"
               [class]="getIconClass(option.icon)"
               class="option-icon"
               [style.color]="option.color"></i>
            
            <div class="option-content">
              <span class="option-label">{{ option.label }}</span>
              <span *ngIf="option.description" class="option-description">{{ option.description }}</span>
            </div>
            
            <span *ngIf="option.badge" class="option-badge">{{ option.badge }}</span>
            <i *ngIf="isSelected(option)" class="pi pi-check selected-icon"></i>
          </div>
          
          <div *ngIf="filteredOptions.length === 0" class="no-options">
            <i class="pi pi-info-circle"></i>
            <span>{{ noOptionsMessage }}</span>
          </div>
        </div>
        
        <div *ngIf="showFooter && filteredOptions.length > 0" class="dropdown-footer">
          <span>{{ filteredOptions.length }} opções</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dropdown-simples {
      position: relative;
      width: 100%;
      font-family: inherit;
    }

    .dropdown-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-height: 44px;
      padding: 12px 16px;
      background: rgba(17, 24, 39, 0.95);
      border: 1px solid rgba(75, 85, 99, 0.6);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.9);
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
      position: relative;
    }

    .dropdown-trigger:hover:not(.disabled) {
      border-color: rgba(99, 102, 241, 0.6);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
    }

    .dropdown-simples.open .dropdown-trigger {
      border-color: rgba(99, 102, 241, 0.8);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
    }

    .dropdown-simples.disabled .dropdown-trigger {
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    }

    .dropdown-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .selected-text {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .dropdown-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 8px;
    }

    .clear-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .clear-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: rgba(239, 68, 68, 1);
    }

    .arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: rgba(255, 255, 255, 0.7);
      transition: transform 0.2s ease;
    }

    .arrow.rotated {
      transform: rotate(180deg);
    }

    .dropdown-panel {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 4px;
      background: rgba(17, 24, 39, 0.98);
      border: 1px solid rgba(75, 85, 99, 0.4);
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      z-index: 2147483647;
      backdrop-filter: blur(10px);
      overflow: hidden;
      max-height: 320px;
    }

    .dropdown-simples.open {
      z-index: 2147483647;
      position: relative;
    }

    .search-section {
      padding: 12px;
      border-bottom: 1px solid rgba(75, 85, 99, 0.3);
    }

    .search-wrapper {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
    }

    .search-input {
      width: 100%;
      padding: 8px 16px 8px 36px;
      background: rgba(31, 41, 55, 0.8);
      border: 1px solid rgba(75, 85, 99, 0.5);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      outline: none;
    }

    .search-input:focus {
      border-color: rgba(99, 102, 241, 0.6);
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .options-list {
      max-height: 240px;
      overflow-y: auto;
      padding: 4px 0;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: rgba(255, 255, 255, 0.9);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .option-item:hover:not(.disabled),
    .option-item.highlighted:not(.disabled) {
      background: rgba(99, 102, 241, 0.15);
      color: rgba(255, 255, 255, 1);
    }

    .option-item.selected {
      background: rgba(99, 102, 241, 0.25);
      color: rgba(255, 255, 255, 1);
    }

    .option-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .option-icon {
      font-size: 16px;
      min-width: 16px;
    }

    .option-content {
      flex: 1;
      min-width: 0;
    }

    .option-label {
      display: block;
      font-weight: 500;
    }

    .option-description {
      display: block;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 2px;
    }

    .option-badge {
      background: rgba(99, 102, 241, 0.8);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .selected-icon {
      color: rgba(34, 197, 94, 1);
      font-size: 14px;
    }

    .no-options {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      color: rgba(255, 255, 255, 0.6);
      justify-content: center;
    }

    .dropdown-footer {
      padding: 8px 16px;
      border-top: 1px solid rgba(75, 85, 99, 0.3);
      background: rgba(31, 41, 55, 0.5);
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }

    .options-list::-webkit-scrollbar {
      width: 6px;
    }

    .options-list::-webkit-scrollbar-track {
      background: rgba(31, 41, 55, 0.5);
    }

    .options-list::-webkit-scrollbar-thumb {
      background: rgba(99, 102, 241, 0.5);
      border-radius: 3px;
    }

    .options-list::-webkit-scrollbar-thumb:hover {
      background: rgba(99, 102, 241, 0.7);
    }

    @media (max-width: 768px) {
      .dropdown-trigger {
        min-height: 48px;
        padding: 14px 16px;
      }
      
      .option-item {
        padding: 14px 16px;
      }
    }
  `]
})
export class DropdownSimplesComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @ViewChild('trigger') triggerRef!: ElementRef;
  @ViewChild('panel') panelRef!: ElementRef;
  @ViewChild('searchInput') searchInputRef!: ElementRef;

  @Input() options: DropdownOption[] = [];
  @Input() placeholder = 'Selecione uma opção';
  @Input() disabled = false;
  @Input() clearable = false;
  @Input() searchable = false;
  @Input() searchPlaceholder = 'Buscar...';
  @Input() noOptionsMessage = 'Nenhuma opção encontrada';
  @Input() showFooter = false;

  @Output() selectionChange = new EventEmitter<DropdownOption | null>();

  isOpen = false;
  selectedValue: any = null;
  searchTerm = '';
  highlightedIndex = -1;
  filteredOptions: DropdownOption[] = [];

  private onChange = (value: any) => {};
  private onTouched = () => {};
  private documentClickListener?: (event: Event) => void;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.filteredOptions = [...this.options];
    this.setupDocumentClick();
  }

  ngOnDestroy() {
    this.removeDocumentClick();
  }

  get selectedOption(): DropdownOption | null {
    return this.options.find(option => option.value === this.selectedValue) || null;
  }

  writeValue(value: any): void {
    this.selectedValue = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggle(): void {
    if (this.disabled) return;
    
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.disabled || this.isOpen) return;
    
    this.isOpen = true;
    this.highlightedIndex = this.getSelectedIndex();
    
    setTimeout(() => {
      if (this.searchable && this.searchInputRef) {
        this.searchInputRef.nativeElement.focus();
      }
    });
  }

  close(): void {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.searchTerm = '';
    this.filteredOptions = [...this.options];
    this.highlightedIndex = -1;
    this.onTouched();
  }

  selectOption(option: DropdownOption): void {
    if (option.disabled) return;
    
    this.selectedValue = option.value;
    this.onChange(option.value);
    this.selectionChange.emit(option);
    this.close();
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.selectedValue = null;
    this.onChange(null);
    this.selectionChange.emit(null);
  }

  isSelected(option: DropdownOption): boolean {
    return this.selectedValue === option.value;
  }

  filterOptions(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredOptions = [...this.options];
    } else {
      this.filteredOptions = this.options.filter(option => 
        option.label.toLowerCase().includes(term) ||
        (option.description?.toLowerCase().includes(term))
      );
    }
    this.highlightedIndex = 0;
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else if (this.highlightedIndex >= 0 && this.filteredOptions[this.highlightedIndex]) {
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          this.moveHighlight(1);
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen) {
          this.moveHighlight(-1);
        }
        break;
    }
  }

  private moveHighlight(direction: number): void {
    if (this.filteredOptions.length === 0) return;
    
    let newIndex = this.highlightedIndex + direction;
    
    if (newIndex < 0) {
      newIndex = this.filteredOptions.length - 1;
    } else if (newIndex >= this.filteredOptions.length) {
      newIndex = 0;
    }
    
    this.highlightedIndex = newIndex;
  }

  private getSelectedIndex(): number {
    return this.filteredOptions.findIndex(option => option.value === this.selectedValue);
  }

  private setupDocumentClick(): void {
    this.documentClickListener = (event: Event) => {
      if (!this.elementRef.nativeElement.contains(event.target as Node)) {
        this.close();
      }
    };
    document.addEventListener('click', this.documentClickListener);
  }

  private removeDocumentClick(): void {
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
    }
  }

  getIconClass = getIconClass;
}
