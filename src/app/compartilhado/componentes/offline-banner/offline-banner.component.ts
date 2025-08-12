import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!isOnline()" class="offline-banner">
      <div class="banner-content">
        <i class="pi pi-wifi-slash"></i>
        <span>Você está offline. Verifique sua conexão com a internet.</span>
      </div>
    </div>
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #ef4444;
      color: white;
      z-index: 10000;
      padding: 0.75rem;
    }
    
    .banner-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .pi {
      font-size: 1rem;
    }
  `]
})
export class OfflineBannerComponent implements OnInit, OnDestroy {
  readonly isOnline = signal(navigator.onLine);

  ngOnInit(): void {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  }

  private updateOnlineStatus = (): void => {
    this.isOnline.set(navigator.onLine);
  };
}
