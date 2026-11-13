'use client';

import { cn, Skeleton, Spinner } from '@repo/ui';
import { Info, Star } from 'lucide-react';
import {
  MANAGEMENT_ACTIONS_CLASS,
  MANAGEMENT_BUTTON_CLASS,
  MANAGEMENT_CHECK_CLASS,
  MANAGEMENT_CHECKBOX_CLASS,
  MANAGEMENT_ERROR_CLASS,
  MANAGEMENT_FIELD_CLASS,
  MANAGEMENT_FIELD_HINT_CLASS,
  MANAGEMENT_FIELD_LABEL_CLASS,
  MANAGEMENT_ITEM_CLASS,
  MANAGEMENT_LINE_CLASS,
  MANAGEMENT_LINE_TEXT_CLASS,
  MANAGEMENT_LINE_TITLE_CLASS,
  MANAGEMENT_MUTED_CLASS,
  MANAGEMENT_NOTE_CLASS,
  MANAGEMENT_NOTE_ICON_CLASS,
  MANAGEMENT_NOTE_TONE,
  MANAGEMENT_PRIMARY_BUTTON_CLASS,
  MANAGEMENT_SUBTITLE_CLASS,
  MANAGEMENT_SUMMARY_CLASS,
  MANAGEMENT_SUMMARY_ROW_CLASS,
  MANAGEMENT_SUMMARY_TOTAL_CLASS,
  MANAGEMENT_TEXT_CLASS,
} from '../../../cash-module/cash-module.styles';
import { CheckoutPayments } from './checkout-payments';
import { useCheckoutForm } from './checkout-form.hook';
import type { TCheckoutFormConfig } from './checkout-form.types';

