'use client';

import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';

export function PlanFeaturesCard() {
  const { currentPlan } = useSubscriptionQuery();

  if (!currentPlan) return null;

  return (
    <section className="grid gap-3.5 rounded-[24px] border border-[#EBE9F0] p-6">
      <h3 className="text-lg font-extrabold">Recursos incluídos</h3>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-2 text-sm">
        {currentPlan.marketingFeatures.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span aria-hidden="true" className="font-extrabold">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
