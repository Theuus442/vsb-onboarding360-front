import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  template: `
    <div class="search-input-container">
      <input
        pInputText
        type="text"
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
        (keyup.enter)="onSearch()"
        class="search-input"
      />
      @if (value) {
        <button 
          class="clear-button"
          (click)="onClear()"
          type="button">
          <i class="pi pi-times"></i>
        </button>
      }
    </div>
  `,
  styles: [`
    .search-input-container {
      position: relative;
      width: 100%;
    }

    .search-input {
      width: 100%;
      padding-right: 2.5rem;
    }

    .clear-button {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .clear-button:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #374151;
    }
  `]
})
export class SearchInputComponent {
  @Input() placeholder = 'Buscar...';
  @Input() value = '';
  @Output() search = new EventEmitter<string>();

  protected readonly searchValue = signal('');

  ngOnInit() {
    this.searchValue.set(this.value);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchValue.set(target.value);
    this.search.emit(target.value);
  }

  onSearch(): void {
    this.search.emit(this.searchValue());
  }

  onClear(): void {
    this.searchValue.set('');
    this.search.emit('');
  }
}
