import type { IStoreHoliday } from '@/types/api/holidays.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

export class HolidaysService {
  static apiClient: HttpClientService = apiClient;

  /** `from`/`to` em YYYY-MM-DD, inclusivos. */
  static async getAll(
    storeId: string,
    range: { from?: string; to?: string } = {},
  ) {
    const params = new URLSearchParams(
      Object.entries(range).filter(([, value]) => !!value) as [string, string][],
    );
    const query = params.size ? `?${params}` : '';

    return await this.apiClient.get<IStoreHoliday[]>(
      `/partner/stores/${storeId}/holidays${query}`,
    );
  }

  static async create(storeId: string, holiday: { date: string; name?: string }) {
    return await this.apiClient.post<IStoreHoliday>(
      `/partner/stores/${storeId}/holidays`,
      holiday,
    );
  }

  static async delete(storeId: string, holidayId: string) {
    return await this.apiClient.delete<{ id: string }>(
      `/partner/stores/${storeId}/holidays/${holidayId}`,
    );
  }
}
