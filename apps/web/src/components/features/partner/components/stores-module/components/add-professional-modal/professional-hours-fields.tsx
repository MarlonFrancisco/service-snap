import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn, Input, Switch } from '@repo/ui';
import {
  STORES_FIELDSET_CLASS,
  STORES_LEGEND_CLASS,
} from '../../stores-module.styles';
import { useProfessionalHoursFields } from './professional-hours-fields.hook';

const GRID_CLASS =
  'grid grid-cols-2 items-center gap-2 md:grid-cols-[84px_118px_repeat(4,minmax(0,1fr))] md:gap-x-2.5';
const TIME_INPUT_CLASS =
  'h-11 rounded-xl border-[#E3E1EA] bg-white px-2.5 text-sm font-medium text-[#0B0B0F] shadow-none md:text-sm';
const MOBILE_LABEL_CLASS = 'text-xs font-semibold text-[#5F5C6E] md:sr-only';

const TIME_FIELDS = [
  { field: 'openTime', label: 'Início', aria: 'início' },
  { field: 'closeTime', label: 'Fim', aria: 'fim' },
  { field: 'lunchStartTime', label: 'Almoço início', aria: 'início do almoço (opcional)' },
  { field: 'lunchEndTime', label: 'Almoço fim', aria: 'fim do almoço (opcional)' },
] as const;

export const ProfessionalHoursFields = () => {
  const {
    form,
    modeOptions,
    hoursMode,
    isCustom,
    rows,
    handleModeChange,
    handleToggleDay,
  } = useProfessionalHoursFields();

  return (
    <div className="grid gap-4">
      <fieldset className={cn(STORES_FIELDSET_CLASS, 'gap-2')}>
        <legend className={STORES_LEGEND_CLASS}>Horário de trabalho</legend>
        <div className="grid gap-2 md:grid-cols-2">
          {modeOptions.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-start gap-2.5 rounded-[14px] border border-[#E3E1EA] px-3.5 py-3 text-sm font-semibold',
                hoursMode === option.value && 'border-[#0B0B0F]',
              )}
            >
              <input
                type="radio"
                name="hoursMode"
                value={option.value}
                checked={hoursMode === option.value}
                onChange={() => handleModeChange(option.value)}
                className={cn(
                  'mt-0.5 size-5 shrink-0 accent-[#0B0B0F]',
                  PARTNER_FOCUS_CLASS,
                )}
              />
              <span>
                {option.label}
                <span className="block text-[13px] font-medium text-[#5F5C6E]">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {isCustom ? (
        <div
          role="group"
          aria-label="Horário por dia da semana"
          className="grid gap-2"
        >
          <div
            aria-hidden="true"
            className={cn(
              GRID_CLASS,
              'hidden text-xs font-bold tracking-[0.04em] text-[#5F5C6E] uppercase md:grid',
            )}
          >
            <span>Dia</span>
            <span>Atende</span>
            {TIME_FIELDS.map(({ label }) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          {rows.map((row) => (
            <div
              key={row.day}
              className="grid gap-1.5 rounded-[14px] border border-[#EBE9F0] p-3 md:rounded-none md:border-0 md:border-t md:px-0 md:py-2"
            >
              <div className={GRID_CLASS}>
                <span
                  className={cn(
                    'text-sm font-bold',
                    row.isStoreClosed && 'text-[#5F5C6E]',
                  )}
                >
                  {row.label}
                </span>

                <label
                  className={cn(
                    'flex min-h-11 items-center gap-2 text-[13px] font-semibold',
                    row.isStoreClosed
                      ? 'cursor-not-allowed text-[#5F5C6E]'
                      : 'cursor-pointer',
                  )}
                >
                  <Switch
                    checked={row.isWorking}
                    disabled={row.isStoreClosed}
                    aria-label={row.switchLabel}
                    onCheckedChange={() => handleToggleDay(row.index)}
                    className="data-[state=checked]:bg-[#0B0B0F]"
                  />
                  {row.isStoreClosed
                    ? 'Fechado'
                    : row.isWorking
                      ? 'Atende'
                      : 'Folga'}
                </label>

                {row.isWorking ? (
                  TIME_FIELDS.map(({ field, label, aria }) => (
                    <label key={field} className="grid min-w-0 gap-1">
                      <span className={MOBILE_LABEL_CLASS}>{label}</span>
                      <Input
                        type="time"
                        aria-label={`${row.label}, ${aria}`}
                        aria-invalid={
                          !!form.formState.errors.days?.[row.index]?.[field]
                        }
                        {...form.register(`days.${row.index}.${field}`)}
                        className={TIME_INPUT_CLASS}
                      />
                    </label>
                  ))
                ) : (
                  <span className="col-span-2 text-[13px] font-medium text-[#5F5C6E] md:col-span-4">
                    {row.isStoreClosed
                      ? 'Loja fechada'
                      : `Folga fixa: não atende ${row.offLabel}`}
                  </span>
                )}
              </div>

              {row.error ? (
                <p role="alert" className="text-[13px] font-semibold text-[#A4231A]">
                  {row.label}: {row.error}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <p className="rounded-[14px] bg-[#F7F6FA] px-3.5 py-3 text-[13px] leading-normal">
        Folgas e férias pontuais ficam em Bloquear horário, na agenda.
      </p>
    </div>
  );
};
