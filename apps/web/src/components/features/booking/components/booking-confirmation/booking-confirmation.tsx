'use client';

import { HEADER_STICKY_TOP_CLASS } from '@/components/layout';
import { cn } from '@repo/ui';
import { Check, Download, CalendarPlus, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useBookingConfirmation } from './booking-confirmation.hook';
import type { TBookingConfirmationConfig } from './booking-confirmation.types';

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';
const ACTION_CLASS = cn(
  'flex h-[54px] w-full items-center justify-center gap-2.5 rounded-full border border-[#E3E1EA] bg-white px-5 text-[15px] font-bold text-[#0B0B0F] transition-colors hover:bg-[#F7F6FA] md:h-14',
  FOCUS_CLASS,
);
const ACTION_PRIMARY_CLASS = cn(
  ACTION_CLASS,
  'border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]',
);
const TEXT_LINK_CLASS = cn(
  'inline-flex min-h-12 items-center justify-center text-[15px] font-bold text-[#0B0B0F] underline underline-offset-[3px] lg:min-h-11 lg:text-sm',
  FOCUS_CLASS,
);
const ROW_CLASS =
  'border-b border-[#F0EEF4] py-[11px] text-sm lg:mt-5 lg:border-b-0 lg:border-t lg:pt-5 lg:pb-0';
const TERM_CLASS =
  'text-xs font-bold tracking-[0.06em] text-[#5F5C6E] uppercase lg:mb-2.5 lg:text-[13px]';
const DETAIL_CLASS = 'mt-[3px] font-semibold lg:mt-0 lg:font-normal';
const DETAIL_SUB_CLASS =
  'mt-px block text-[13px] font-medium text-[#5F5C6E] lg:mt-0.5 lg:font-normal';
const ICON_CLASS = 'size-5 shrink-0';

