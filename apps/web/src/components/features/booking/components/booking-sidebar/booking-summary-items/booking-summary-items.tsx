import { getFullName } from '@/utils/helpers/name.helper';
import { useBookingSidebar } from '../booking-sidebar.hook';

type TBookingSummaryItemsConfig = {
  summary: ReturnType<typeof useBookingSidebar>;
};

const SECTION_LABEL_CLASS =
  'mt-5 mb-2.5 border-t border-[#F0EEF4] pt-5 text-[13px] font-bold tracking-[0.06em] text-[#5F5C6E] uppercase';
const NOTICE_CLASS =
  'mt-5 rounded-[14px] bg-[#F7F6FA] px-3.5 py-3 text-center text-sm text-[#5F5C6E]';

/** Serviços, profissional e horário: conteúdo comum ao painel e à gaveta mobile. */
export function BookingSummaryItems({ summary }: TBookingSummaryItemsConfig) {
  const {
    selectedServices,
    selectedProfessional,
    isAnyProfessional,
    selectedDate,
    selectedTime,
    totalDuration,
  } = summary.data;
  const { formatPrice, formatDuration, formatFullDate } = summary.formatters;
  const { showEmptyState, showProfessionalWarning, showDateTimeWarning } =
    summary.state;

  return (
    <>
      {selectedServices.length > 0 && (
        <>
          <p className={SECTION_LABEL_CLASS}>Serviços</p>
          <div className="space-y-3">
            {selectedServices.map((service) => (
              <div
                key={service.id}
                className="flex justify-between gap-4 text-sm text-[#0B0B0F]"
              >
                <div className="min-w-0">
                  {service.name}
                  {service.quantity > 1 && (
                    <b className="ml-1.5 font-bold">{service.quantity}x</b>
                  )}
                  <span className="mt-0.5 block text-[13px] text-[#5F5C6E]">
                    {formatDuration(service.duration * service.quantity)}
                  </span>
                </div>
                <b className="shrink-0 font-bold">
                  {formatPrice(service.price * service.quantity)}
                </b>
              </div>
            ))}
          </div>

          {selectedServices.length > 1 && (
            <p className="mt-3 flex justify-between gap-4 text-[13px] text-[#5F5C6E]">
              Duração total
              <span>{formatDuration(totalDuration)}</span>
            </p>
          )}
        </>
      )}

      {(selectedProfessional || isAnyProfessional) && (
        <>
          <p className={SECTION_LABEL_CLASS}>Profissional</p>
          <p className="text-sm text-[#0B0B0F]">
            {isAnyProfessional
              ? 'Qualquer profissional'
              : getFullName(
                  selectedProfessional?.user.firstName,
                  selectedProfessional?.user.lastName,
                )}
          </p>
        </>
      )}

      {selectedDate && selectedTime && (
        <>
          <p className={SECTION_LABEL_CLASS}>Agendado para</p>
          <div className="text-sm text-[#0B0B0F]">
            <p className="first-letter:uppercase">
              {formatFullDate(selectedDate)}
            </p>
            <span className="mt-0.5 block text-[13px] text-[#5F5C6E]">
              {selectedTime}
            </span>
          </div>
        </>
      )}

      {showEmptyState && (
        <p className={NOTICE_CLASS}>Selecione um serviço para começar</p>
      )}
      {showProfessionalWarning && (
        <p className={NOTICE_CLASS}>Escolha um profissional</p>
      )}
      {showDateTimeWarning && (
        <p className={NOTICE_CLASS}>Selecione data e horário</p>
      )}
    </>
  );
}
