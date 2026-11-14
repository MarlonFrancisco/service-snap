'use client';

import { Skeleton } from '@repo/ui';
import { Clock, RefreshCw } from 'lucide-react';
import { useAnamnesisInvite } from './anamnesis.hook';
import {
  ANAMNESIS_CARD_CLASS,
  ANAMNESIS_MAIN_CLASS,
  ANAMNESIS_PAGE_CLASS,
  ANAMNESIS_PRIMARY_BUTTON_CLASS,
  ANAMNESIS_TEXT_CLASS,
} from './anamnesis.styles';
import type { TAnamnesisInvitePageConfig } from './anamnesis.types';
import { AnamnesisFormCard } from './components/anamnesis-form-card';

const InviteSkeleton = () => (
  <div role="status" aria-label="Carregando a ficha" className="grid gap-4">
    <Skeleton className="h-4 w-32 rounded-full bg-[#F0EEF4]" />
    <Skeleton className="h-8 w-56 rounded-full bg-[#F0EEF4]" />
    <Skeleton className="h-4 w-full rounded-full bg-[#F0EEF4]" />
    <Skeleton className="h-[420px] rounded-[24px] bg-[#F0EEF4]" />
  </div>
);

/** Página pública do link de anamnese (390px primeiro, sem login). */
export const AnamnesisInvitePage = ({ token }: TAnamnesisInvitePageConfig) => {
  const { state, invite, header, handleRetry, isRetrying } =
    useAnamnesisInvite(token);

  const renderBody = () => {
    if (state === 'loading') return <InviteSkeleton />;

    if (state === 'expired') {
      return (
        <div
          role="alert"
          className={`${ANAMNESIS_CARD_CLASS} items-center text-center`}
        >
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-full bg-[#F4F3F7]"
          >
            <Clock className="size-6 stroke-2 text-[#5F5C6E]" />
          </span>
          <h1 className="text-xl font-extrabold tracking-[-0.02em]">
            Este link não vale mais
          </h1>
          <p className={ANAMNESIS_TEXT_CLASS}>
            O link da ficha vale até o dia seguinte ao atendimento. Peça um novo
            link para a loja.
          </p>
        </div>
      );
    }

    if (state === 'error' || !invite || !header) {
      return (
        <div
          role="alert"
          className={`${ANAMNESIS_CARD_CLASS} items-center text-center`}
        >
          <h1 className="text-xl font-extrabold tracking-[-0.02em]">
            Não foi possível abrir a ficha
          </h1>
          <p className={ANAMNESIS_TEXT_CLASS}>
            Verifique a conexão e tente de novo.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className={ANAMNESIS_PRIMARY_BUTTON_CLASS}
          >
            <RefreshCw aria-hidden="true" className="size-[18px] stroke-2" />
            Tentar de novo
          </button>
        </div>
      );
    }

    return (
      <>
        <header className="flex flex-col gap-1">
          <span className="text-[13px] text-[#5F5C6E]">{header.storeName}</span>
          <h1 className="text-2xl font-extrabold tracking-[-0.025em]">
            {header.title}
          </h1>
          <p className={ANAMNESIS_TEXT_CLASS}>{header.lead}</p>
        </header>

        {invite.forms.length === 0 ? (
          <p className={ANAMNESIS_CARD_CLASS}>
            Não há nenhuma ficha para preencher neste atendimento.
          </p>
        ) : (
          invite.forms.map((form) => (
            <AnamnesisFormCard
              key={form.id}
              token={token}
              form={form}
              consentText={invite.consentText}
              storeName={invite.storeName}
              weekday={header.weekday}
              showTitle={invite.forms.length > 1}
            />
          ))
        )}
      </>
    );
  };

  return (
    <div className={ANAMNESIS_PAGE_CLASS}>
      <main className={ANAMNESIS_MAIN_CLASS}>{renderBody()}</main>
    </div>
  );
};
