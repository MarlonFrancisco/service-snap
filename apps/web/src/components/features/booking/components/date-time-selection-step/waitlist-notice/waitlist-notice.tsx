'use client';
import { Button } from '@repo/ui';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useWaitlistNotice } from './waitlist-notice.hook';

const OUTLINE_BUTTON_CLASS =
  'h-11 rounded-full border-line-strong bg-white px-4 text-[13px] font-bold text-ink shadow-none hover:bg-surface';

/** Dia selecionado sem horário livre: oferece (ou mostra) a lista de espera. */
export const WaitlistNotice = () => {
  const {
    dayLabel,
    joinDescription,
    joinedSummary,
    isInWaitlist,
    isCheckingWaitlist,
    isJoiningWaitlist,
    isLeavingWaitlist,
    handleJoin,
    handleLeave,
    handleChooseOtherDay,
  } = useWaitlistNotice();

  if (isCheckingWaitlist) {
    return (
      <div
        aria-hidden
        className="h-[164px] animate-pulse rounded-[18px] bg-surface"
      />
    );
  }

  if (isInWaitlist) {
    return (
      <div className="flex flex-col gap-4">
        <div
          role="status"
          className="flex gap-3 rounded-[18px] bg-success-bg-soft p-[18px] text-sm leading-[1.5] text-success"
        >
          <Check className="mt-0.5 size-[18px] shrink-0" aria-hidden />
          <p>
            <span className="block text-[15px] font-bold">
              Você está na lista de espera
            </span>
            {joinedSummary}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleChooseOtherDay}
            className={OUTLINE_BUTTON_CLASS}
          >
            Escolher outro dia
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleLeave}
            disabled={isLeavingWaitlist}
            className={OUTLINE_BUTTON_CLASS}
          >
            {isLeavingWaitlist ? 'Saindo...' : 'Sair da lista'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-[18px] bg-surface p-5">
      <p className="text-base font-bold text-ink">
        {dayLabel} está cheio
      </p>
      <p className="text-sm leading-[1.5] text-ink-muted">{joinDescription}</p>
      <Button
        type="button"
        onClick={handleJoin}
        disabled={isJoiningWaitlist}
        className="h-12 gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover has-[>svg]:px-5"
      >
        {isJoiningWaitlist ? (
          <Loader2 className="size-[18px] animate-spin" aria-hidden />
        ) : (
          <Bell className="size-[18px]" aria-hidden />
        )}
        {isJoiningWaitlist ? 'Entrando na lista...' : 'Avise-me se vagar'}
      </Button>
    </div>
  );
};
