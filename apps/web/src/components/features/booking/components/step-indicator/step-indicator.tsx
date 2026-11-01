import { cn } from '@repo/ui';
import { Check } from 'lucide-react';
import { ICheckoutStep, TBookingStep } from '../../booking.types';

type TStepIndicatorConfig = {
  steps: ICheckoutStep[];
  currentStep: TBookingStep;
  currentStepIndex: number;
  className?: string;
};

export function StepIndicator({
  steps,
  currentStep,
  currentStepIndex,
  className,
}: TStepIndicatorConfig) {
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className={className}>
      {/* Mobile: passo atual e barra de progresso */}
      <p className="flex items-center gap-2.5 text-[13px] font-semibold text-[#5F5C6E] md:hidden">
        Passo {currentStepIndex + 1} de {steps.length}
        <span
          aria-hidden
          className="block h-1 flex-1 overflow-hidden rounded-full bg-[#EBE9F0]"
        >
          <span
            className="block h-full bg-[#0B0B0F] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </span>
      </p>

      <ol
        aria-label="Etapas do agendamento"
        className="hidden list-none gap-2 p-0 md:flex"
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = step.id === currentStep;
          const isActive = isCompleted || isCurrent;

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'flex flex-1 items-center gap-2.5 border-t-[3px] pt-3 text-[13px] font-semibold',
                isActive
                  ? 'border-[#0B0B0F] text-[#0B0B0F]'
                  : 'border-[#EBE9F0] text-[#5F5C6E]',
              )}
            >
              <span
                className={cn(
                  'grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full text-xs font-bold',
                  isActive ? 'bg-[#0B0B0F] text-white' : 'bg-[#F4F3F7]',
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                ) : (
                  step.number
                )}
              </span>
              <span>{step.title}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
