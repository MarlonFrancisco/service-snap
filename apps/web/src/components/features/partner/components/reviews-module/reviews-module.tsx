'use client';

import { cn } from '@repo/ui';
import { MessageSquareText } from 'lucide-react';
import {
  ModuleErrorState,
  ModuleStatePanel,
  NoStoreState,
} from '../notifications-module/components/module-state';
import {
  MODULE_ACTION_CLASS,
  MODULE_LEAD_CLASS,
  MODULE_TITLE_CLASS,
} from '../notifications-module/notifications-module.styles';
import { ReviewItem } from './components/review-item';
import { ReviewsModuleSkeleton } from './reviews-module-skeleton';
import {
  REVIEW_REPLY_FORBIDDEN_MESSAGE,
  REVIEWS_FILTER_OPTIONS,
} from './reviews-module.constants';
import { useReviewsModule } from './reviews-module.hook';
import {
  REVIEWS_FILTER_BUTTON_CLASS,
  REVIEWS_SUMMARY_CARD_CLASS,
} from './reviews-module.styles';

export const ReviewsModule = () => {
  const {
    storeId,
    loadState,
    handleRetry,
    isRetrying,
    summary,
    filter,
    handleFilterChange,
    pageReviews,
    emptyState,
    hasFilteredReviews,
    currentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
    isReplyForbidden,
    handleReplyForbidden,
  } = useReviewsModule();

  if (loadState === 'no-store') return <NoStoreState />;
  if (loadState === 'loading') return <ReviewsModuleSkeleton />;
  if (loadState === 'error') {
    return <ModuleErrorState onRetry={handleRetry} isRetrying={isRetrying} />;
  }

  const summaryCards = [
    { label: 'Nota média', value: summary.averageLabel },
    { label: 'Avaliações', value: summary.total },
    { label: 'Sem resposta', value: summary.unanswered },
  ];

  return (
    <div className="grid gap-4">
      <div className="min-w-0">
        <h2 className={MODULE_TITLE_CLASS}>Avaliações dos clientes</h2>
        <p className={MODULE_LEAD_CLASS}>
          Só quem foi atendido avalia. Sua resposta aparece abaixo da avaliação,
          na página da loja.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {summaryCards.map(({ label, value }) => (
          <div key={label} className={REVIEWS_SUMMARY_CARD_CLASS}>
            <small className="block text-xs font-semibold text-[#5F5C6E]">
              {label}
            </small>
            <strong className="mt-1 block text-2xl font-extrabold tracking-[-0.02em]">
              {value}
            </strong>
          </div>
        ))}
      </div>

      {isReplyForbidden ? (
        <p
          role="alert"
          className="rounded-[14px] bg-[#FFF4E5] px-3.5 py-3 text-sm leading-normal text-[#6B3A00]"
        >
          {REVIEW_REPLY_FORBIDDEN_MESSAGE}
        </p>
      ) : null}

      <div
        role="group"
        aria-label="Filtrar avaliações"
        className="flex flex-wrap gap-1.5"
      >
        {REVIEWS_FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => handleFilterChange(value)}
            className={cn(MODULE_ACTION_CLASS, REVIEWS_FILTER_BUTTON_CLASS)}
          >
            {label}
          </button>
        ))}
      </div>

      {hasFilteredReviews ? (
        <>
          <section
            aria-label="Avaliações"
            className="overflow-hidden rounded-[22px] border border-[#EBE9F0]"
          >
            {pageReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                storeId={storeId}
                canReply={!isReplyForbidden}
                onForbidden={handleReplyForbidden}
              />
            ))}
          </section>

          <nav
            aria-label="Paginação"
            className="flex items-center justify-center gap-2 text-[13px] text-[#5F5C6E]"
          >
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={MODULE_ACTION_CLASS}
            >
              Anterior
            </button>
            Página {currentPage} de {totalPages}
            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={MODULE_ACTION_CLASS}
            >
              Próxima
            </button>
          </nav>
        </>
      ) : (
        <ModuleStatePanel
          icon={MessageSquareText}
          role="status"
          headingLevel="h3"
          title={emptyState.title}
          description={emptyState.description}
        />
      )}
    </div>
  );
};
