import { IUser } from '@/types/api';
import { apiClient } from '../api';

export class AuthService {
  static readonly apiClient = apiClient;

  static async login(email?: string, telephone?: string) {
    return await this.apiClient.post<{
      isNewUser: boolean;
    }>('/auth/code', {
      email,
      telephone,
    });
  }

  static async validateCode(code: string, email?: string, telephone?: string) {
    return await this.apiClient.post<void>('/auth/validate-code', {
      code,
      email,
      telephone,
    });
  }

  static async register(payload: {
    email: string;
    telephone: string;
    firstName: string;
    lastName: string;
    acceptedTerms: boolean;
    referralCode?: string;
  }) {
    return await this.apiClient.post<void>('/auth/register', payload);
  }

  /** Manda um código de 6 dígitos para o e-mail novo (409 se já for de outra conta). */
  static async requestEmailChange(email: string) {
    return await this.apiClient.post<{ email: string }>('/auth/email-change', {
      email,
    });
  }

  /** Confere o código, troca o e-mail e renova a sessão (cookie novo). */
  static async confirmEmailChange(code: string) {
    return await this.apiClient.post<{ user: { id: string; email: string } }>(
      '/auth/email-change/confirm',
      { code },
    );
  }

  static async googleLogin(token: string, referralCode?: string) {
    return await this.apiClient.post<{
      isNewUser: boolean;
      user: IUser;
    }>('/auth/social/google', {
      token,
      referralCode,
    });
  }
}
