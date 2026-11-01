'use client';

import { cn } from '@repo/ui';
import { ArrowRight, Check, X } from 'lucide-react';
import Link from 'next/link';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_MUTED_TEXT_CLASS,
} from '../../partner.styles';
import { useOnboardingChecklist } from './onboarding-checklist.hook';

export const OnboardingChecklist = () => {
  const { steps, completedCount, totalCount, isVisible, handleDismiss } =
    useOnboardingChecklist();

  if (!isVisible) return null;

  return (
    <section
      aria-label="Primeiros passos"
      className="mb-5 grid gap-3 rounded-3xl bg-white p-6 shadow-[0_12px_40px_rgba(15,12,30,0.1)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold">Comece a usar o painel</h2>
          <p className={cn('mt-0.5 text-sm', PARTNER_MUTED_TEXT_CLASS)}>
            {completedCount} de {totalCount} passos concluídos
          </p>
        </div>
        <button
          type="button"
          aria-label="Dispensar checklist"
          onClick={handleDismiss}
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-[#F7F6FA]',
            PARTNER_MUTED_TEXT_CLASS,
            PARTNER_FOCUS_CLASS,
          )}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <ol className="mt-1.5 grid gap-2">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={cn(
                'flex min-h-[52px] items-center justify-between gap-3 rounded-[14px] bg-[#F7F6FA] px-4 text-sm font-semibold transition-colors hover:bg-[#F4F3F7]',
                PARTNER_FOCUS_CLASS,
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                {step.done && (
                  <Check className="size-4 shrink-0" aria-hidden="true" />
                )}
                {step.label}
              </span>
              {step.done ? (
                <span className="shrink-0">Concluído</span>
              ) : (
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              )}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
};