export const CheckoutForm = ({ onCancel, ...config }: TCheckoutFormConfig) => {
  const {
    form,
    errors,
    customerName,
    visitLine,
    lines,
    hasPackage,
    rewards,
    selectedRewardId,
    paymentFields,
    canAddPayment,
    summary,
    formatMoney,
    isLoading,
    isError,
    handleRetry,
    submitError,
    isSubmitting,
    handleAmountEdited,
    handleAddPayment,
    handleRemovePayment,
    handleToggleReward,
    handleSubmit,
  } = useCheckoutForm(config);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Carregando o fechamento"
        className="grid gap-3"
      >
        <Skeleton className="h-12 rounded-2xl bg-[#F0EEF4]" />
        <Skeleton className="h-[72px] rounded-2xl bg-[#F0EEF4]" />
        <Skeleton className="h-40 rounded-2xl bg-[#F0EEF4]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-3">
        <p role="alert" className={MANAGEMENT_TEXT_CLASS}>
          Não foi possível carregar o fechamento deste atendimento.
        </p>
        <div className={MANAGEMENT_ACTIONS_CLASS}>
          <button
            type="button"
            onClick={onCancel}
            className={MANAGEMENT_BUTTON_CLASS}
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleRetry}
            className={MANAGEMENT_PRIMARY_BUTTON_CLASS}
          >
            Tentar de novo
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label="Fechar atendimento"
      className="grid gap-[18px]"
    >
      <div>
        <h3 className="text-xl font-extrabold tracking-[-0.02em]">
          {customerName}
        </h3>
        <p className={MANAGEMENT_TEXT_CLASS}>{visitLine}</p>
      </div>

      <div className="grid gap-2.5">
        <h3 className={MANAGEMENT_SUBTITLE_CLASS}>Atendimentos</h3>
        <ul className="grid gap-2.5">
          {lines.map((line) => (
            <li key={line.scheduleId} className={MANAGEMENT_ITEM_CLASS}>
              <div className={MANAGEMENT_LINE_CLASS}>
                <b className={MANAGEMENT_LINE_TITLE_CLASS}>
                  {line.serviceName}
                </b>
                <span className={MANAGEMENT_LINE_TEXT_CLASS}>
                  {line.description}
                </span>
              </div>
              <span
                className={cn(
                  'text-right text-sm whitespace-nowrap tabular-nums',
                  line.fromPackage &&
                    cn(MANAGEMENT_MUTED_CLASS, 'line-through'),
                )}
              >
                {line.fromPackage ? (
                  <span className="sr-only">Sem cobrança, era </span>
                ) : null}
                {formatMoney(line.price)}
              </span>
            </li>
          ))}
        </ul>
        {hasPackage ? (
          <label className={cn(MANAGEMENT_CHECK_CLASS, '-mt-1')}>
            <input
              type="checkbox"
              className={MANAGEMENT_CHECKBOX_CLASS}
              {...form.register('usePackages')}
            />
            Usar sessão do pacote
          </label>
        ) : null}
      </div>

      {rewards.map((reward) => (
        <div
          key={reward.id}
          className={cn(MANAGEMENT_NOTE_CLASS, MANAGEMENT_NOTE_TONE.success)}
        >
          <Star aria-hidden="true" className={MANAGEMENT_NOTE_ICON_CLASS} />
          <div>
            <p>
              <b className="block">
                Recompensa disponível: {reward.description}
              </b>
              {reward.details}
            </p>
            <label
              className={cn(
                MANAGEMENT_CHECK_CLASS,
                'mt-2 min-h-0',
                reward.discount === null && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="checkbox"
                checked={selectedRewardId === reward.id}
                disabled={reward.discount === null}
                onChange={(event) =>
                  handleToggleReward(reward.id, event.target.checked)
                }
                className={MANAGEMENT_CHECKBOX_CLASS}
              />
              {reward.discount === null
                ? 'O serviço da recompensa não está cobrado neste atendimento'
                : 'Usar agora'}
            </label>
          </div>
        </div>
      ))}

      <label className={MANAGEMENT_FIELD_LABEL_CLASS}>
        Desconto
        <span className={MANAGEMENT_FIELD_HINT_CLASS}>
          Em reais, além da recompensa
        </span>
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={formatMoney(0)}
          aria-invalid={!!errors.discount || undefined}
          className={MANAGEMENT_FIELD_CLASS}
          {...form.register('discount')}
        />
      </label>
      {errors.discount ? (
        <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
          {errors.discount.message}
        </p>
      ) : null}

      <dl className={MANAGEMENT_SUMMARY_CLASS}>
        <div className={MANAGEMENT_SUMMARY_ROW_CLASS}>
          <dt className={MANAGEMENT_MUTED_CLASS}>Subtotal</dt>
          <dd className="text-right font-semibold tabular-nums">
            {summary.subtotal}
          </dd>
        </div>
        <div className={MANAGEMENT_SUMMARY_ROW_CLASS}>
          <dt className={MANAGEMENT_MUTED_CLASS}>Desconto</dt>
          <dd className="text-right font-semibold tabular-nums">
            {summary.discount}
          </dd>
        </div>
        <div
          className={cn(
            MANAGEMENT_SUMMARY_ROW_CLASS,
            MANAGEMENT_SUMMARY_TOTAL_CLASS,
          )}
        >
          <dt>A receber</dt>
          <dd className="text-right tabular-nums">{summary.total}</dd>
        </div>
      </dl>

      <CheckoutPayments
        form={form}
        fields={paymentFields}
        canAdd={canAddPayment}
        amountPlaceholder={formatMoney(0)}
        onAmountEdited={handleAmountEdited}
        onAdd={handleAddPayment}
        onRemove={handleRemovePayment}
      />

      <div className={MANAGEMENT_NOTE_CLASS}>
        <Info aria-hidden="true" className={MANAGEMENT_NOTE_ICON_CLASS} />
        <p>
          O ServiceSnap não cobra o cliente: aqui você só anota o que recebeu.
          Entra no caixa aberto e na comissão do profissional.
        </p>
      </div>

      {submitError ? (
        <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
          {submitError}
        </p>
      ) : null}

      <div className={cn(MANAGEMENT_ACTIONS_CLASS, 'justify-end')}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={MANAGEMENT_BUTTON_CLASS}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={MANAGEMENT_PRIMARY_BUTTON_CLASS}
        >
          {isSubmitting ? <Spinner className="size-4" /> : null}
          Fechar atendimento
        </button>
      </div>
    </form>
  );
};
