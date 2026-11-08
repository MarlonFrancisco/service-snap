import { HEADER_STICKY_TOP_CLASS } from '@/components/layout';
import { cn } from '@repo/ui';
import { Loader2 } from 'lucide-react';
import type { TReferralClientPanelConfig } from './referral-client-panel.types';

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';
const COPY_BUTTON_CLASS = cn(
  'h-11 shrink-0 rounded-full bg-white px-3.5 text-xs font-bold text-[#0B0B0F] transition-colors hover:bg-[#EBE9F0] md:h-9 md:bg-[#F4F3F7]',
  FOCUS_CLASS,
);

export const ReferralClientPanel = ({
  referral,
  isPendingReferral,
  isErrorReferral,
  refetchReferral,
  primaryLabel,
  primaryDisplayUrl,
  secondaryLabel,
  secondaryDisplayUrl,
  referredLabel,
  handleCopyCode,
  handleCopyPrimary,
  handleCopySecondary,
  handleShare,
  isSticky = true,
}: TReferralClientPanelConfig) => {
  return (
    <aside
      aria-label="Indicação"
      className={cn(
        'rounded-3xl bg-white p-5 shadow-[0_10px_32px_rgba(15,12,30,0.1)] md:rounded-[28px] md:p-6 md:shadow-[0_12px_40px_rgba(15,12,30,0.1)]',
        isSticky && ['min-[1021px]:sticky', HEADER_STICKY_TOP_CLASS],
      )}
    >
      <h2 className="text-xl font-extrabold tracking-[-0.02em] md:tracking-[-0.025em]">
        Indique e compartilhe
      </h2>
      <p className="mt-1 mb-3.5 text-sm leading-normal text-[#5F5C6E] md:mb-[18px]">
        Convide amigos ou parceiros com o seu link exclusivo.
      </p>

      {isPendingReferral ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-[#5F5C6E]">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Carregando seu link…
        </div>
      ) : isErrorReferral || !referral ? (
        <div className="text-center">
          <p className="text-sm text-[#5F5C6E]">
            Não foi possível carregar seu código de indicação.
          </p>
          <button
            type="button"
            onClick={() => refetchReferral()}
            className={cn(
              'mt-3.5 h-11 rounded-full border border-[#E3E1EA] px-[18px] text-[13px] font-semibold transition-colors hover:bg-[#F7F6FA]',
              FOCUS_CLASS,
            )}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 rounded-[14px] bg-[#F7F6FA] py-2 pr-2 pl-3.5 text-base font-extrabold tracking-[0.04em] md:py-3 md:pl-4 md:text-lg">
            <span className="min-w-0 truncate">{referral.code}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              aria-label="Copiar código"
              className={cn(COPY_BUTTON_CLASS, 'tracking-normal')}
            >
              Copiar
            </button>
          </div>

          <div className="hidden md:block">
            <p className="mt-4 mb-1.5 text-[13px] font-semibold">
              {primaryLabel}
            </p>
            <div className="flex items-center gap-2 rounded-full border border-[#E3E1EA] py-1.5 pr-1.5 pl-3.5 text-[13px] text-[#5F5C6E]">
              <span className="min-w-0 flex-1 truncate">
                {primaryDisplayUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyPrimary}
                aria-label={`Copiar ${primaryLabel.toLowerCase()}`}
                className={COPY_BUTTON_CLASS}
              >
                Copiar
              </button>
            </div>

            <p className="mt-4 mb-1.5 text-[13px] font-semibold">
              {secondaryLabel}
            </p>
            <div className="flex items-center gap-2 rounded-full border border-[#E3E1EA] py-1.5 pr-1.5 pl-3.5 text-[13px] text-[#5F5C6E]">
              <span className="min-w-0 flex-1 truncate">
                {secondaryDisplayUrl}
              </span>
              <button
                type="button"
                onClick={handleCopySecondary}
                aria-label={`Copiar ${secondaryLabel.toLowerCase()}`}
                className={COPY_BUTTON_CLASS}
              >
                Copiar
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleShare()}
            className={cn(
              'mt-3 block h-[50px] w-full rounded-full bg-[#0B0B0F] text-sm font-bold text-white transition-colors hover:bg-[#2B2B2B] md:mt-[18px] md:h-[52px]',
              FOCUS_CLASS,
            )}
          >
            <span className="md:hidden">Compartilhar link</span>
            <span className="hidden md:inline">Compartilhar</span>
          </button>

          <p className="mt-2.5 text-center text-[13px] text-[#5F5C6E] md:mt-3">
            {referredLabel}
          </p>
        </>
      )}
    </aside>
  );
};
