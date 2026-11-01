'use client';

import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { formatPlanDate } from '../../../plans-module.utils';

export function CancellationWarningAlert() {
  const { currentPlan } = useSubscriptionQuery();

  if (!currentPlan?.cancelAtPeriodEnd) return null;

  const accessUntil = formatPlanDate(currentPlan.nextBillingDate);

  return (
    <div
      role="status"
      className="col-[1/-1] rounded-[14px] bg-[#FFF1E0] px-[18px] py-3.5 text-sm leading-normal text-[#6E3B00]"
    >
      <strong className="block">Cancelamento agendado</strong>
      {accessUntil
        ? `Seu acesso continua até ${accessUntil}. Depois dessa data, o plano é encerrado e não há novas cobranças.`
        : 'Seu acesso continua até o fim do ciclo atual. Depois disso, o plano é encerrado e não há novas cobranças.'}
    </div>
  );
}
