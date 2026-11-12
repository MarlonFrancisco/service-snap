import { cn, Input } from '@repo/ui';
import {
  ADD_APPOINTMENT_ERROR_CLASS,
  ADD_APPOINTMENT_FIELD_CLASS,
  ADD_APPOINTMENT_LABEL_CLASS,
  ADD_APPOINTMENT_LEGEND_CLASS,
  ADD_APPOINTMENT_LINK_BUTTON_CLASS,
  ADD_APPOINTMENT_NOTICE_CLASS,
  ADD_APPOINTMENT_TIME_ACTIVE_CLASS,
  ADD_APPOINTMENT_TIME_CLASS,
  ADD_APPOINTMENT_WARNING_CLASS,
} from '../add-appointment.styles';
import type { TAppointmentTimeFieldConfig } from './appointment-time-field.types';

export const AppointmentTimeField = ({
  options,
  onSelect,
  isFitIn,
  onFitInToggle,
  fitInTime,
  onFitInTimeChange,
  canLoad,
  isLoading,
  isError,
  timeError,
  fitInError,
}: TAppointmentTimeFieldConfig) => {
  const renderSlots = () => {
    if (!canLoad) {
      return (
        <p className={ADD_APPOINTMENT_NOTICE_CLASS}>
          Escolha os serviços, o profissional e a data para ver os horários
          livres.
        </p>
      );
    }
    if (isLoading) {
      return (
        <p role="status" className={ADD_APPOINTMENT_NOTICE_CLASS}>
          Carregando horários...
        </p>
      );
    }
    if (isError) {
      return (
        <p role="alert" className={ADD_APPOINTMENT_NOTICE_CLASS}>
          Não foi possível carregar os horários. Use Encaixar fora dos horários
          ou tente de novo.
        </p>
      );
    }
    if (options.length === 0) {
      return (
        <p className={ADD_APPOINTMENT_NOTICE_CLASS}>
          Nenhum horário livre neste dia. Escolha outra data ou encaixe fora dos
          horários.
        </p>
      );
    }

    return (
      <div
        role="group"
        aria-label="Horários oferecidos"
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => (
          <button
            key={option.time}
            type="button"
            aria-pressed={option.isSelected}
            onClick={() => onSelect(option.time)}
            className={cn(
              ADD_APPOINTMENT_TIME_CLASS,
              option.isSelected && ADD_APPOINTMENT_TIME_ACTIVE_CLASS,
            )}
          >
            {option.time}
          </button>
        ))}
      </div>
    );
  };

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">Horário</legend>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <span aria-hidden="true" className={ADD_APPOINTMENT_LEGEND_CLASS}>
          Horário *
        </span>
        <button
          type="button"
          aria-pressed={isFitIn}
          onClick={onFitInToggle}
          className={ADD_APPOINTMENT_LINK_BUTTON_CLASS}
        >
          Encaixar fora dos horários
        </button>
      </div>

      {renderSlots()}

      {!isFitIn && timeError ? (
        <p role="alert" className={cn(ADD_APPOINTMENT_ERROR_CLASS, 'mt-1.5')}>
          {timeError}
        </p>
      ) : null}

      {isFitIn ? (
        <div className="mt-2.5 grid items-end gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
          <label className="grid gap-1.5">
            <span className={ADD_APPOINTMENT_LABEL_CLASS}>
              Horário do encaixe
            </span>
            <Input
              type="time"
              value={fitInTime}
              onChange={(event) => onFitInTimeChange(event.target.value)}
              aria-invalid={!!fitInError || undefined}
              className={ADD_APPOINTMENT_FIELD_CLASS}
            />
          </label>
          <p className={ADD_APPOINTMENT_WARNING_CLASS}>
            Fora dos horários oferecidos. Confira se o profissional está livre.
          </p>
          {fitInError ? (
            <p role="alert" className={ADD_APPOINTMENT_ERROR_CLASS}>
              {fitInError}
            </p>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
};
