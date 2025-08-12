import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  forwardRef, 
  OnInit, 
  OnDestroy, 
  ElementRef, 
  ViewChild, 
  HostListener 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
  selector: 'app-dropdown-moderno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownModernoComponent),
      multi: true
    }
  ],
  template: `
    <div class="dropdown-container" [class.disabled]="disabled" [class.open]="isOpen">
      <div 
        #trigger
        class="dropdown-trigger"
        [class.open]="isOpen"
        [class.error]="hasError"
        [class.success]="hasSuccess"
        [class.disabled]="disabled"
        [tabindex]="disabled ? -1 : 0"
        (click)="toggleDropdown()"
        (keydown)="onKeyDown($event)">
        
        <div class="dropdown-value">
          <ng-container *ngIf="selectedOption; else placeholderTemplate">
            <i *ngIf="selectedOption.icon" class="pi pi-{{ selectedOption.icon }} option-icon"></i>
            <span class="selected-text">{{ selectedOption.label }}</span>
          </ng-container>
          <ng-template #placeholderTemplate>
            <span class="placeholder">{{ placeholder }}</span>
          </ng-template>
        </div>
        
        <div class="dropdown-actions">
          <button 
            *ngIf="clearable && selectedOption && !disabled"
            type="button"
            class="clear-button"
            (click)="clearSelection($event)"
            title="Limpar seleção">
            <i class="pi pi-times"></i>
          </button>
          <div class="arrow-icon" [class.rotated]="isOpen">
            <i class="pi pi-chevron-down"></i>
          </div>
        </div>
      </div>
      
      <div 
        *ngIf="isOpen" 
        #panel
        class="dropdown-panel"
        [style.min-width.px]="triggerWidth">
        
        <div *ngIf="searchable" class="search-section">
          <div class="search-wrapper">
            <i class="pi pi-search search-icon"></i>
            <input 
              #searchInput
              type="text"
              class="search-input"
              [placeholder]="searchPlaceholder"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange()"
              autocomplete="off">
          </div>
        </div>
        
        <div class="options-container" [style.max-height.px]="maxHeight">
          <ng-container *ngIf="filteredOptions.length > 0; else noOptionsTemplate">
            <div 
              *ngFor="let option of filteredOptions; let i = index; trackBy: trackByValue"
              class="option-item"
              [class.selected]="isOptionSelected(option)"
              [class.highlighted]="highlightedIndex === i"
              [class.disabled]="option.disabled"
              (click)="selectOption(option)"
              (mouseenter)="highlightedIndex = i">
              
              <i *ngIf="option.icon" 
                 class="pi pi-{{ option.icon }} option-icon" 
                 [style.color]="option.color"></i>
              
              <div class="option-content">
                <span class="option-label">{{ option.label }}</span>
                <span *ngIf="option.description" class="option-description">{{ option.description }}</span>
              </div>
              
              <span *ngIf="option.badge" class="option-badge">{{ option.badge }}</span>
              
              <i *ngIf="isOptionSelected(option)" class="pi pi-check check-icon"></i>
            </div>
          </ng-container>
          
          <ng-template #noOptionsTemplate>
            <div class="no-options">
              <i class="pi pi-info-circle"></i>
              <span>{{ noOptionsMessage }}</span>
            </div>
          </ng-template>
        </div>
        
        <div *ngIf="showFooter && filteredOptions.length > 0" class="dropdown-footer">
          <span class="footer-text">{{ filteredOptions.length }} opções</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dropdown-container {
      position: relative;
      width: 100%;
      z-index: 1;
    }

    .dropdown-container.open {
      z-index: 99999;
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

    .dropdown-trigger.open {
      border-color: rgba(99, 102, 241, 0.8);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
    }

    .dropdown-trigger.error {
      border-color: rgba(239, 68, 68, 0.6);
    }

    .dropdown-trigger.success {
      border-color: rgba(34, 197, 94, 0.6);
    }

    .dropdown-trigger.disabled {
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    }

    .dropdown-value {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .selected-text {
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

    .clear-button {
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

    .clear-button:hover {
      background: rgba(239, 68, 68, 0.2);
      color: rgba(239, 68, 68, 1);
    }

    .arrow-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: rgba(255, 255, 255, 0.7);
      transition: transform 0.2s ease;
    }

    .arrow-icon.rotated {
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
    }

    .dropdown-container.open {
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

    .options-container {
      max-height: 300px;
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
      position: relative;
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

    .check-icon {
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
    }

    .footer-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }

    .options-container::-webkit-scrollbar {
      width: 6px;
    }

    .options-container::-webkit-scrollbar-track {
      background: rgba(31, 41, 55, 0.5);
    }

    .options-container::-webkit-scrollbar-thumb {
      background: rgba(99, 102, 241, 0.5);
      border-radius: 3px;
    }

    .options-container::-webkit-scrollbar-thumb:hover {
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
export class DropdownModernoComponent implements ControlValueAccessor, OnInit, OnDestroy {
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
  @Input() maxHeight = 300;
  @Input() showFooter = false;
  @Input() hasError = false;
  @Input() hasSuccess = false;
  @Input() ariaLabel = '';

  @Output() selectionChange = new EventEmitter<DropdownOption | null>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isOpen = false;
  selectedValue: any = null;
  searchTerm = '';
  highlightedIndex = -1;
  triggerWidth = 0;
  filteredOptions: DropdownOption[] = [];

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.filteredOptions = [...this.options];
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick);
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

  toggleDropdown(): void {
    if (this.disabled) return;
    
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    if (this.disabled || this.isOpen) return;
    
    this.isOpen = true;
    this.highlightedIndex = this.getSelectedIndex();
    this.opened.emit();
    
    setTimeout(() => {
      if (this.triggerRef) {
        this.triggerWidth = this.triggerRef.nativeElement.offsetWidth;
      }
      
      if (this.searchable && this.searchInputRef) {
        this.searchInputRef.nativeElement.focus();
      }
      
      document.addEventListener('click', this.onDocumentClick.bind(this));
    });
  }

  closeDropdown(): void {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.searchTerm = '';
    this.highlightedIndex = -1;
    this.filteredOptions = [...this.options];
    this.closed.emit();
    this.onTouched();
    
    document.removeEventListener('click', this.onDocumentClick);
  }

  selectOption(option: DropdownOption): void {
    if (option.disabled) return;
    
    this.selectedValue = option.value;
    this.onChange(option.value);
    this.selectionChange.emit(option);
    this.closeDropdown();
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.selectedValue = null;
    this.onChange(null);
    this.selectionChange.emit(null);
  }

  isOptionSelected(option: DropdownOption): boolean {
    return this.selectedValue === option.value;
  }

  onSearchChange(): void {
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
          this.openDropdown();
        } else if (this.highlightedIndex >= 0 && this.filteredOptions[this.highlightedIndex]) {
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
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

  private onDocumentClick(event: Event): void {
    const target = event.target as Element;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }

  trackByValue(index: number, option: DropdownOption): any {
    return option.value;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
