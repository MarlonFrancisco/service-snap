import { cn } from '@repo/ui';
import {
  REVIEWS_PRIMARY_BUTTON_CLASS,
  REVIEWS_SCROLL_AREA_CLASS,
  REVIEWS_SECONDARY_BUTTON_CLASS,
  REVIEWS_SECTION_TITLE_CLASS,
} from '../../reviews-modal.styles';
import { RatingBar } from '../rating-bar';
import { ReviewCard } from '../review-card';
import { WriteReviewForm } from '../write-review-form';
import { useReviewsContent } from './reviews-content.hook';

export const ReviewsContent = () => {
  const {
    reviews,
    showWriteReview,
    hasReviews,
    formattedAverage,
    totalLabel,
    ratingBars,
    shareState,
    reviewableDateLabel,
    handleShowWriteReview,
    handleLogin,
  } = useReviewsContent();

  if (!reviews) return null;

  return (
    <div className={REVIEWS_SCROLL_AREA_CLASS}>
      <h2 className="pr-12 text-[28px] font-extrabold tracking-[-0.03em]">
        Avaliações de clientes
      </h2>
      <p className="mt-1.5 text-[15px] text-[#5F5C6E]">
        {hasReviews ? (
          <>
            <b className="text-[#0B0B0F]">★ {formattedAverage}</b> · Baseado em{' '}
            {totalLabel}
          </>
        ) : (
          'Ainda não há avaliações'
        )}
      </p>

      {showWriteReview ? (
        <WriteReviewForm />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-6 border-b border-[#EBE9F0] pb-6 md:grid-cols-2 md:gap-8">
            <div>
              <h3 className={REVIEWS_SECTION_TITLE_CLASS}>Distribuição</h3>
              {ratingBars.map(({ rating, percentage }) => (
                <RatingBar
                  key={rating}
                  rating={rating}
                  percentage={percentage}
                />
              ))}
            </div>

            <div>
              <h3 className={REVIEWS_SECTION_TITLE_CLASS}>
                Compartilhe sua opinião
              </h3>
              <p className="mb-3.5 text-sm leading-[1.55] text-[#5F5C6E]">
                Só quem foi atendido aqui avalia, uma vez por atendimento. Assim
                toda nota vem de uma visita real.
              </p>
              {shareState === 'reviewable' && (
                <button
                  type="button"
                  onClick={handleShowWriteReview}
                  className={cn(
                    REVIEWS_PRIMARY_BUTTON_CLASS,
                    'w-full md:w-auto',
                  )}
                >
                  Avaliar meu atendimento de {reviewableDateLabel}
                </button>
              )}
              {shareState === 'not-served' && (
                <p className="text-[13px] leading-[1.5] text-[#5F5C6E]">
                  Depois de ser atendido aqui, você pode avaliar a visita.
                </p>
              )}
              {shareState === 'logged-out' && (
                <div className="grid gap-2.5 md:justify-items-start">
                  <p className="text-[13px] leading-[1.5] text-[#5F5C6E]">
                    Já foi atendido aqui? Entre na sua conta para avaliar a
                    visita.
                  </p>
                  <button
                    type="button"
                    onClick={handleLogin}
                    className={cn(
                      REVIEWS_SECONDARY_BUTTON_CLASS,
                      'w-full md:w-auto',
                    )}
                  >
                    Entrar para avaliar
                  </button>
                </div>
              )}
            </div>
          </div>

          {hasReviews && (
            <>
              <h3 className={cn(REVIEWS_SECTION_TITLE_CLASS, 'mt-6')}>
                Avaliações recentes
              </h3>
              <div className="grid gap-2.5">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
