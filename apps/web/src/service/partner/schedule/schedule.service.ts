import {
  IAppointment,
  IAvailabilitySlot,
  ICreateAppointment,
  IPresenceAwaiting,
} from '@/types/api/schedule.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

export class ScheduleService {
  static apiClient: HttpClientService = apiClient;
  static headers?: HeadersInit;

  static async create(storeId: string, schedule: Partial<ICreateAppointment>) {
    return await this.apiClient.post<IAppointment[]>(
      `/partner/stores/${storeId}/schedules`,
      schedule,
    );
  }

  static async getAll(storeId: string) {
    return await this.apiClient.get<IAppointment[]>(
      `/partner/stores/${storeId}/schedules`,
    );
  }

  static async getPresenceAwaiting(storeId: string) {
    return await this.apiClient.get<IPresenceAwaiting[]>(
      `/partner/stores/${storeId}/schedules/presence/awaiting`,
    );
  }

  static async getAvailability(
    storeId: string,
    {
      date,
      serviceIds,
      memberId,
    }: { date: string; serviceIds: string[]; memberId?: string },
    config?: RequestInit,
  ) {
    const params = new URLSearchParams({
      date,
      serviceIds: serviceIds.join(','),
      ...(memberId && { memberId }),
    });

    return await this.apiClient.get<IAvailabilitySlot[]>(
      `/partner/stores/${storeId}/schedules/availability?${params}`,
      config,
    );
  }

  static async update(
    storeId: string,
    scheduleId: string,
    schedule: Partial<IAppointment>,
  ) {
    return await this.apiClient.put<IAppointment>(
      `/partner/stores/${storeId}/schedules/${scheduleId}`,
      schedule,
    );
  }

  static async delete(storeId: string, scheduleId: string) {
    return await this.apiClient.delete<IAppointment>(
      `/partner/stores/${storeId}/schedules/${scheduleId}`,
    );
  }
}
