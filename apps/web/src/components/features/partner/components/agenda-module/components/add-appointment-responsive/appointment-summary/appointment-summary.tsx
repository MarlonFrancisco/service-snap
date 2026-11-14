import { cn, Spinner } from '@repo/ui';
import {
  ADD_APPOINTMENT_BUTTON_CLASS,
  ADD_APPOINTMENT_PRIMARY_BUTTON_CLASS,
} from '../add-appointment.styles';
import type { TAppointmentSummaryConfig } from './appointment-summary.types';

const ROW_CLASS = 'border-b border-[#E9E7EF] py-3 text-sm';
const TERM_CLASS = 'text-xs font-semibold text-[#5F5C6E]';
const DETAIL_CLASS = 'mt-[3px] font-semibold break-words';

export const AppointmentSummary = ({
  summary,
  submitError,
  isSubmitting,
  submitLabel,
  onCancel,
}: TAppointmentSummaryConfig) => (
  <aside
    aria-label="Resumo do agendamento"
    className="flex flex-col self-start rounded-[22px] bg-[#F7F6FA] p-[22px] lg:sticky lg:top-0 lg:mt-[52px]"
  >
    <h3 className="mb-1.5 text-[17px] font-extrabold tracking-[-0.015em]">
      Resumo
    </h3>

    <dl className="m-0">
      <div className={ROW_CLASS}>
        <dt className={TERM_CLASS}>Cliente</dt>
        <dd className={DETAIL_CLASS}>
          {summary.customerName}
          {summary.customerContact ? (
            <span className="block text-[13px] font-medium break-all text-[#5F5C6E]">
              {summary.customerContact}
            </span>
          ) : null}
        </dd>
      </div>
      <div className={ROW_CLASS}>
        <dt className={TERM_CLASS}>Serviços</dt>
        <dd className={DETAIL_CLASS}>
          {summary.services.length === 0
            ? '—'
            : summary.services.map((service) => (
                <span
                  key={service.id}
                  className="mt-1 flex justify-between gap-3 first:mt-0"
                >
                  <span>{service.name}</span>
                  <em className="font-medium whitespace-nowrap text-[#5F5C6E] not-italic">
                    {service.priceLabel}
                  </em>
                </span>
              ))}
        </dd>
      </div>
      <div className={ROW_CLASS}>
        <dt className={TERM_CLASS}>Profissional</dt>
        <dd className={DETAIL_CLASS}>{summary.professionalName}</dd>
      </div>
      <div className={ROW_CLASS}>
        <dt className={TERM_CLASS}>Data e hora</dt>
        <dd className={DETAIL_CLASS}>{summary.dateTimeLabel}</dd>
      </div>
      <div className={ROW_CLASS}>
        <dt className={TERM_CLASS}>Duração total</dt>
        <dd className={DETAIL_CLASS}>{summary.durationLabel}</dd>
      </div>
    </dl>

    <p className="flex items-baseline justify-between pt-3.5 text-[15px] font-semibold">
      Total
      <b className="text-[22px] font-extrabold">{summary.totalLabel}</b>
    </p>
    <p className="mt-0.5 text-right text-[13px] text-[#5F5C6E]">
      Pagamento no local
    </p>

    {submitError ? (
      <p
        role="alert"
        className="mt-4 rounded-[14px] bg-[#FBE8E6] px-3.5 py-3 text-[13px] font-semibold text-[#A4231A]"
      >
        {submitError}
      </p>
    ) : null}

    <div className="mt-5 flex gap-2.5">
      <button
        type="button"
        onClick={onCancel}
        className={ADD_APPOINTMENT_BUTTON_CLASS}
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          ADD_APPOINTMENT_BUTTON_CLASS,
          ADD_APPOINTMENT_PRIMARY_BUTTON_CLASS,
        )}
      >
        {isSubmitting ? (
          <>
            <Spinner />
            Criando...
          </>
        ) : (
          submitLabel ?? 'Criar agendamento'
        )}
      </button>
    </div>
  </aside>
);
