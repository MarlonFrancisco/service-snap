import { Check } from 'lucide-react';
import { ICheckoutStep, TBookingStep } from '../../booking.types';

interface IStepIndicatorProps {
  steps: ICheckoutStep[];
  currentStep: TBookingStep;
  currentStepIndex: number;
}

export function StepIndicator({
  steps,
  currentStep,
  currentStepIndex,
}: IStepIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Progress Bar com percentual */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#71717A]">
            Passo {currentStepIndex + 1} de {steps.length}
          </span>
          <span className="text-xs text-[#0A0A0A]">
            {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
            completo
          </span>
        </div>
        <div className="w-full h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0A0A0A] transition-all duration-500 ease-out rounded-full"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-4 gap-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="flex flex-col">
              {/* Step Circle */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full
                    transition-all duration-300 flex-shrink-0
                    ${
                      isCurrent
                        ? 'bg-[#0A0A0A] text-white ring-4 ring-black/10'
                        : isCompleted
                          ? 'bg-[#0A0A0A] text-white'
                          : 'bg-[#F4F4F5] text-[#A1A1AA]'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
              </div>

              {/* Step Title */}
              <div>
                <div
                  className={`
                    text-sm transition-colors
                    ${
                      isCurrent
                        ? 'text-[#0A0A0A] font-medium'
                        : isCompleted
                          ? 'text-[#2B2B2B]'
                          : 'text-[#A1A1AA]'
                    }
                  `}
                >
                  {step.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
