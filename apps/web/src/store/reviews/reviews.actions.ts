import { TStoreAction } from '@/types/store.types';
import { IReviewsStore } from './reviews.types';

export const toggleReviewsModalAction: TStoreAction<IReviewsStore, boolean> =
  (set) => async (open: boolean) => {
    // Fechar descarta o formulário e o atendimento escolhido
    set(
      (open
        ? { isOpen: true }
        : {
            isOpen: false,
            showWriteReview: false,
            reviewTarget: null,
          }) as Partial<IReviewsStore>,
    );
  };

export const setReviewsAttributesAction: TStoreAction<
  IReviewsStore,
  Partial<IReviewsStore>
> = (set) => async (attributes) => {
  set(attributes as Partial<IReviewsStore>);
};
