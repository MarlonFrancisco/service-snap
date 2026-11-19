import { HEADER_STICKY_TOP_CLASS } from '@/components/layout';
import { cn } from '@repo/ui';
import {
  TBookingAdvanceConfig,
  TBookingSummaryConfig,
} from '../../booking.types';
import { useBookingSidebar } from './booking-sidebar.hook';
import { BookingSummaryItems } from './booking-summary-items';

type TBookingSidebarConfig = TBookingSummaryConfig & TBookingAdvanceConfig;

export function BookingSidebar({
  totalPrice,
  totalDuration,
  currentStep,
  nextButtonText,
  isNextDisabled,
  onNext,
}: TBookingSidebarConfig) {
  const summary = useBookingSidebar(totalPrice, totalDuration, currentStep);
  const { businessName, businessAddress, selectedServices } = summary.data;
  const isCheckout = currentStep === 'checkout';

  return (
    <aside
      aria-label="Resumo da reserva"
      className={cn(
        'flex flex-col rounded-[28px] bg-white shadow-[0_12px_40px_rgba(15,12,30,0.1)] lg:sticky lg:max-h-[calc(100dvh-8rem)]',
        HEADER_STICKY_TOP_CLASS,
      )}
    >
      <div
        tabIndex={0}
        aria-label="Itens da reserva"
        className="min-h-0 overflow-y-auto rounded-t-[28px] px-7 pt-7 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
      >
        <h2 className="text-xl font-extrabold tracking-[-0.025em] text-ink">
          Resumo da reserva
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {isCheckout ? `${businessName} · ${businessAddress}` : businessName}
        </p>

        <BookingSummaryItems summary={summary} />
      </div>

      <div className="shrink-0 px-7 pb-7">
        {selectedServices.length > 0 && (
          <>
            <div className="mt-5 flex items-baseline justify-between border-t border-surface-3 pt-5 text-[15px] font-semibold text-ink">
              Total
              <b className="text-2xl font-extrabold">
                {summary.formatters.formatPrice(totalPrice)}
              </b>
            </div>
            <p className="mt-1 text-right text-[13px] text-ink-muted">
              Pagamento no local
            </p>
          </>
        )}

        {!isCheckout && (
          <button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            className="mt-5 block w-full rounded-full bg-ink p-[17px] text-center text-[15px] font-bold text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
          >
            {nextButtonText}
          </button>
        )}
      </div>
    </aside>
  );
}
