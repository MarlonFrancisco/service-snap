'use client';

import { Button } from '@repo/ui';
import { CheckCircle2, Circle, Rocket, X } from 'lucide-react';
import Link from 'next/link';
import { useOnboardingChecklist } from './onboarding-checklist.hook';

export function OnboardingChecklist() {
  const { steps, completedCount, totalCount, isVisible, handleDismiss } =
    useOnboardingChecklist();

  if (!isVisible) return null;

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white">
            <Rocket className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm text-gray-900">Comece a usar o painel</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {completedCount} de {totalCount} passos concluídos
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-500"
          onClick={handleDismiss}
          aria-label="Dispensar checklist"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ul className="space-y-2">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5 hover:bg-gray-50"
            >
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-gray-300" />
              )}
              <span
                className={
                  step.done
                    ? 'text-sm text-gray-500 line-through'
                    : 'text-sm text-gray-900'
                }
              >
                {step.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
