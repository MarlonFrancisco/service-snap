'use client';

import { Skeleton } from '@repo/ui';
import { Check, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useMarketingOptOut } from './marketing-opt-out.hook';
import {
  OPT_OUT_CARD_CLASS,
  OPT_OUT_CARD_TITLE_CLASS,
  OPT_OUT_CENTERED_CARD_CLASS,
  OPT_OUT_MAIN_CLASS,
  OPT_OUT_PAGE_CLASS,
  OPT_OUT_PRIMARY_BUTTON_CLASS,
  OPT_OUT_SECONDARY_BUTTON_CLASS,
  OPT_OUT_TEXT_CLASS,
} from './marketing-opt-out.styles';
import type { TMarketingOptOutPageConfig } from './marketing-opt-out.types';

const OptOutSkeleton = () => (
  <div role="status" aria-label="Carregando" className="grid gap-4">
    <Skeleton className="h-4 w-32 rounded-full bg-[#F0EEF4]" />
    <Skeleton className="h-8 w-48 rounded-full bg-[#F0EEF4]" />
    <Skeleton className="h-4 w-full rounded-full bg-[#F0EEF4]" />
    <Skeleton className="h-[180px] rounded-[24px] bg-[#F0EEF4]" />
  </div>
);

/** Página pública do link "Sair da lista" (390px primeiro, sem login). */
export const MarketingOptOutPage = ({ token }: TMarketingOptOutPageConfig) => {
  const {
    state,
    storeName,
    isOptingOut,
    handleOptOut,
    handleRetry,
    isRetrying,
  } = useMarketingOptOut(token);

  const renderBody = () => {
    if (state === 'loading') return <OptOutSkeleton />;

    if (state === 'expired') {
      return (
        <div role="alert" className={OPT_OUT_CENTERED_CARD_CLASS}>
          <h1 className={OPT_OUT_CARD_TITLE_CLASS}>Este link não vale mais</h1>
          <p className={OPT_OUT_TEXT_CLASS}>
            Use o link do e-mail mais recente ou peça para a loja tirar você da
            lista.
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
            Pronto, você saiu da lista
          </h1>
          <p className={OPT_OUT_TEXT_CLASS}>
            {storeName} não vai mais mandar campanhas para você. Mudou de ideia?
            É só pedir para a loja.
          </p>
        </div>
      );
    }

    return (
      <>
        <header className="flex flex-col gap-1">
          <span className="text-[13px] text-[#5F5C6E]">{storeName}</span>
          <h1 className="text-2xl font-extrabold tracking-[-0.025em]">
            Sair da lista
          </h1>
          <p className={OPT_OUT_TEXT_CLASS}>
            Você não vai mais receber mensagens de campanha de {storeName} por
            e-mail nem pelo WhatsApp.
          </p>
        </header>

        <div className={OPT_OUT_CARD_CLASS}>
          <p className={OPT_OUT_TEXT_CLASS}>
            Avisos dos seus agendamentos, como confirmação e lembrete, continuam
            chegando normalmente.
          </p>
          <button
            type="button"
            onClick={handleOptOut}
            disabled={isOptingOut}
            className={OPT_OUT_PRIMARY_BUTTON_CLASS}
          >
            {isOptingOut ? 'Saindo…' : 'Sair da lista'}
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
