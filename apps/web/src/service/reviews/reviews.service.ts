import type {
  ICreateReviewPayload,
  IReplyReviewPayload,
  IReview,
  IReviewableSchedule,
} from '@/types/reviews.types';
import { apiClient } from '../api';
import { HttpClientService } from '../api/http-client.service';

export type { ICreateReviewPayload, IReplyReviewPayload };

export interface ICreateReviewResponse {
  review: IReview;
  averageRating: number;
  totalReviews: number;
}

export class ReviewsService {
  static apiClient: HttpClientService = apiClient;

  static async getByStore(storeId: string) {
    return await this.apiClient.get<IReview[]>(
      `/partner/stores/${storeId}/reviews`,
    );
  }

  /** Atendimento do cliente logado que ainda pode ser avaliado, ou `null`. */
  static async getReviewable(storeId: string) {
    const reviewable = await this.apiClient.get<IReviewableSchedule | null>(
      `/partner/stores/${storeId}/reviews/reviewable`,
    );
    // Sem atendimento, a API responde sem corpo
    return reviewable ?? null;
  }

  static async create(payload: ICreateReviewPayload) {
    return await this.apiClient.post<IReview>(
      `/partner/stores/${payload.store.id}/reviews`,
      payload,
    );
  }

  static async update(reviewId: string, payload: ICreateReviewPayload) {
    return await this.apiClient.put<IReview>(
      `/partner/stores/${payload.store.id}/reviews/${reviewId}`,
      payload,
    );
  }

  /** Resposta pública da loja; só dono e gerente. Texto vazio apaga. */
  static async reply({ storeId, reviewId, reply }: IReplyReviewPayload) {
    return await this.apiClient.put<IReview>(
      `/partner/stores/${storeId}/reviews/${reviewId}/reply`,
      { reply },
    );
  }

  static async delete(storeId: string, reviewId: string) {
    return await this.apiClient.delete<{ id: string }>(
      `/partner/stores/${storeId}/reviews/${reviewId}`,
    );
  }
}
