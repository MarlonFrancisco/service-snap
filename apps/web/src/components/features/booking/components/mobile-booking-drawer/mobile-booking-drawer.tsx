import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@repo/ui';
import {
  TBookingAdvanceConfig,
  TBookingSummaryConfig,
} from '../../booking.types';
import { useBookingSidebar } from '../booking-sidebar/booking-sidebar.hook';
import { BookingSummaryItems } from '../booking-sidebar/booking-summary-items';

type TMobileBookingDrawerConfig = TBookingSummaryConfig & TBookingAdvanceConfig;

/** Barra inferior do mobile: total, gaveta de resumo e botão de avanço. */
export function MobileBookingDrawer({
  totalPrice,
  totalDuration,
  currentStep,
  nextButtonText,
  isNextDisabled,
  onNext,
}: TMobileBookingDrawerConfig) {
  const summary = useBookingSidebar(totalPrice, totalDuration, currentStep);
  const { businessName, businessAddress, selectedServices } = summary.data;
  const { formatPrice } = summary.formatters;
  const hasServices = selectedServices.length > 0;

  return (
    <div className="sticky bottom-0 z-20 mt-auto border-t border-[#EBE9F0] bg-white/98 px-5 pt-2.5 pb-[calc(12px+env(safe-area-inset-bottom,0px))] md:hidden">
      {hasServices ? (
        <Drawer>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-between text-[13px] font-medium text-[#5F5C6E]"
            >
              <span className="text-left">
                {selectedServices.length}{' '}
                {selectedServices.length === 1 ? 'serviço' : 'serviços'}
                <b className="block text-[17px] font-extrabold text-[#0B0B0F]">
                  {formatPrice(totalPrice)}
                </b>
              </span>
              <u className="font-semibold text-[#0B0B0F]">Ver resumo</u>
            </button>
          </DrawerTrigger>
          <DrawerContent className={plusJakartaSans.className}>
            <DrawerHeader className="border-b border-[#F0EEF4] text-left">
              <DrawerTitle className="text-xl font-extrabold tracking-[-0.025em] text-[#0B0B0F]">
                Resumo da reserva
              </DrawerTitle>
              <DrawerDescription className="text-sm text-[#5F5C6E]">
                {businessName} · {businessAddress}
              </DrawerDescription>
            </DrawerHeader>
            <div className="max-h-[70vh] overflow-y-auto px-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
              <BookingSummaryItems summary={summary} />

              <div className="mt-5 flex items-baseline justify-between border-t border-[#F0EEF4] pt-5 text-[15px] font-semibold text-[#0B0B0F]">
                Total
                <b className="text-2xl font-extrabold">
                  {formatPrice(totalPrice)}
                </b>
              </div>
              <p className="mt-1 text-right text-[13px] text-[#5F5C6E]">
                Pagamento no local
              </p>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <p className="flex min-h-11 items-center text-[13px] font-medium text-[#5F5C6E]">
          Nenhum serviço selecionado
        </p>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled}
        className="mt-1.5 block w-full rounded-full bg-[#0B0B0F] p-4 text-center text-[15px] font-bold text-white transition-colors hover:bg-[#2B2B2B] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#0B0B0F]"
      >
        {nextButtonText}
      </button>
    </div>
  );
}
