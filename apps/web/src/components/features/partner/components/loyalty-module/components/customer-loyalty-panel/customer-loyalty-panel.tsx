'use client';

import { cn, Skeleton } from '@repo/ui';
import Link from 'next/link';
import { useId } from 'react';
import {
  CUSTOMERS_CARD_CLASS,
  CUSTOMERS_CARD_TITLE_CLASS,
} from '../../../customers-module/customers-module.styles';
import { RetentionConfirmDialog } from '../../../packages-module/components/retention-confirm-dialog';
import {
  getRetentionChipClass,
  RETENTION_BUTTON_CLASS,
  RETENTION_ITEM_CLASS,
  RETENTION_ITEM_LINES_CLASS,
  RETENTION_SMALL_BUTTON_CLASS,
  RETENTION_TEXT_CLASS,
} from '../../../packages-module/packages-module.styles';
import { useCustomerLoyaltyPanel } from './customer-loyalty-panel.hook';
import type { TCustomerLoyaltyPanelConfig } from './customer-loyalty-panel.types';

const DOT_CLASS =
  'grid size-11 place-items-center rounded-full text-sm font-extrabold';

const DOT_STATE_CLASS = {
  done: 'bg-[#9810FA] text-white',
  pending: 'bg-[#F0EEF4] text-[#5F5C6E]',
  reward: 'border-2 border-dashed border-[#9810FA] text-[#9810FA]',
} as const;

/** Progresso e recompensas na ficha do cliente. Para montar na ficha: `{ customerId }`. */
export const CustomerLoyaltyPanel = (config: TCustomerLoyaltyPanelConfig) => {
  const titleId = useId();
  const {
    title,
    isLoading,
    isError,
    isRetrying,
    handleRetry,
    hasProgram,
    isPaused,
    dots,
    dotsLabel,
    visitsLeftLabel,
    nextRewardLabel,
    rewards,
    handleAskRedeem,
    handleCloseRedeem,
    handleConfirmRedeem,
    redeemDialog,
  } = useCustomerLoyaltyPanel(config);

  const renderBody = () => {
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label="Carregando fidelidade"
          className="grid gap-3"
        >
          <Skeleton className="h-11 rounded-full bg-[#F0EEF4]" />
          <Skeleton className="h-16 rounded-2xl bg-[#F0EEF4]" />
        </div>
      );
    }
    if (isError) {
      return (
        <div role="alert" className="grid justify-items-start gap-2.5">
          <p className={RETENTION_TEXT_CLASS}>
            Não foi possível carregar a fidelidade.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className={cn(RETENTION_BUTTON_CLASS, RETENTION_SMALL_BUTTON_CLASS)}
          >
            {isRetrying ? 'Tentando...' : 'Tentar novamente'}
          </button>
        </div>
      );
    }
    if (!hasProgram) {
      return (
        <div className="grid justify-items-start gap-2.5">
          <p className={RETENTION_TEXT_CLASS}>
            A loja ainda não tem programa de fidelidade.
          </p>
          <Link
            href="/partner/fidelidade"
            className={cn(RETENTION_BUTTON_CLASS, RETENTION_SMALL_BUTTON_CLASS)}
          >
            Criar programa
          </Link>
        </div>
      );
    }

    return (
      <>
        <div role="img" aria-label={dotsLabel} className="flex flex-wrap gap-2">
          {dots.map((dot) => (
            <span
              key={dot.number}
              aria-hidden="true"
              className={cn(DOT_CLASS, DOT_STATE_CLASS[dot.state])}
            >
              {dot.number}
            </span>
          ))}
        </div>
        <p className={RETENTION_TEXT_CLASS}>
          <b className="text-[#0B0B0F]">{visitsLeftLabel}</b> {nextRewardLabel}
        </p>
        {isPaused ? (
          <p className="rounded-[14px] bg-[#FBE8D9] px-3.5 py-3 text-[13px] font-semibold text-[#7A3A07]">
            Programa pausado: nenhuma recompensa nova é gerada até ele voltar.
          </p>
        ) : null}

        <h4 className="text-base font-extrabold">Recompensas</h4>
        {rewards.length === 0 ? (
          <p className={RETENTION_TEXT_CLASS}>Nenhuma recompensa ainda.</p>
        ) : (
          rewards.map((reward) => (
            <div key={reward.id} className={RETENTION_ITEM_CLASS}>
              <div className={RETENTION_ITEM_LINES_CLASS}>
                <b>{reward.description}</b>
                <span>{reward.summary}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={getRetentionChipClass(reward.chip.tone)}>
                  {reward.chip.label}
                </span>
                {reward.canRedeem ? (
                  <button
                    type="button"
                    onClick={() => handleAskRedeem(reward)}
                    className={cn(
                      RETENTION_BUTTON_CLASS,
                      RETENTION_SMALL_BUTTON_CLASS,
                    )}
                  >
                    Usar
                    <span className="sr-only"> {reward.description}</span>
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
        <p className={RETENTION_TEXT_CLASS}>
          A recompensa é usada no fechamento do atendimento ou pelo botão Usar,
          para um brinde no balcão.
        </p>
      </>
    );
  };

  return (
    <section
      aria-labelledby={titleId}
      className={cn(CUSTOMERS_CARD_CLASS, 'grid gap-3.5')}
    >
      <h3
        id={titleId}
        className={cn(CUSTOMERS_CARD_TITLE_CLASS, 'break-words')}
      >
        {title}
      </h3>
      {renderBody()}

      <RetentionConfirmDialog
        isOpen={redeemDialog.isOpen}
        title={redeemDialog.title}
        description={redeemDialog.description}
        confirmLabel="Usar recompensa"
        pendingLabel="Usando..."
        isPending={redeemDialog.isPending}
        onConfirm={handleConfirmRedeem}
        onCancel={handleCloseRedeem}
      />
    </section>
  );
};
