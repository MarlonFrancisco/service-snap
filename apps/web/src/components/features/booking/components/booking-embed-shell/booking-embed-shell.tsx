'use client';

import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';
import { BookingEmbedNotice } from './booking-embed-notice';
import {
  EMBED_PRIMARY_ACTION_CLASS,
  EMBED_SECONDARY_ACTION_CLASS,
  EMBED_STATE_NOTICE,
  EMBED_STATE_SUBTITLE,
} from './booking-embed-shell.constants';
import { useBookingEmbedShell } from './booking-embed-shell.hook';
import type { TBookingEmbedShellConfig } from './booking-embed-shell.types';

/** Casco compacto do widget: cabeçalho da loja, conteúdo rolável e assinatura. */
export const BookingEmbedShell = ({
  subtitle,
  state,
  scrollAreaRef,
  children,
}: TBookingEmbedShellConfig) => {
  const { title, handleClose } = useBookingEmbedShell();
  const notice = state ? EMBED_STATE_NOTICE[state] : null;

  return (
    <div
      className={cn(
        plusJakartaSans.className,
        'flex h-dvh flex-col bg-white text-[#0B0B0F] antialiased',
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#EBE9F0] px-5 py-[18px]">
        <div className="min-w-0">
          <p className="truncate text-base font-bold">{title}</p>
          <p aria-live="polite" className="truncate text-xs text-[#5F5C6E]">
            {state ? EMBED_STATE_SUBTITLE[state] : subtitle}
          </p>
        </div>
        <button
          type="button"
          aria-label="Fechar"
          onClick={handleClose}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-[#F4F3F7] text-lg leading-none transition-colors hover:bg-[#EBE9F0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]"
        >
          ×
        </button>
      </header>

      <main ref={scrollAreaRef} className="min-h-0 flex-1 overflow-y-auto">
        {notice ? (
          <BookingEmbedNotice
            role={state === 'error' ? 'alert' : 'status'}
            title={notice.title}
            description={notice.description}
            isLoading={state === 'loading'}
          >
            {state === 'booked' ? (
              <a
                href="/profile"
                target="_blank"
                rel="noopener"
                className={EMBED_PRIMARY_ACTION_CLASS}
              >
                Ver meus agendamentos
              </a>
            ) : null}
            {state !== 'loading' ? (
              <button
                type="button"
                onClick={handleClose}
                className={EMBED_SECONDARY_ACTION_CLASS}
              >
                Fechar
              </button>
            ) : null}
          </BookingEmbedNotice>
        ) : (
          children
        )}
      </main>

      <footer className="flex shrink-0 items-center justify-center gap-1.5 pt-3.5 pb-4 text-xs text-[#5F5C6E]">
        <span
          aria-hidden="true"
          className="relative size-3.5 rounded-[4px] border-[1.6px] border-current after:absolute after:right-[16%] after:bottom-[14%] after:size-[30%] after:rounded-full after:bg-[#9810fa] after:content-['']"
        />
        Agendamento por ServiceSnap
      </footer>
    </div>
  );
};
