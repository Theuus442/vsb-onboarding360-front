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
    
    .p-input-icon-right .pi-times {
      right: 2.5rem;
      color: #6b7280;
    }
    
    .p-input-icon-right .pi-times:hover {
      color: #ef4444;
    }
    
    .p-inputtext {
      width: 100%;
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
