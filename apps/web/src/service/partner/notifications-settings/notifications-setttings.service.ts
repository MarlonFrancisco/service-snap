import { INotificationsSettings } from '@/types/api/notifications.types';
import { apiClient } from '../../api';

export class NotificationsSettingsService {
  static apiClient = apiClient;

  static async get(storeId: string): Promise<INotificationsSettings> {
    return await this.apiClient.get<INotificationsSettings>(
      `/partner/stores/${storeId}/notifications/settings`,
    );
  }

  static async update(
    storeId: string,
    notificationsSettings: Partial<INotificationsSettings>,
  ) {
    return await this.apiClient.put<INotificationsSettings>(
      `/partner/stores/${storeId}/notifications/settings`,
      notificationsSettings,
    );
  }
}
