'use client';

import { cn } from '@repo/ui';
import { PARTNER_FOCUS_CLASS } from '../../../../../partner.styles';
import {
  MODULE_BADGE_CLASS,
  MODULE_BADGE_TONE_CLASS,
  MODULE_DANGER_ACTION_CLASS,
  MODULE_PRIMARY_ACTION_CLASS,
  MODULE_RAISED_CARD_CLASS,
  MODULE_TITLE_CLASS,
} from '../../../../notifications-module/notifications-module.styles';
import { usePlanOverviewCard } from './plan-overview-card.hook';
import type { TPlanOverviewCardConfig } from './plan-overview-card.types';

const SUPPORT_EMAIL = 'general@ssnap.io';

export function PlanOverviewCard({
  onCancelReactivateClick,
}: TPlanOverviewCardConfig) {
  const {
    currentPlan,
    isCancellationScheduled,
    priceLabel,
    periodLabel,
    formattedNextBillingDate,
    storesUsageLabel,
    usersUsageLabel,
  } = usePlanOverviewCard();

  if (!currentPlan?.isActive) return null;

  const details = [
    ...(isCancellationScheduled
      ? [
          { label: 'Acesso até', value: formattedNextBillingDate },
          {
            label: 'Cobrança futura',
            value: 'Nenhuma (cancelamento agendado)',
          },
        ]
      : [
          { label: 'Próxima cobrança', value: formattedNextBillingDate },
          { label: 'Valor', value: priceLabel },
        ]),
    { label: 'Agendamentos este mês', value: currentPlan.schedulesLength },
    { label: 'Lojas ativas', value: storesUsageLabel },
    { label: 'Profissionais ativos', value: usersUsageLabel },
  ];

  return (
    <section className={cn(MODULE_RAISED_CARD_CLASS, 'col-[1/-1] gap-3.5')}>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="min-w-0">
          <h2 className={MODULE_TITLE_CLASS}>Plano {currentPlan.planName}</h2>
          <p className="mt-0.5 text-[15px] text-[#5F5C6E]">
            {priceLabel}/{periodLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              MODULE_BADGE_CLASS,
              isCancellationScheduled
                ? MODULE_BADGE_TONE_CLASS.warning
                : MODULE_BADGE_TONE_CLASS.success,
            )}
          >
            {isCancellationScheduled ? 'Cancelamento agendado' : 'Ativo'}
          </span>
          <button
            type="button"
            onClick={onCancelReactivateClick}
            className={
              isCancellationScheduled
                ? MODULE_PRIMARY_ACTION_CLASS
                : MODULE_DANGER_ACTION_CLASS
            }
          >
            {isCancellationScheduled ? 'Reativar plano' : 'Cancelar plano'}
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(160px,100%),1fr))] gap-3 text-sm">
        {details.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-[#5F5C6E]">{label}</dt>
            <dd className="mt-0.5 font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="border-t border-[#F0EEF4] pt-3 text-[13px] leading-normal text-[#5F5C6E]">
        Dúvidas sobre o plano? Fale com o suporte do ServiceSnap em{' '}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className={cn('font-semibold underline', PARTNER_FOCUS_CLASS)}
        >
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </section>
  );
}
