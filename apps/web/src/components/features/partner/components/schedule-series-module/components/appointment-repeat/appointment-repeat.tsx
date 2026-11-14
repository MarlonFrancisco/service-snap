import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  cn,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@repo/ui';
import {
  ADD_APPOINTMENT_ERROR_CLASS,
  ADD_APPOINTMENT_FIELD_CLASS,
  ADD_APPOINTMENT_HINT_CLASS,
  ADD_APPOINTMENT_LABEL_CLASS,
  ADD_APPOINTMENT_NOTICE_CLASS,
  ADD_APPOINTMENT_SELECT_CLASS,
} from '../../../agenda-module/components/add-appointment-responsive/add-appointment.styles';
import { MAX_SERIES_OCCURRENCES } from '../../schedule-series-module.helpers';
import {
  SERIES_CHIP_CLASS,
  SERIES_ITEM_CLASS,
  SERIES_PREVIEW_STATUS,
} from '../../schedule-series-module.styles';
import type { TAppointmentRepeatConfig } from './appointment-repeat.types';

export const AppointmentRepeat = ({
  isEnabled,
  onToggle,
  intervalWeeks,
  intervalOptions,
  onIntervalChange,
  occurrences,
  onOccurrencesChange,
  maxOccurrences,
  occurrencesError,
  preview,
}: TAppointmentRepeatConfig) => (
  <section
    aria-labelledby="appointment-repeat-title"
    className="grid gap-3.5 border-t border-[#EBE9F0] pt-3"
  >
    <div className="flex items-center justify-between gap-3">
      <div className="grid gap-0.5">
        <span
          id="appointment-repeat-title"
          className="text-sm font-bold text-[#0B0B0F]"
        >
          Repetir
        </span>
        <span
          id="appointment-repeat-hint"
          className={ADD_APPOINTMENT_HINT_CLASS}
        >
          Cria um agendamento por data
        </span>
      </div>
      <Switch
        checked={isEnabled}
        onCheckedChange={onToggle}
        aria-labelledby="appointment-repeat-title"
        aria-describedby="appointment-repeat-hint"
      />
    </div>

    {isEnabled ? (
      <>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid content-start gap-1.5">
            <span
              id="appointment-repeat-interval-label"
              className={ADD_APPOINTMENT_LABEL_CLASS}
            >
              Frequência
            </span>
            <Select
              value={String(intervalWeeks)}
              onValueChange={onIntervalChange}
            >
              <SelectTrigger
                aria-labelledby="appointment-repeat-interval-label"
                className={ADD_APPOINTMENT_SELECT_CLASS}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={PARTNER_PORTAL_CLASS}>
                {intervalOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="grid content-start gap-1.5">
            <span className={ADD_APPOINTMENT_LABEL_CLASS}>
              Quantas vezes{' '}
              <span className="font-medium text-[#5F5C6E]">
                {`Até ${maxOccurrences}${maxOccurrences < MAX_SERIES_OCCURRENCES ? ' nesta frequência' : ''}, em até 6 meses`}
              </span>
            </span>
            <Input
              type="number"
              inputMode="numeric"
              min={2}
              max={maxOccurrences}
              value={occurrences}
              onChange={(event) => onOccurrencesChange(event.target.value)}
              aria-invalid={!!occurrencesError || undefined}
              className={ADD_APPOINTMENT_FIELD_CLASS}
            />
            {occurrencesError ? (
              <span role="alert" className={ADD_APPOINTMENT_ERROR_CLASS}>
                {occurrencesError}
              </span>
            ) : null}
          </label>
        </div>

        {preview.length > 0 ? (
          <ul aria-label="Datas da série" className="grid gap-2">
            {preview.map((item) => {
              const status =
                item.status === 'no-time'
                  ? null
                  : SERIES_PREVIEW_STATUS[item.status];

              return (
                <li key={item.date} className={SERIES_ITEM_CLASS}>
                  <div className="grid gap-0.5">
                    <b className="text-sm">{item.dayLabel}</b>
                    <span className="text-[13px] text-[#5F5C6E]">
                      {item.timeLabel}
                    </span>
                  </div>
                  {status ? (
                    <span className={cn(SERIES_CHIP_CLASS, status.className)}>
                      {status.label}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={ADD_APPOINTMENT_NOTICE_CLASS}>
            Escolha a primeira data para ver as datas da série.
          </p>
        )}

        <p className="text-sm leading-normal text-[#5F5C6E]">
          As datas livres entram; as ocupadas ficam de fora e aparecem para você
          escolher outro horário. O cliente recebe uma confirmação só, da
          primeira data.
        </p>
      </>
    ) : null}
  </section>
);
