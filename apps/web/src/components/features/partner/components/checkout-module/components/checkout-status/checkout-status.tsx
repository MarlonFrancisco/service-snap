'use client';

import { cn, Skeleton, Spinner } from '@repo/ui';
import { CircleCheck } from 'lucide-react';
import {
  MANAGEMENT_BUTTON_CLASS,
  MANAGEMENT_ITEM_CLASS,
  MANAGEMENT_LINE_CLASS,
  MANAGEMENT_LINE_TEXT_CLASS,
  MANAGEMENT_LINE_TITLE_CLASS,
  MANAGEMENT_PRIMARY_BUTTON_CLASS,
  MANAGEMENT_SMALL_BUTTON_CLASS,
  MANAGEMENT_TEXT_CLASS,
} from '../../../cash-module/cash-module.styles';
import { useCheckoutStatus } from './checkout-status.hook';
import type { TCheckoutStatusConfig } from './checkout-status.types';

export const CheckoutStatus = ({
  onOpenCheckout,
  ...config
}: TCheckoutStatusConfig) => {
  const {
    isEligible,
    isLoading,
    isError,
    handleRetry,
    isClosed,
    summary,
    canUndo,
    showUndoLocked,
    isConfirmingUndo,
    undoTriggerRef,
    isUndoing,
    handleRequestUndo,
    handleDismissUndo,
    handleUndo,
  } = useCheckoutStatus(config);

  if (!isEligible) return null;

  if (isLoading) {
    return (
      <Skeleton
        role="status"
        aria-label="Carregando o fechamento"
        className="h-[72px] rounded-2xl bg-[#F0EEF4]"
      />
    );
  }

  if (isError) {
    return (
      <div className={MANAGEMENT_ITEM_CLASS}>
        <p className={MANAGEMENT_LINE_TEXT_CLASS}>
          Não foi possível ver se este atendimento já foi fechado.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className={cn(MANAGEMENT_BUTTON_CLASS, MANAGEMENT_SMALL_BUTTON_CLASS)}
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (!isClosed) {
    return (
      <div className="grid gap-2">
        <button
          type="button"
          onClick={onOpenCheckout}
          className={cn(MANAGEMENT_PRIMARY_BUTTON_CLASS, 'min-h-[50px] w-full')}
        >
          Fechar atendimento
        </button>
        <p className={cn(MANAGEMENT_TEXT_CLASS, 'text-[13px]')}>
          Fechar o atendimento conclui, dá baixa no pacote, usa a recompensa e
          registra o que a loja recebeu.
        </p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <section
      aria-label="Fechamento do atendimento"
      className="grid gap-2.5 rounded-2xl border border-[#EBE9F0] px-4 py-3.5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <CircleCheck
            aria-hidden="true"
            className="mt-0.5 size-5 flex-none stroke-2 text-[#0A5536]"
          />
          <div className={MANAGEMENT_LINE_CLASS}>
            <b className={MANAGEMENT_LINE_TITLE_CLASS}>{summary.title}</b>
            <span className={MANAGEMENT_LINE_TEXT_CLASS}>
              {summary.description}
            </span>
          </div>
        </div>
        {canUndo && !isConfirmingUndo ? (
          <button
            ref={undoTriggerRef}
            type="button"
            onClick={handleRequestUndo}
            className={cn(
              MANAGEMENT_BUTTON_CLASS,
              MANAGEMENT_SMALL_BUTTON_CLASS,
            )}
          >
            Desfazer
          </button>
        ) : null}
      </div>

      {canUndo && isConfirmingUndo ? (
        <div
          role="alertdialog"
          aria-label="Confirmar desfazer o fechamento"
          className="rounded-[14px] bg-[#F7F6FA] px-4 py-3.5 text-sm leading-normal"
        >
          <b className="block">Desfazer este fechamento?</b>
          Os pagamentos são estornados e a sessão do pacote e a recompensa
          voltam para o cliente. O atendimento continua concluído.
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            <button
              type="button"
              autoFocus
              onClick={handleDismissUndo}
              disabled={isUndoing}
              className={cn(
                MANAGEMENT_BUTTON_CLASS,
                MANAGEMENT_SMALL_BUTTON_CLASS,
              )}
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleUndo}
              disabled={isUndoing}
              className={cn(
                MANAGEMENT_PRIMARY_BUTTON_CLASS,
                MANAGEMENT_SMALL_BUTTON_CLASS,
              )}
            >
              {isUndoing ? <Spinner className="size-4" /> : null}
              Desfazer fechamento
            </button>
          </div>
        </div>
      ) : null}

      {canUndo && !isConfirmingUndo ? (
        <p className={cn(MANAGEMENT_TEXT_CLASS, 'text-[13px]')}>
          Desfazer estorna os pagamentos e devolve a sessão do pacote e a
          recompensa. Só dono e gerente, e só enquanto o caixa estiver aberto.
        </p>
      ) : null}

      {showUndoLocked ? (
        <p className={cn(MANAGEMENT_TEXT_CLASS, 'text-[13px]')}>
          O caixa deste fechamento já foi fechado: não dá mais para desfazer.
        </p>
      ) : null}
    </section>
  );
};
