import type { IReview } from '@/types/reviews.types';

export type TReviewItemConfig = {
  review: IReview;
  storeId: string;
  /** Falso depois de um 403: quem está logado não responde por esta loja. */
  canReply: boolean;
  onForbidden: () => void;
};
