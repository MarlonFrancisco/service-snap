import { IUser } from './api';
import { IStore } from './api/stores.types';

/** Atendimento que originou a avaliação ("Atendido em dd/mm · Serviço"). */
export interface IReviewSchedule {
  id: string;
  /** `YYYY-MM-DD`, sem horário. */
  date: string;
  service: { id: string; name: string } | null;
  storeMember: { id: string; user: { id: string; firstName: string } } | null;
}

export interface IReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: IUser;
  store: IStore;
  /** Resposta pública da loja. */
  reply: string | null;
  repliedAt: string | null;
  /** `null` em avaliações anteriores à verificação de atendimento. */
  schedule: IReviewSchedule | null;
}

/** Atendimento concluído do cliente que ainda não foi avaliado. */
export interface IReviewableSchedule {
  scheduleId: string;
  /** `YYYY-MM-DD`, sem horário. */
  date: string;
}

export interface ICreateReviewPayload {
  store: { id: string };
  user: { id: string };
  rating: number;
  comment: string;
  scheduleId?: string;
}

export interface IReplyReviewPayload {
  storeId: string;
  reviewId: string;
  /** Texto vazio apaga a resposta. */
  reply: string;
}
