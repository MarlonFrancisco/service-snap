import { cn, Skeleton } from '@repo/ui';
import {
  CUSTOMERS_BUTTON_CLASS,
  CUSTOMERS_CARD_CLASS,
  CUSTOMERS_CARD_LEAD_CLASS,
  CUSTOMERS_CARD_TITLE_CLASS,
  CUSTOMERS_PAGER_CLASS,
  CUSTOMERS_SMALL_BUTTON_CLASS,
  CUSTOMERS_STATUS_BADGE_CLASS,
} from '../../../customers-module.styles';
import type { TCustomerHistoryConfig } from './customer-history.types';

const ROW_CLASS =
  'grid items-center gap-4 border-b border-[#F0EEF4] py-3.5 text-sm sm:grid-cols-[150px_minmax(0,1fr)_auto]';
const SKELETON_ROWS = 4;

export const CustomerHistory = ({
  rows,
  rangeLabel,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  isLoading,
  isError,
  isRefreshing,
  onRetry,
}: TCustomerHistoryConfig) => {
  const renderRows = () => {
    if (isLoading) {
      return (
        <div role="status" aria-label="Carregando histórico">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <div key={index} className={ROW_CLASS}>
              <Skeleton className="h-4 w-24 rounded-full bg-[#F0EEF4]" />
              <Skeleton className="h-4 w-40 rounded-full bg-[#F0EEF4]" />
              <Skeleton className="h-6 w-20 rounded-full bg-[#F0EEF4]" />
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#FBE8E6] px-4 py-3 text-sm font-semibold text-[#A4231A]"
        >
          Não foi possível carregar o histórico.
          <button
            type="button"
            onClick={onRetry}
            className={cn(CUSTOMERS_BUTTON_CLASS, CUSTOMERS_SMALL_BUTTON_CLASS)}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    if (rows.length === 0) {
      return (
        <p className="rounded-[16px] bg-[#F7F6FA] px-4 py-5 text-sm text-[#5F5C6E]">
          Nenhum horário marcado ainda.
        </p>
      );
    }

    return (
      <ul
        aria-busy={isRefreshing || undefined}
        className={cn(isRefreshing && 'opacity-70')}
      >
        {rows.map((row) => (
          <li key={row.id} className={ROW_CLASS}>
            <div>
              <b className="block font-bold">{row.day}</b>
              <span className="mt-0.5 block text-[13px] text-[#5F5C6E]">
                {row.time}
              </span>
            </div>
            <div className="min-w-0">
              <b className="block font-bold break-words">{row.service}</b>
              <span className="mt-0.5 block text-[13px] break-words text-[#5F5C6E]">
                {row.professional}
              </span>
            </div>
            <span
              className={cn(
                CUSTOMERS_STATUS_BADGE_CLASS,
                'justify-self-start sm:justify-self-end',
                row.status.className,
              )}
            >
              {row.status.label}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section
      aria-labelledby="customer-history-title"
      className={CUSTOMERS_CARD_CLASS}
    >
      <h3 id="customer-history-title" className={CUSTOMERS_CARD_TITLE_CLASS}>
        Histórico
      </h3>
      <p className={CUSTOMERS_CARD_LEAD_CLASS}>
        Todos os horários deste cliente na loja
      </p>

      {renderRows()}

      {!isLoading && !isError && rows.length > 0 ? (
        <nav
          aria-label="Paginação do histórico"
          className={cn(CUSTOMERS_PAGER_CLASS, 'mt-4')}
        >
          <span>{rangeLabel}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={cn(
                CUSTOMERS_BUTTON_CLASS,
                CUSTOMERS_SMALL_BUTTON_CLASS,
              )}
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              className={cn(
                CUSTOMERS_BUTTON_CLASS,
                CUSTOMERS_SMALL_BUTTON_CLASS,
              )}
            >
              Próxima
            </button>
          </div>
        </nav>
      ) : null}
    </section>
  );
};
