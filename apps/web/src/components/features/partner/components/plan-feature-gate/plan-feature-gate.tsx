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
      className="relative sm:min-h-[640px] sm:overflow-hidden sm:rounded-[24px] sm:border sm:border-[#EBE9F0] sm:bg-white"
    >
      {/* Celular: faixa curta atrás do topo do cartão. Desktop: o módulo inteiro por trás. */}
      <div
        aria-hidden="true"
        className="max-h-[150px] overflow-hidden opacity-45 blur-[2px] sm:max-h-none sm:p-7 sm:blur-[3px]"
      >
        <LockedModulePreview variant={lockedModule.preview} />
      </div>

      <div className="relative -mt-12 sm:absolute sm:inset-0 sm:mt-0 sm:flex sm:items-center sm:justify-center sm:bg-white/55 sm:p-6">
        <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-3 rounded-[24px] border border-[#EBE9F0] bg-white px-5 pt-7 pb-6 text-center shadow-[0_16px_40px_rgba(11,11,15,0.10)] sm:gap-3.5 sm:rounded-[28px] sm:px-8 sm:py-9 sm:shadow-[0_24px_60px_rgba(11,11,15,0.10)]">
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-full bg-[#F3E8FF] text-[#7A0BC8] sm:size-14"
          >
            <Lock className="size-[22px] stroke-[1.8] sm:size-6" />
          </span>
          {minPlanName ? (
            <span className="text-[11px] font-extrabold tracking-[0.08em] text-[#7A0BC8] uppercase sm:text-xs">
              Disponível no {minPlanName}
            </span>
          ) : null}
          <h2
            id={titleId}
            className="text-xl leading-tight font-extrabold tracking-[-0.02em] sm:text-[22px]"
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
          <div className="mt-1.5 flex flex-col gap-2 self-stretch sm:mt-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2.5 sm:self-auto">
            <Link
              href="/partner/plans/upgrade"
              className={cn(
                ACTION_CLASS,
                'bg-[#0B0B0F] text-[15px] text-white hover:bg-[#2B2B2B] sm:text-sm',
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
                'bg-[#F4F3F7] text-[15px] text-[#0B0B0F] hover:bg-[#EBE9F0] sm:px-5 sm:text-sm',
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
