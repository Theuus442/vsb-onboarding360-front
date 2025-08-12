import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-busca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-input-container">
      <input
        type="text"
        class="search-input"
        [placeholder]="placeholder()"
        [value]="valor()"
        (input)="onInput($event)"
        (keyup.enter)="onEnter()"
        (focus)="onFocus()"
        (blur)="onBlur()"
        [disabled]="disabled()"
        #searchInput>
      
      @if (loading()) {
        <div class="search-loader">
          <div class="loader-spinner"></div>
        </div>
      }
      
      @if (valor() && !loading()) {
        <button 
          type="button" 
          class="clear-button"
          (click)="clearSearch()"
          aria-label="Limpar busca">
          <i class="pi pi-times"></i>
        </button>
      }
    </div>
  `,
  styles: [`
    .search-input-container {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
    }

    .search-input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      color: #ffffff;
      font: 400 0.875rem 'Inter', sans-serif;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
      backdrop-filter: blur(10px);
    }

    .search-input:focus {
      border-color: #667eea;
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 
        0 0 0 3px rgba(102, 126, 234, 0.2),
        0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
      transition: color 0.3s ease;
    }

    .search-input:focus::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    .search-input:disabled {
      background: rgba(255, 255, 255, 0.02);
      color: rgba(255, 255, 255, 0.4);
      cursor: not-allowed;
    }

    .search-loader {
      position: absolute;
      right: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loader-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .clear-button {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .clear-button:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      transform: scale(1.1);
    }

    .clear-button:focus {
      outline: 2px solid #667eea;
      outline-offset: 2px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Enhanced focus states */
    .search-input-container:focus-within .search-input {
      border-color: #667eea;
      box-shadow: 
        0 0 0 3px rgba(102, 126, 234, 0.2),
        0 4px 12px rgba(0, 0, 0, 0.1);
    }

    /* Animation for smooth interactions */
    .search-input-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border-radius: 0.75rem;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: -1;
    }

    .search-input-container:focus-within::before {
      opacity: 1;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .search-input {
        padding: 0.75rem;
        font-size: 0.875rem;
      }
    }

    /* Reduce motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
      .search-input,
      .clear-button,
      .search-input-container::before {
        transition: none;
      }
      
      .loader-spinner {
        animation: none;
      }
    }
  `]
})
export class InputBuscaComponent {
  readonly placeholder = input<string>('Pesquisar...');
  readonly valor = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly debounceTime = input<number>(300);

  readonly buscarChange = output<string>();
  readonly enterPressed = output<string>();
  readonly focusChange = output<boolean>();

  private debounceTimer: number | null = null;

  constructor() {
    // Effect to handle debounced search
    effect(() => {
      const currentValue = this.valor();
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
    });
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Clear existing timeout
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timeout for debounced search
    this.debounceTimer = window.setTimeout(() => {
      this.buscarChange.emit(value);
    }, this.debounceTime());
  }

  onEnter(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.enterPressed.emit(this.valor());
  }

  onFocus(): void {
    this.focusChange.emit(true);
  }

  onBlur(): void {
    this.focusChange.emit(false);
  }

  clearSearch(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.buscarChange.emit('');
  }
}
