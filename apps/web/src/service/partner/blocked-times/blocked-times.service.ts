import { apiClient } from '@/service/api';
import { IBlockedTime } from '@/types/api/blocked-times.types';

export class BlockedTimesService {
  static apiClient = apiClient;
  static headers?: HeadersInit;

  static async getAll(storeId: string, storeMemberId: string) {
    return await this.apiClient.get<IBlockedTime[]>(
      `/partner/stores/${storeId}/members/${storeMemberId}/blocked-times`,
    );
  }

  static async create(storeId: string, blockedTime: Partial<IBlockedTime>) {
    return await this.apiClient.post<IBlockedTime>(
      `/partner/stores/${storeId}/members/${blockedTime?.storeMember?.id}/blocked-times`,
      blockedTime,
    );
  }

  static async createBulk(
    storeId: string,
    storeMemberId: string,
    blockedTimes: Array<{
      date: Date | string;
      time: string;
      /** Sem fim, o bloqueio ocupa um slot da grade da loja. */
      endTime?: string;
      isRecurring?: boolean;
      dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    }>,
  ) {
    return await this.apiClient.post<IBlockedTime[]>(
      `/partner/stores/${storeId}/members/${storeMemberId}/blocked-times/bulk`,
      { blockedTimes },
    );
  }

  static async deleteBulk(
    storeId: string,
    storeMemberId: string,
    blockedTimes: Array<{
      id: string;
    }>,
  ) {
    return await this.apiClient.post<
      { id: string; storeMember: { id: string } }[]
    >(
      `/partner/stores/${storeId}/members/${storeMemberId}/blocked-times/bulk/delete`,
      { blockedTimes },
    );
  }

  static async update(
    storeId: string,
    blockedTimeId: string,
    blockedTime: Partial<IBlockedTime>,
  ) {
    return await this.apiClient.put<IBlockedTime>(
      `/partner/stores/${storeId}/members/${blockedTime?.storeMember?.id}/blocked-times/${blockedTimeId}`,
      blockedTime,
    );
  }

  static async delete(
    storeId: string,
    storeMemberId: string,
    blockedTimeId: string,
  ) {
    return await this.apiClient.delete<IBlockedTime>(
      `/partner/stores/${storeId}/members/${storeMemberId}/blocked-times/${blockedTimeId}`,
    );
  }
}
