'use client';

import {
  OPT_OUT_CARD_CLASS,
  OPT_OUT_CARD_TITLE_CLASS,
  OPT_OUT_CENTERED_CARD_CLASS,
  OPT_OUT_MAIN_CLASS,
  OPT_OUT_PAGE_CLASS,
  OPT_OUT_PRIMARY_BUTTON_CLASS,
  OPT_OUT_SECONDARY_BUTTON_CLASS,
  OPT_OUT_TEXT_CLASS,
} from '@/components/features/marketing-opt-out/marketing-opt-out.styles';
import { Skeleton } from '@repo/ui';
import { Check, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useWhatsappOptOut } from './whatsapp-opt-out.hook';
import type { TWhatsappOptOutPageConfig } from './whatsapp-opt-out.types';

const OptOutSkeleton = () => (
  <div role="status" aria-label="Carregando" className="grid gap-4">
    <Skeleton className="h-4 w-32 rounded-full bg-[#F0EEF4]" />
    <Skeleton className="h-8 w-48 rounded-full bg-[#F0EEF4]" />
    <Skeleton className="h-4 w-full rounded-full bg-[#F0EEF4]" />
    <Skeleton className="h-[180px] rounded-[24px] bg-[#F0EEF4]" />
  </div>
);

/** Página pública do link "Deixar de receber por WhatsApp" (sem login, #37). */
export const WhatsappOptOutPage = ({ token }: TWhatsappOptOutPageConfig) => {
  const {
    state,
    storeName,
    isOptingOut,
    handleOptOut,
    handleRetry,
    isRetrying,
  } = useWhatsappOptOut(token);

  const renderBody = () => {
    if (state === 'loading') return <OptOutSkeleton />;

    if (state === 'expired') {
      return (
        <div role="alert" className={OPT_OUT_CENTERED_CARD_CLASS}>
          <h1 className={OPT_OUT_CARD_TITLE_CLASS}>Este link não vale mais</h1>
          <p className={OPT_OUT_TEXT_CLASS}>
            Use o link do e-mail mais recente ou responda PARAR a uma mensagem
            da loja no WhatsApp.
          </p>
        </div>
      );
    }

    if (state === 'error') {
      return (
        <div role="alert" className={OPT_OUT_CENTERED_CARD_CLASS}>
          <h1 className={OPT_OUT_CARD_TITLE_CLASS}>
            Não foi possível abrir o link
          </h1>
          <p className={OPT_OUT_TEXT_CLASS}>
            Verifique a conexão e tente de novo.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className={OPT_OUT_PRIMARY_BUTTON_CLASS}
          >
            <RefreshCw aria-hidden="true" className="size-[18px] stroke-2" />
            Tentar de novo
          </button>
        </div>
      );
    }

    if (state === 'done') {
      return (
        <div role="status" className={OPT_OUT_CENTERED_CARD_CLASS}>
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-full bg-[#DFF2E7] text-[#0A5536]"
          >
            <Check className="size-6 stroke-[2.4]" />
          </span>
          <h1 className={OPT_OUT_CARD_TITLE_CLASS}>
            Pronto, nada mais por WhatsApp
          </h1>
          <p className={OPT_OUT_TEXT_CLASS}>
            Os lembretes de {storeName} passam a chegar por e-mail. Para voltar
            a receber pelo WhatsApp, é só aceitar de novo ao marcar.
          </p>
        </div>
      );
    }

    return (
      <>
        <header className="flex flex-col gap-1">
          <span className="text-[13px] text-[#5F5C6E]">{storeName}</span>
          <h1 className="text-2xl font-extrabold tracking-[-0.025em]">
            Deixar de receber por WhatsApp
          </h1>
          <p className={OPT_OUT_TEXT_CLASS}>
            Você não vai mais receber lembretes nem avisos da lista de espera de{' '}
            {storeName} pelo WhatsApp.
          </p>
        </header>

        <div className={OPT_OUT_CARD_CLASS}>
          <p className={OPT_OUT_TEXT_CLASS}>
            Os seus agendamentos continuam os mesmos, e os avisos chegam por
            e-mail.
          </p>
          <button
            type="button"
            onClick={handleOptOut}
            disabled={isOptingOut}
            className={OPT_OUT_PRIMARY_BUTTON_CLASS}
          >
            {isOptingOut ? 'Saindo…' : 'Deixar de receber'}
          </button>
          <Link href="/" className={OPT_OUT_SECONDARY_BUTTON_CLASS}>
            Continuar recebendo
          </Link>
        </div>
      </>
    );
  };

  return (
    <div className={OPT_OUT_PAGE_CLASS}>
      <main className={OPT_OUT_MAIN_CLASS}>{renderBody()}</main>
    </div>
  );
};
