import { WhatsappGlyph } from '@/components/ui/whatsapp-bot-qr';
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
import { useBookingWhatsappLink } from '../booking-whatsapp-card';

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
  const { whatsappBot, handleClick: handleWhatsappClick } =
    useBookingWhatsappLink('booking_mobile_bar');
  // Depois dos serviços, a conversa recomeçaria do zero: o atalho fica só no início.
  const whatsappLink =
    currentStep === 'services' ? whatsappBot?.link : undefined;

  return (
    <div className="sticky bottom-0 z-20 mt-auto border-t border-line bg-white/98 px-5 pt-2.5 pb-[calc(12px+env(safe-area-inset-bottom,0px))] md:hidden">
      {hasServices ? (
        <Drawer>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-between text-[13px] font-medium text-ink-muted"
            >
              <span className="text-left">
                {selectedServices.length}{' '}
                {selectedServices.length === 1 ? 'serviço' : 'serviços'}
                <b className="block text-[17px] font-extrabold text-ink">
                  {formatPrice(totalPrice)}
                </b>
              </span>
              <u className="font-semibold text-ink">Ver resumo</u>
            </button>
          </DrawerTrigger>
          <DrawerContent className={plusJakartaSans.className}>
            <DrawerHeader className="border-b border-surface-3 text-left">
              <DrawerTitle className="text-xl font-extrabold tracking-[-0.025em] text-ink">
                Resumo da reserva
              </DrawerTitle>
              <DrawerDescription className="text-sm text-ink-muted">
                {businessName} · {businessAddress}
              </DrawerDescription>
            </DrawerHeader>
            <div className="max-h-[70vh] overflow-y-auto px-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
              <BookingSummaryItems summary={summary} />

              <div className="mt-5 flex items-baseline justify-between border-t border-surface-3 pt-5 text-[15px] font-semibold text-ink">
                Total
                <b className="text-2xl font-extrabold">
                  {formatPrice(totalPrice)}
                </b>
              </div>
              <p className="mt-1 text-right text-[13px] text-ink-muted">
                Pagamento no local
              </p>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <p className="flex min-h-11 items-center text-[13px] font-medium text-ink-muted">
          Nenhum serviço selecionado
        </p>
      )}

      <div className="mt-1.5 flex gap-2.5">
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className="block min-w-0 flex-1 rounded-full bg-brand p-4 text-center text-[15px] font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-brand"
        >
          {nextButtonText}
        </button>
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Agendar pelo WhatsApp"
            onClick={handleWhatsappClick}
            className="grid size-[52px] shrink-0 place-items-center self-center rounded-full border border-line-strong bg-white text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <WhatsappGlyph className="size-[22px]" />
          </a>
        )}
      </div>
    </div>
  );
}
