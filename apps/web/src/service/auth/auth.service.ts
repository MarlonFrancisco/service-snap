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
