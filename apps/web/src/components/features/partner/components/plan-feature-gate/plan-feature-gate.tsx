'use client';

import { cn } from '@repo/ui';
import { Check, Lock } from 'lucide-react';
import Link from 'next/link';
import { useId } from 'react';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_MUTED_TEXT_CLASS,
} from '../../partner.styles';
import { LockedModulePreview } from './locked-module-preview';
import { usePlanFeatureGate } from './plan-feature-gate.hook';
import type { TPlanFeatureGateConfig } from './plan-feature-gate.types';

const ACTION_CLASS = cn(
  'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition-colors',
  PARTNER_FOCUS_CLASS,
);

/** O módulo só monta (e só busca os próprios dados) quando o plano libera. */
export const PlanFeatureGate = ({
  module,
  children,
}: TPlanFeatureGateConfig) => {
  const titleId = useId();
  const {
    lockedModule,
    isLoading,
    hasAccess,
    minPlanName,
    currentPlanName,
    priceLabel,
  } = usePlanFeatureGate({ module });

  if (isLoading) return null;
  if (hasAccess) return <>{children}</>;

  return (
    <section
      aria-labelledby={titleId}
      className="relative min-h-[640px] overflow-hidden rounded-[24px] border border-[#EBE9F0] bg-white"
    >
      <div aria-hidden="true" className="p-7 opacity-45 blur-[3px]">
        <LockedModulePreview variant={lockedModule.preview} />
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-white/55 p-4 sm:p-6">
        <div className="flex w-full max-w-[480px] flex-col items-center gap-3.5 rounded-[28px] border border-[#EBE9F0] bg-white px-6 py-9 text-center shadow-[0_24px_60px_rgba(11,11,15,0.10)] sm:px-8">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-full bg-[#F3E8FF] text-[#7A0BC8]"
          >
            <Lock className="size-6 stroke-[1.8]" />
          </span>
          {minPlanName ? (
            <span className="text-xs font-extrabold tracking-[0.08em] text-[#7A0BC8] uppercase">
              Disponível no {minPlanName}
            </span>
          ) : null}
          <h2
            id={titleId}
            className="text-[22px] font-extrabold tracking-[-0.02em]"
          >
            {lockedModule.title}
          </h2>
          <p className={cn('text-sm leading-[1.55]', PARTNER_MUTED_TEXT_CLASS)}>
            {currentPlanName ? `Você está no plano ${currentPlanName}. ` : ''}
            {lockedModule.lead}
          </p>
          <ul className="mt-1 flex flex-col gap-2.5 self-stretch text-left">
            {lockedModule.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2.5 text-sm font-semibold"
              >
                <Check
                  aria-hidden="true"
                  className="mt-px size-[18px] flex-none stroke-2 text-[#7A0BC8]"
                />
                {benefit}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap justify-center gap-2.5">
            <Link
              href="/partner/plans/upgrade"
              className={cn(
                ACTION_CLASS,
                'bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]',
              )}
            >
              {minPlanName
                ? `Fazer upgrade para ${minPlanName}`
                : 'Fazer upgrade do plano'}
            </Link>
            <Link
              href="/pricing"
              className={cn(
                ACTION_CLASS,
                'bg-[#F4F3F7] px-5 text-[#0B0B0F] hover:bg-[#EBE9F0]',
              )}
            >
              Comparar planos
            </Link>
          </div>
          {priceLabel || lockedModule.priceNote ? (
            <p
              className={cn(
                'text-[13px] leading-normal',
                PARTNER_MUTED_TEXT_CLASS,
              )}
            >
              {[priceLabel, lockedModule.priceNote].filter(Boolean).join(' ')}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};