export const BookingConfirmation = ({
  confirmation,
  onBackToStore,
}: TBookingConfirmationConfig) => {
  const {
    storeName,
    storeHref,
    addressLine,
    cityLine,
    professionalName,
    dateLabel,
    timeLabel,
    services,
    totalLabel,
    policySentence,
    googleCalendarUrl,
    whatsAppUrl,
    handleDownloadIcs,
  } = useBookingConfirmation({ confirmation });

  const links = (
    <>
      <Link href="/profile?tab=bookings" className={TEXT_LINK_CLASS}>
        Ver meus agendamentos
      </Link>
      <Link
        href={storeHref}
        onClick={onBackToStore}
        className={TEXT_LINK_CLASS}
      >
        Voltar para a loja
      </Link>
    </>
  );

  return (
    <div className="mx-auto w-full max-w-[82.5rem] px-5 pb-7 md:px-10 lg:pb-0">
      <div className="grid grid-cols-1 items-start lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10 lg:pt-14">
        <section aria-labelledby="booking-confirmed-title">
          <span className="mt-7 mb-4 grid size-14 place-items-center rounded-full bg-[#DFF2E7] text-[#0A5536] lg:mt-0 lg:mb-5 lg:size-16">
            <Check
              className="size-[26px] lg:size-[30px]"
              strokeWidth={2.4}
              aria-hidden
            />
          </span>
          <h1
            id="booking-confirmed-title"
            className="text-[26px] font-extrabold tracking-[-0.03em] text-[#0B0B0F] lg:text-[30px]"
          >
            Agendamento confirmado
          </h1>
          <p className="mt-1.5 mb-5 text-[15px] leading-[1.45] text-[#5F5C6E] lg:mb-7">
            Seu horário na {storeName} está reservado.
          </p>

          <div className="grid gap-2.5 lg:max-w-[420px]">
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={ACTION_PRIMARY_CLASS}
            >
              <CalendarPlus
                className={ICON_CLASS}
                strokeWidth={1.9}
                aria-hidden
              />
              Adicionar ao Google Agenda
            </a>
            <button
              type="button"
              onClick={handleDownloadIcs}
              className={ACTION_CLASS}
            >
              <Download className={ICON_CLASS} strokeWidth={1.9} aria-hidden />
              Baixar para o calendário (.ics)
            </button>
            {whatsAppUrl && (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={ACTION_CLASS}
              >
                <MessageCircle
                  className={ICON_CLASS}
                  strokeWidth={1.9}
                  aria-hidden
                />
                Falar com a loja no WhatsApp
              </a>
            )}
          </div>

          <p className="mt-4 rounded-[14px] bg-[#F7F6FA] px-4 py-3.5 text-sm leading-[1.5] text-[#0B0B0F] lg:mt-5 lg:max-w-[420px] lg:px-[18px] lg:py-4">
            {policySentence}
          </p>

          <div className="mt-5 hidden flex-wrap gap-x-6 gap-y-2 lg:flex">
            {links}
          </div>
        </section>

        <aside
          aria-label="Resumo da reserva"
          className={cn(
            'mt-6 rounded-3xl border border-[#EBE9F0] bg-white p-5 lg:sticky lg:mt-0 lg:rounded-[28px] lg:border-0 lg:p-7 lg:shadow-[0_12px_40px_rgba(15,12,30,0.1)]',
            HEADER_STICKY_TOP_CLASS,
          )}
        >
          <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#0B0B0F] lg:text-xl lg:tracking-[-0.025em]">
            Resumo da reserva
          </h2>
          <p className="mt-1 hidden text-sm text-[#5F5C6E] lg:block">
            {storeName}
          </p>

          <dl className="mt-2 text-[#0B0B0F] lg:mt-0">
            <div className={cn(ROW_CLASS, 'lg:hidden')}>
              <dt className={TERM_CLASS}>Loja</dt>
              <dd className={DETAIL_CLASS}>{storeName}</dd>
            </div>
            <div className={ROW_CLASS}>
              <dt className={TERM_CLASS}>Serviços</dt>
              <dd className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between gap-3 lg:gap-4"
                  >
                    <div className={cn(DETAIL_CLASS, 'min-w-0')}>
                      {service.label}
                      <span className={DETAIL_SUB_CLASS}>
                        {service.duration}
                      </span>
                    </div>
                    <b className="mt-[3px] shrink-0 font-bold lg:mt-0">
                      {service.price}
                    </b>
                  </div>
                ))}
              </dd>
            </div>
            <div className={ROW_CLASS}>
              <dt className={TERM_CLASS}>Profissional</dt>
              <dd className={DETAIL_CLASS}>{professionalName}</dd>
            </div>
            <div className={ROW_CLASS}>
              <dt className={TERM_CLASS}>Data e hora</dt>
              <dd className={DETAIL_CLASS}>
                {dateLabel}
                <span className={DETAIL_SUB_CLASS}>{timeLabel}</span>
              </dd>
            </div>
            {(addressLine || cityLine) && (
              <div className={ROW_CLASS}>
                <dt className={TERM_CLASS}>Endereço</dt>
                <dd className={DETAIL_CLASS}>
                  {addressLine}
                  {cityLine && (
                    <span className={DETAIL_SUB_CLASS}>{cityLine}</span>
                  )}
                </dd>
              </div>
            )}
          </dl>

          <div className="flex items-baseline justify-between pt-3.5 text-[15px] font-semibold text-[#0B0B0F] lg:mt-5 lg:border-t lg:border-[#F0EEF4] lg:pt-5">
            Total
            <b className="text-[22px] font-extrabold lg:text-2xl">
              {totalLabel}
            </b>
          </div>
          <p className="mt-0.5 text-right text-[13px] text-[#5F5C6E] lg:mt-1">
            Pagamento no local
          </p>
        </aside>

        <div className="mt-4 grid gap-1 lg:hidden">{links}</div>
      </div>
    </div>
  );
};
