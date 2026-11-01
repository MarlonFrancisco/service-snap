import { IUser } from '@/types/api';
import { apiClient } from '../api';
import { HttpClientService } from '../api/http-client.service';

export class UsersService {
  static apiClient: HttpClientService = apiClient;

  static async getUser(headers?: HeadersInit) {
    return await this.apiClient.get<IUser>('/users/me', { headers });
  }

  static async updateAvatar(avatar: string) {
    return await this.apiClient.patch<IUser>('/users/me/avatar', {
      avatar,
    });
  }

  static async delete() {
    return await this.apiClient.delete<{ id: string }>(`/users/me`);
  }
}
