import {
  IAppointment,
  IAvailabilitySlot,
  ICreateAppointment,
  TRescheduleRequest,
  TScheduleListQuery,
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

  /**
   * Agenda da loja. Passe `from`/`to` para carregar só o período mostrado;
   * profissional recebe só a própria agenda, peça o filtro que pedir.
   */
  static async getAll(
    storeId: string,
    { from, to, memberId }: Omit<TScheduleListQuery, 'page' | 'limit'> = {},
  ) {
    const params = new URLSearchParams({
      ...(from && { from }),
      ...(to && { to }),
      ...(memberId && { memberId }),
    });
    const query = params.size ? `?${params}` : '';

    return await this.apiClient.get<IAppointment[]>(
      `/partner/stores/${storeId}/schedules${query}`,
    );
  }

  /**
   * Muda dia, horário e (opcional) profissional da visita inteira. A equipe
   * encaixa onde quiser; o cliente segue a política da loja (403 com
   * `SCHEDULE_POLICY_CODE`) e só pega horário oferecido (409).
   */
  static async reschedule(
    storeId: string,
    scheduleId: string,
    request: TRescheduleRequest,
  ) {
    return await this.apiClient.patch<IAppointment>(
      `/partner/stores/${storeId}/schedules/${scheduleId}/reschedule`,
      request,
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
