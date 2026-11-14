import { cn } from '@repo/ui';
import { Check } from 'lucide-react';
import {
  ADD_APPOINTMENT_BUTTON_CLASS,
  ADD_APPOINTMENT_PRIMARY_BUTTON_CLASS,
} from '../../../agenda-module/components/add-appointment-responsive/add-appointment.styles';
import { SERIES_ITEM_WARNING_CLASS } from '../../schedule-series-module.styles';
import type { TScheduleSeriesResultConfig } from './schedule-series-result.types';

/** "Depois de criar": quantas datas entraram e as que ficaram de fora. */
export const ScheduleSeriesResult = ({
  title,
  createdCount,
  totalCount,
  ruleLabel,
  conflicts,
  onPickAnotherTime,
  onDone,
}: TScheduleSeriesResultConfig) => (
  <div className="flex max-w-[560px] flex-col gap-4">
    {title}

    <div
      role="status"
      className="flex gap-3 rounded-[16px] bg-[#F2FAF5] px-4 py-3.5 text-sm leading-[1.45] text-[#0A5536]"
    >
      <Check aria-hidden="true" className="size-5 shrink-0 stroke-2" />
      <p>
        <b className="block">
          Série criada: {createdCount} de {totalCount} datas
        </b>
        {ruleLabel}
      </p>
    </div>

    {conflicts.length > 0 ? (
      <ul aria-label="Datas que ficaram de fora" className="grid gap-2">
        {conflicts.map((conflict) => (
          <li key={conflict.date} className={SERIES_ITEM_WARNING_CLASS}>
            <div className="grid min-w-0 gap-0.5">
              <b className="text-sm">{conflict.dayLabel} ficou de fora</b>
              <span className="text-[13px] text-[#5F5C6E]">
                {conflict.reasonLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onPickAnotherTime(conflict.date)}
              className={cn(
                ADD_APPOINTMENT_BUTTON_CLASS,
                'min-h-11 flex-none px-3.5 text-[13px]',
              )}
            >
              Escolher outro horário
              <span className="sr-only"> para {conflict.dayLabel}</span>
            </button>
          </li>
        ))}
      </ul>
    ) : null}

    <div className="flex justify-end">
      <button
        type="button"
        onClick={onDone}
        className={cn(
          ADD_APPOINTMENT_BUTTON_CLASS,
          ADD_APPOINTMENT_PRIMARY_BUTTON_CLASS,
          'flex-none px-6',
        )}
      >
        Concluir
      </button>
    </div>
  </div>
);
