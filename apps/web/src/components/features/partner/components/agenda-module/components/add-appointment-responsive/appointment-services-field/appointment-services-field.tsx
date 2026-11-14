import { cn } from '@repo/ui';
import {
  ADD_APPOINTMENT_ERROR_CLASS,
  ADD_APPOINTMENT_LEGEND_CLASS,
  ADD_APPOINTMENT_NOTICE_CLASS,
  ADD_APPOINTMENT_OPTION_ACTIVE_CLASS,
  ADD_APPOINTMENT_OPTION_CLASS,
  ADD_APPOINTMENT_OPTION_INPUT_CLASS,
} from '../add-appointment.styles';
import type { TAppointmentServicesFieldConfig } from './appointment-services-field.types';

export const AppointmentServicesField = ({
  options,
  onToggle,
  error,
}: TAppointmentServicesFieldConfig) => (
  <fieldset
    aria-invalid={!!error || undefined}
    className="m-0 min-w-0 border-0 p-0"
  >
    <legend className={cn(ADD_APPOINTMENT_LEGEND_CLASS, 'mb-2')}>
      Serviços *
    </legend>

    {options.length === 0 ? (
      <p className={ADD_APPOINTMENT_NOTICE_CLASS}>
        A loja ainda não tem serviços ativos. Cadastre em Serviços.
      </p>
    ) : (
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.id}
            className={cn(
              ADD_APPOINTMENT_OPTION_CLASS,
              option.isSelected && ADD_APPOINTMENT_OPTION_ACTIVE_CLASS,
            )}
          >
            <input
              type="checkbox"
              checked={option.isSelected}
              onChange={() => onToggle(option.id)}
              className={ADD_APPOINTMENT_OPTION_INPUT_CLASS}
            />
            <span className="min-w-0 flex-1">
              <b className="block text-sm font-bold break-words">
                {option.name}
              </b>
              <span className="mt-0.5 block text-[13px] font-medium text-[#5F5C6E]">
                {option.durationLabel}
              </span>
            </span>
            <em className="text-sm font-bold whitespace-nowrap not-italic">
              {option.priceLabel}
            </em>
          </label>
        ))}
      </div>
    )}

    {error ? (
      <p role="alert" className={cn(ADD_APPOINTMENT_ERROR_CLASS, 'mt-1.5')}>
        {error}
      </p>
    ) : null}
  </fieldset>
);
