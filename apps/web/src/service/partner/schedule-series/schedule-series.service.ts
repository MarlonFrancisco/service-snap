import type {
  IScheduleSeries,
  TCancelScheduleSeries,
  TCreateScheduleSeries,
  TScheduleSeriesCancelled,
  TScheduleSeriesCreated,
  TScheduleSeriesMembership,
} from '@/types/api/schedule-series.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

/** Agendamento recorrente: só a equipe da loja cria e cancela. */
export class ScheduleSeriesService {
  static apiClient: HttpClientService = apiClient;

  /** As datas livres entram; as que conflitam voltam em `conflicts`. */
  static async create(storeId: string, series: TCreateScheduleSeries) {
    return await this.apiClient.post<TScheduleSeriesCreated>(
      `/partner/stores/${storeId}/schedule-series`,
      series,
    );
  }

  static async get(storeId: string, seriesId: string) {
    return await this.apiClient.get<IScheduleSeries>(
      `/partner/stores/${storeId}/schedule-series/${seriesId}`,
    );
  }

  static async getBySchedule(storeId: string, scheduleId: string) {
    return await this.apiClient.get<TScheduleSeriesMembership>(
      `/partner/stores/${storeId}/schedule-series/by-schedule/${scheduleId}`,
    );
  }

  /** Cancela os agendamentos marcados da série a partir de `from`. */
  static async cancel(
    storeId: string,
    seriesId: string,
    request: TCancelScheduleSeries,
  ) {
    return await this.apiClient.post<TScheduleSeriesCancelled>(
      `/partner/stores/${storeId}/schedule-series/${seriesId}/cancel`,
      request,
    );
  }
}
