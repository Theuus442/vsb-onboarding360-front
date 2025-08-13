import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-campo-busca',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule
  ],
  template: `
    <div class="campo-busca-container">
      <span class="p-input-icon-left p-input-icon-right">
        <i class="pi pi-search"></i>
        <input 
          type="text" 
          pInputText 
          [placeholder]="placeholder"
          [(ngModel)]="termoBusca"
          (input)="onInputChange($event)"
          (keyup.enter)="buscar()"
          class="w-full"
        >
        <i 
          *ngIf="termoBusca" 
          class="pi pi-times cursor-pointer"
          (click)="limpar()"
        ></i>
      </span>
      
      <button 
        type="button" 
        pButton 
        icon="pi pi-search" 
        class="p-button-outlined ml-2"
        (click)="buscar()"
        [disabled]="!termoBusca.trim()"
      >
      </button>
    </div>
  `,
  styles: [`
    .campo-busca-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .p-input-icon-left .pi-search {
      color: rgba(255, 255, 255, 0.6);
      font-size: 1rem;
      left: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .p-input-icon-left:focus-within .pi-search {
      color: #667eea;
      transform: scale(1.05);
    }

    .p-input-icon-right .pi-times {
      right: 2.75rem;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.875rem;
      transition: all 0.2s ease;
      cursor: pointer;
      padding: 0.125rem;
      border-radius: 0.25rem;
    }

    .p-input-icon-right .pi-times:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      transform: scale(1.1);
    }

    .p-inputtext {
      width: 100%;
      background: rgba(255, 255, 255, 0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: #ffffff !important;
      padding: 1rem 3rem 1rem 2.75rem !important;
    }

    .p-inputtext:focus {
      outline: none !important;
      border-color: #667eea !important;
      background: rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2) !important;
    }

    .p-inputtext::placeholder {
      color: rgba(255, 255, 255, 0.5) !important;
    }

    .p-button-outlined {
      background: rgba(102, 126, 234, 0.1) !important;
      border: 1px solid rgba(102, 126, 234, 0.3) !important;
      color: #667eea !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .p-button-outlined:hover {
      background: rgba(102, 126, 234, 0.2) !important;
      border-color: #667eea !important;
      transform: translateY(-1px);
    }

    .p-button-outlined:focus {
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2) !important;
    }
  `]
})
export class CampoBuscaComponent {
  @Input() placeholder = 'Buscar...';
  @Input() valor = '';
  @Output() buscarChange = new EventEmitter<string>();
  @Output() limparChange = new EventEmitter<void>();

  termoBusca = '';

  ngOnInit(): void {
    this.termoBusca = this.valor;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.termoBusca = target.value;
  }

  buscar(): void {
    const termo = this.termoBusca?.trim();
    this.buscarChange.emit(termo);
  }

  limpar(): void {
    this.termoBusca = '';
    this.buscarChange.emit('');
    this.limparChange.emit();
  }
}
