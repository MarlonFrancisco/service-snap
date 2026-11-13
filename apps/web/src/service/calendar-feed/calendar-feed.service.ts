import type {
  ICalendarFeed,
  ICalendarFeedRevokeResponse,
  TCalendarFeedTarget,
} from '@/types/api/calendar-feed.types';
import { apiClient, isNotFoundError } from '../api';

const feedPath = ({ storeId, memberId }: TCalendarFeedTarget) =>
  `/partner/stores/${storeId}/members/${memberId}/calendar-feed`;

export class CalendarFeedService {
  static apiClient = apiClient;

  /** A API responde 404 enquanto o link não foi criado: vira `null` aqui. */
  public static async get(target: TCalendarFeedTarget) {
    try {
      return await this.apiClient.get<ICalendarFeed>(feedPath(target));
    } catch (error) {
      if (isNotFoundError(error)) return null;
      throw error;
    }
  }

  /** Cria o link ou troca o token: o endereço anterior para de funcionar. */
  public static async rotate(target: TCalendarFeedTarget) {
    return this.apiClient.post<ICalendarFeed>(feedPath(target), {});
  }

  public static async revoke(target: TCalendarFeedTarget) {
    return this.apiClient.delete<ICalendarFeedRevokeResponse>(feedPath(target));
  }
}
