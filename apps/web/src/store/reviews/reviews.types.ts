import { IReview, IReviewableSchedule } from '@/types/reviews.types';

export interface IReviewsStore {
  isOpen: boolean;
  showWriteReview: boolean;
  reviews: IReview[];
  storeId: string;
  businessName: string;
  /**
   * Atendimento a avaliar. Vem do perfil (o agendamento clicado) ou do botão
   * "Avaliar meu atendimento"; o formulário envia o `scheduleId` dele.
   */
  reviewTarget: IReviewableSchedule | null;
  toggleReviewsModalAction: (open: boolean) => Promise<void>;
  setReviewsAttributesAction: (
    attributes: Partial<IReviewsStore>,
  ) => Promise<void>;
}
