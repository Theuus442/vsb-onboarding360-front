import { LOGIN_CONSTANTS, ERROR_MESSAGES } from './login.constants';

export interface ValidationError {
  readonly field: string;
  readonly message: string;
}

export type ValidationRule = (value: string) => ValidationError | null;

// Validation utility functions
export class LoginValidators {
  static isValidEmail(email: string): boolean {
    return LOGIN_CONSTANTS.EMAIL_REGEX.test(email);
  }

  static required(field: string, message: string): ValidationRule {
    return (value: string) => !value ? { field, message } : null;
  }

  static email(field: string): ValidationRule {
    return (value: string) => !this.isValidEmail(value) ? 
      { field, message: ERROR_MESSAGES.EMAIL_INVALID } : null;
  }

  static minLength(field: string, minLength: number): ValidationRule {
    return (value: string) => value.length < minLength ? {
      field,
      message: ERROR_MESSAGES.PASSWORD_MIN_LENGTH.replace('{min}', minLength.toString())
    } : null;
  }

  static validateField(value: string, rules: ValidationRule[]): ValidationError | null {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  }

  static getEmailRules(): ValidationRule[] {
    return [
      this.required('email', ERROR_MESSAGES.EMAIL_REQUIRED),
      this.email('email')
    ];
  }

  static getPasswordRules(): ValidationRule[] {
    return [
      this.required('password', ERROR_MESSAGES.PASSWORD_REQUIRED),
      this.minLength('password', LOGIN_CONSTANTS.MIN_PASSWORD_LENGTH)
    ];
  }
}
