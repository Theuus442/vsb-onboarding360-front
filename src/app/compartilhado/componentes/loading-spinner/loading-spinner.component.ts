import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoadingSize = 'small' | 'medium' | 'large';
export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'bars';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [class]="containerClasses">
      @if (showOverlay) {
        <div class="loading-overlay" [style.background-color]="overlayColor"></div>
      }
      
      <div class="loading-content">
        @switch (variant) {
          @case ('spinner') {
            <div class="spinner" [class]="spinnerClasses">
              <div class="spinner-circle"></div>
            </div>
          }
          @case ('dots') {
            <div class="dots-loading" [class]="dotsClasses">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          }
          @case ('pulse') {
            <div class="pulse-loading" [class]="pulseClasses">
              <div class="pulse-circle"></div>
            </div>
          }
          @case ('bars') {
            <div class="bars-loading" [class]="barsClasses">
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
            </div>
          }
        }
        
        @if (message) {
          <p class="loading-message" [class]="messageClasses">{{ message }}</p>
        }
        
        @if (showProgress && progress !== null) {
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progress"></div>
            </div>
            <span class="progress-text">{{ progress }}%</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
      }
      
      &.centered {
        min-height: 200px;
      }
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      backdrop-filter: blur(2px);
      z-index: 1;
    }

    .loading-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    /* Spinner Loading */
    .spinner {
      position: relative;
      
      &.small { width: 20px; height: 20px; }
      &.medium { width: 32px; height: 32px; }
      &.large { width: 48px; height: 48px; }
    }

    .spinner-circle {
      width: 100%;
      height: 100%;
      border: 2px solid rgba(var(--primary-color-rgb, 59, 130, 246), 0.2);
      border-left-color: rgb(var(--primary-color-rgb, 59, 130, 246));
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Dots Loading */
    .dots-loading {
      display: flex;
      gap: 4px;
      
      &.small .dot { width: 6px; height: 6px; }
      &.medium .dot { width: 8px; height: 8px; }
      &.large .dot { width: 12px; height: 12px; }
    }

    .dot {
      background: rgb(var(--primary-color-rgb, 59, 130, 246));
      border-radius: 50%;
      animation: bounce 1.4s infinite both;
      
      &:nth-child(1) { animation-delay: -0.32s; }
      &:nth-child(2) { animation-delay: -0.16s; }
      &:nth-child(3) { animation-delay: 0s; }
    }

    /* Pulse Loading */
    .pulse-loading {
      position: relative;
      
      &.small { width: 20px; height: 20px; }
      &.medium { width: 32px; height: 32px; }
      &.large { width: 48px; height: 48px; }
    }

    .pulse-circle {
      width: 100%;
      height: 100%;
      background: rgb(var(--primary-color-rgb, 59, 130, 246));
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }

    /* Bars Loading */
    .bars-loading {
      display: flex;
      gap: 2px;
      align-items: end;
      
      &.small { height: 16px; }
      &.medium { height: 24px; }
      &.large { height: 32px; }
    }

    .bar {
      background: rgb(var(--primary-color-rgb, 59, 130, 246));
      animation: bars 1.2s infinite;
      
      &:nth-child(1) { animation-delay: -1.1s; width: 2px; }
      &:nth-child(2) { animation-delay: -1.0s; width: 2px; }
      &:nth-child(3) { animation-delay: -0.9s; width: 2px; }
      &:nth-child(4) { animation-delay: -0.8s; width: 2px; }
    }

    /* Loading Message */
    .loading-message {
      margin: 0;
      color: rgb(var(--text-color-rgb, 107, 114, 128));
      font-weight: 500;
      text-align: center;
      
      &.small { font-size: 12px; }
      &.medium { font-size: 14px; }
      &.large { font-size: 16px; }
    }

    /* Progress Bar */
    .progress-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 200px;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.1);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: rgb(var(--primary-color-rgb, 59, 130, 246));
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 12px;
      color: rgb(var(--text-color-rgb, 107, 114, 128));
      font-weight: 500;
    }

    /* Animations */
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(0.8);
        opacity: 0.5;
      }
    }

    @keyframes bars {
      0%, 40%, 100% {
        transform: scaleY(0.4);
      }
      20% {
        transform: scaleY(1);
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() variant: LoadingVariant = 'spinner';
  @Input() size: LoadingSize = 'medium';
  @Input() message: string = '';
  @Input() showOverlay: boolean = false;
  @Input() overlayColor: string = 'rgba(255, 255, 255, 0.8)';
  @Input() fullscreen: boolean = false;
  @Input() centered: boolean = true;
  @Input() showProgress: boolean = false;
  @Input() progress: number | null = null;

  get containerClasses(): string {
    const classes = [];
    if (this.fullscreen) classes.push('fullscreen');
    if (this.centered) classes.push('centered');
    return classes.join(' ');
  }

  get spinnerClasses(): string {
    return this.size;
  }

  get dotsClasses(): string {
    return this.size;
  }

  get pulseClasses(): string {
    return this.size;
  }

  get barsClasses(): string {
    return this.size;
  }

  get messageClasses(): string {
    return this.size;
  }
}
