import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    <div class="loading-container" [style.height]="containerHeight">
      <div class="loading-content">
        <p-progressSpinner 
          [style]="{ width: size, height: size }"
          styleClass="custom-spinner"
          strokeWidth="3">
        </p-progressSpinner>
        @if (message) {
          <p class="loading-message">{{ message }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading-message {
      font: 400 0.875rem 'Inter', sans-serif;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
      text-align: center;
    }

    ::ng-deep .custom-spinner .p-progressspinner-circle {
      stroke: #A52831;
      animation: dash 1.5s ease-in-out infinite;
    }

    @keyframes dash {
      0% {
        stroke-dasharray: 1, 150;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35;
      }
      100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124;
      }
    }
  `]
})
export class LoadingComponent {
  @Input() message?: string;
  @Input() size = '32px';
  @Input() containerHeight = 'auto';
}
