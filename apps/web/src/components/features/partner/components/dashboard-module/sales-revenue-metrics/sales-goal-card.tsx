'use client';

import {
  PARTNER_FOCUS_CLASS,
  PARTNER_MUTED_TEXT_CLASS,
  PARTNER_PRIMARY_ACTION_CLASS,
} from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { PERIOD_GOAL_TEXT } from '../utils/metrics.constants';
import { formatPercent, pluralize } from '../utils/metrics.helpers';
import { useSalesGoalCard } from './sales-goal-card.hook';
import type { TSalesGoalCardConfig } from './sales-goal-card.types';

const GOAL_INPUT_ID = 'sales-monthly-goal';
const GOAL_ERROR_ID = 'sales-monthly-goal-error';

const SECONDARY_ACTION_CLASS = cn(
  'flex min-h-11 items-center justify-center rounded-full border border-[#E3E1EA] bg-white px-4 text-[13px] font-bold transition-colors hover:bg-[#F7F6FA]',
  PARTNER_FOCUS_CLASS,
);

export const SalesGoalCard = ({
  storeId,
  period,
  goal,
  money,
  onSelectMonthly,
}: TSalesGoalCardConfig) => {
  const {
    form,
    handleSubmit,
    handleStartEditing,
    handleCancelEditing,
    isSaving,
    hasGoal,
    isMonthly,
    showForm,
    isEditing,
    isGoalReached,
    progress,
  } = useSalesGoalCard({ storeId, period, goal });

  const goalText = PERIOD_GOAL_TEXT[period];
  const inputError = form.formState.errors.monthlyGoal?.message;

  return (
    <section className="grid grid-cols-1 items-end gap-5 rounded-[24px] bg-[#F7F6FA] p-5 md:p-6 lg:grid-cols-2">
      <div className="min-w-0">
        {hasGoal ? (
          <>
            <h3 className="text-lg font-extrabold">Meta {goalText}</h3>
            <p className="mt-1 text-[22px] font-extrabold tracking-[-0.02em] [overflow-wrap:anywhere]">
              {money.formatMoney(goal.current)}
              <span
                className={cn(
                  'ml-1.5 text-sm font-semibold tracking-normal',
                  PARTNER_MUTED_TEXT_CLASS,
                )}
              >
                de {money.formatMoney(goal.target)}
              </span>
            </p>
            <div
              role="progressbar"
              aria-label={`Progresso da meta ${goalText}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="mt-3 h-2 overflow-hidden rounded-full bg-[#EBE9F0]"
            >
              <div
                className="h-full rounded-full bg-[#0B0B0F]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className={cn('mt-2 text-sm', PARTNER_MUTED_TEXT_CLASS)}>
              {formatPercent(goal.percentage)} concluído
              {isGoalReached
                ? ' · meta atingida'
                : ` · faltam ${money.formatMoney(goal.remaining)}`}
              {` · ${pluralize(goal.daysRemaining, 'dia restante', 'dias restantes')}`}
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-extrabold">
              {isMonthly ? 'Meta não definida' : `Meta ${goalText} não definida`}
            </h3>
            <p
              className={cn(
                'mt-1 text-sm leading-normal',
                PARTNER_MUTED_TEXT_CLASS,
              )}
            >
              {isMonthly
                ? 'Defina uma meta mensal para acompanhar seu progresso e alcançar seus objetivos.'
                : 'Por enquanto, esta tela define apenas a meta mensal.'}
            </p>
          </>
        )}
      </div>

      {showForm && (
        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start"
        >
          <div className="grid min-w-0 flex-1 gap-1.5">
            <label htmlFor={GOAL_INPUT_ID} className="text-[13px] font-semibold">
              Meta mensal
            </label>
            <input
              id={GOAL_INPUT_ID}
              inputMode="decimal"
              autoComplete="off"
              placeholder={`${money.currencySymbol} 0`}
              aria-invalid={!!inputError}
              aria-describedby={inputError ? GOAL_ERROR_ID : undefined}
              className={cn(
                'h-12 w-full min-w-0 rounded-[14px] border border-[#E3E1EA] bg-white px-3.5 text-[15px] font-medium aria-invalid:border-[#A4231A]',
                PARTNER_FOCUS_CLASS,
              )}
              {...form.register('monthlyGoal')}
            />
            {inputError && (
              <p
                id={GOAL_ERROR_ID}
                role="alert"
                className="text-[13px] font-medium text-[#A4231A]"
              >
                {inputError}
              </p>
            )}
          </div>
          <div className="flex gap-2 md:mt-[25px]">
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                PARTNER_PRIMARY_ACTION_CLASS,
                'h-12 flex-1 px-5 text-sm whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60 md:flex-initial',
              )}
            >
              {isSaving ? 'Salvando...' : 'Salvar meta'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEditing}
                className={cn(SECONDARY_ACTION_CLASS, 'h-12')}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {isMonthly && hasGoal && !isEditing && (
        <button
          type="button"
          onClick={handleStartEditing}
          className={cn(SECONDARY_ACTION_CLASS, 'justify-self-start lg:justify-self-end')}
        >
          Alterar meta
        </button>
      )}

      {!isMonthly && !hasGoal && (
        <button
          type="button"
          onClick={onSelectMonthly}
          className={cn(SECONDARY_ACTION_CLASS, 'justify-self-start lg:justify-self-end')}
        >
          Ver meta mensal
        </button>
      )}
    </section>
  );
};
