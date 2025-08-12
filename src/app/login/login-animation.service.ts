import { Injectable } from '@angular/core';
import { LOGIN_CONSTANTS } from './login.constants';

@Injectable({
  providedIn: 'root'
})
export class LoginAnimationService {

  scheduleEntranceAnimation(): void {
    setTimeout(() => {
      this.addClassToElement('.login-container', 'animate-in');
    }, LOGIN_CONSTANTS.ANIMATION_DELAY);
  }

  playSuccessAnimation(): void {
    this.addClassToElement('.form-section', 'login-success');
  }

  playErrorAnimation(): void {
    const container = document.querySelector('.form-container');
    if (container) {
      container.classList.add('shake-error');
      
      setTimeout(() => {
        container.classList.remove('shake-error');
      }, LOGIN_CONSTANTS.ANIMATION_CLEANUP_DELAY);
    }
  }

  private addClassToElement(selector: string, className: string): void {
    const element = document.querySelector(selector);
    element?.classList.add(className);
  }
}
