import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevConfigService {
  
  /**
   * Get development info
   */
  getDevInfo(): any {
    return {
      production: environment.production,
      version: environment.version,
      apiUrl: environment.apiUrl
    };
  }

  /**
   * Initialize global console commands for development
   */
  initDevCommands(): void {
    if (!environment.production) {
      // Add global functions for easy development control
      (window as any).devConfig = {
        info: () => console.table(this.getDevInfo()),
        help: () => {
          console.group('🛠��� Development Commands');
          console.log('devConfig.info() - Show current configuration');
          console.log('devConfig.help() - Show this help');
          console.groupEnd();
        }
      };

      console.log('🛠️ Development commands available! Type "devConfig.help()" for more info.');
    }
  }
}
