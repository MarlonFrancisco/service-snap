import { cn } from '@repo/ui';
import {
  REVIEWS_PRIMARY_BUTTON_CLASS,
  REVIEWS_SCROLL_AREA_CLASS,
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
    handleShowWriteReview,
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
                Se você usou este estabelecimento, conte como foi para outros
                clientes.
              </p>
              <button
                type="button"
                onClick={handleShowWriteReview}
                className={cn(
                  REVIEWS_PRIMARY_BUTTON_CLASS,
                  'w-full md:w-auto',
                )}
              >
                Escrever uma avaliação
              </button>
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
