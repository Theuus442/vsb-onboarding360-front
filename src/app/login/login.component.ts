import { Component, signal, OnInit, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Models and Services
import { AutenticacaoService } from '../compartilhado/servicos/autenticacao.service';
import { LoginRequest } from '../compartilhado/modelos';

// Local utilities and constants
import { LOGIN_CONSTANTS, ERROR_MESSAGES, FEATURES, PARTNER_ROLES } from './login.constants';
import { LoginValidators, ValidationError } from './login.validators';
import { LoginAnimationService } from './login-animation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  // Dependency injection using modern inject()
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly authService = inject(AutenticacaoService);
  private readonly animationService = inject(LoginAnimationService);
  private readonly destroyRef = inject(DestroyRef);

  // Create destroy notifier in injection context
  private readonly destroy$ = takeUntilDestroyed(this.destroyRef);

  // Form state signals (reactive state management)
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);
  protected rememberMe = false;

  // Validation state signals
  private readonly emailError = signal<string | null>(null);
  private readonly passwordError = signal<string | null>(null);

  // Computed signals for UI state (derived state)
  protected readonly showEmailError = computed(() => Boolean(this.emailError()));
  protected readonly showPasswordError = computed(() => Boolean(this.passwordError()));
  protected readonly emailErrorMessage = computed(() => this.emailError() ?? '');
  protected readonly passwordErrorMessage = computed(() => this.passwordError() ?? '');

  // Form validation computed signal
  protected readonly isFormValid = computed(() => {
    return this.hasValidCredentials() && this.hasNoValidationErrors();
  });

  // Static template data
  protected readonly features = FEATURES;
  protected readonly particles = Array(LOGIN_CONSTANTS.PARTICLE_COUNT).fill(0);

  ngOnInit(): void {
    this.initializeComponent();
  }

  // Initialization methods
  private initializeComponent(): void {
    this.loadSavedCredentials();
    this.animationService.scheduleEntranceAnimation();
  }

  private loadSavedCredentials(): void {
    const savedEmail = localStorage.getItem(LOGIN_CONSTANTS.REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      this.email.set(savedEmail);
      this.rememberMe = true;
    }
  }

  // Form validation helpers
  private hasValidCredentials(): boolean {
    return this.email().length > 0 && 
           this.password().length > 0 && 
           LoginValidators.isValidEmail(this.email());
  }

  private hasNoValidationErrors(): boolean {
    return !this.showEmailError() && !this.showPasswordError();
  }

  // Validation methods
  validateEmail(): void {
    const error = LoginValidators.validateField(this.email(), LoginValidators.getEmailRules());
    this.emailError.set(error?.message ?? null);
  }

  validatePassword(): void {
    const error = LoginValidators.validateField(this.password(), LoginValidators.getPasswordRules());
    this.passwordError.set(error?.message ?? null);
  }

  clearEmailError(): void {
    this.emailError.set(null);
  }

  clearPasswordError(): void {
    this.passwordError.set(null);
  }

  // UI interaction methods
  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  // Authentication workflow
  onLogin(): void {
    if (!this.validateForm()) {
      this.showValidationMessage();
      return;
    }

    this.executeLogin();
  }

  private validateForm(): boolean {
    this.validateEmail();
    this.validatePassword();
    return this.isFormValid();
  }

  private showValidationMessage(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Formulário inválido',
      detail: ERROR_MESSAGES.FORM_INVALID
    });
  }

  private executeLogin(): void {
    this.loading.set(true);
    this.handleRememberMe();

    const credentials = this.buildLoginCredentials();

    this.authService.login(credentials)
      .pipe(this.destroy$)
      .subscribe({
        next: (response: any) => this.handleLoginSuccess(response),
        error: (error: any) => this.handleLoginError(error)
      });
  }

  private buildLoginCredentials(): LoginRequest {
    return {
      email: this.email(),
      senha: this.password()
    };
  }

  private handleRememberMe(): void {
    const action = this.rememberMe ? 'setItem' : 'removeItem';
    localStorage[action](LOGIN_CONSTANTS.REMEMBER_EMAIL_KEY, this.email());
  }

  // Success/Error handling
  private handleLoginSuccess(response: any): void {
    this.loading.set(false);
    this.showSuccessMessage(response.usuario.nome);
    this.animationService.playSuccessAnimation();
    this.scheduleRedirect(response.usuario.papel);
  }

  private handleLoginError(error: any): void {
    this.loading.set(false);
    this.animationService.playErrorAnimation();
    this.showErrorMessage(error);
  }

  private showSuccessMessage(userName: string): void {
    this.messageService.add({
      severity: 'success',
      summary: ERROR_MESSAGES.LOGIN_SUCCESS,
      detail: ERROR_MESSAGES.WELCOME_MESSAGE.replace('{name}', userName),
      life: 3000
    });
  }

  private showErrorMessage(error: any): void {
    const { message, detail } = this.getErrorMessages(error);
    this.messageService.add({
      severity: 'error',
      summary: message,
      detail,
      life: 5000
    });
  }

  private getErrorMessages(error: any): { message: string; detail: string } {
    const errorMap = new Map([
      [401, { 
        message: ERROR_MESSAGES.INVALID_CREDENTIALS, 
        detail: ERROR_MESSAGES.CREDENTIAL_ERROR_DETAIL 
      }],
      [0, { 
        message: ERROR_MESSAGES.CONNECTION_ERROR, 
        detail: ERROR_MESSAGES.CONNECTION_ERROR_DETAIL 
      }]
    ]);

    return errorMap.get(error.status) ?? {
      message: ERROR_MESSAGES.SERVER_ERROR,
      detail: error.message || ERROR_MESSAGES.SERVER_ERROR_DETAIL
    };
  }

  private scheduleRedirect(userRole: string): void {
    setTimeout(() => {
      const route = this.determineRedirectRoute(userRole);
      this.router.navigate([route]);
    }, LOGIN_CONSTANTS.REDIRECT_DELAY);
  }

  private determineRedirectRoute(userRole: string): string {
    return PARTNER_ROLES.includes(userRole as any) ? '/painel-parceiro' : '/painel';
  }

  // UI event handlers
  onForgotPassword(): void {
    this.messageService.add({
      severity: 'info',
      summary: ERROR_MESSAGES.PASSWORD_RECOVERY,
      detail: ERROR_MESSAGES.PASSWORD_RECOVERY_DETAIL
    });
  }
}
