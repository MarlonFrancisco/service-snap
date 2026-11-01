import { cn } from '@repo/ui';
import type { TStepIndicatorConfig } from './step-indicator.types';

const STEP_DOTS = [1, 2] as const;

export function StepIndicator({ activeCount }: TStepIndicatorConfig) {
  return (
    <div aria-hidden="true" className="mb-5 flex justify-center gap-1.5">
      {STEP_DOTS.map((dot) => (
        <i
          key={dot}
          className={cn(
            'h-1 w-6 rounded-full',
            dot <= activeCount ? 'bg-[#0B0B0F]' : 'bg-[#EBE9F0]',
          )}
        />
      ))}
    </div>
  );
}
