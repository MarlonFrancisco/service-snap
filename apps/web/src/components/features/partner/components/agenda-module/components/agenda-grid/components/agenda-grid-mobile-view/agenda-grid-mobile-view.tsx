import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { formatPriceByCountry } from '@repo/shared/formatters';
import { cn } from '@repo/ui';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { AGENDA_BUTTON_CLASS } from '../../../../agenda-module.styles';
import { STATUS_CONFIG } from '../../agenda-grid.constants';
import {
  getAppointmentAriaLabel,
  getClientName,
  getVisitItems,
  getVisitServiceNames,
} from '../../agenda-grid.helpers';
import { AgendaDayStrip } from '../agenda-day-strip';
import { AgendaSlotButton } from '../agenda-slot-button';
import { useAgendaGridMobileView } from './agenda-grid-mobile-view.hook';
import type { TMobileViewConfig } from './agenda-grid-mobile-view.types';

const APPOINTMENT_CARD_CLASS = cn(
  'grid w-full grid-cols-[52px_1fr] gap-2.5 rounded-[18px] border border-[#EBE9F0] bg-white p-3 text-left',
  PARTNER_FOCUS_CLASS,
);

export const AgendaGridMobileView = memo(({ gridHook }: TMobileViewConfig) => {
  const {
    isBlockMode,
    selectedDayData,
    weekDaysNavigation,
    handleSelectDay,
    handleQuickAdd,
    handleAppointmentClick,
  } = gridHook;

  const { dayTitle, blockSections, dayAppointments } =
    useAgendaGridMobileView(gridHook);

  if (!selectedDayData) return null;

  const { date, holiday } = selectedDayData;
  const isWorkingDay = selectedDayData.isWorkingDay && !holiday;

  return (
    <div className="pb-24">
      <AgendaDayStrip
        days={weekDaysNavigation}
        variant="card"
        onSelect={handleSelectDay}
      />

      <h2 className="mt-5 mb-2.5 text-[15px] font-extrabold">{dayTitle}</h2>

      {holiday && (
        <p className="rounded-[18px] bg-[#F7F6FA] p-6 text-center text-sm font-medium text-[#5F5C6E]">
          <b className="block text-[#0B0B0F]">
            {holiday.name ? `Feriado · ${holiday.name}` : 'Feriado'}
          </b>
          Loja fechada o dia todo
        </p>
      )}

      {!holiday && !isWorkingDay && (
        <p className="rounded-[18px] bg-[#F7F6FA] p-6 text-center text-sm font-medium text-[#5F5C6E]">
          Dia não útil
        </p>
      )}

      {isWorkingDay && isBlockMode && (
        <div className="space-y-4">
          {blockSections.map(({ professional, items }) => (
            <section key={professional.id}>
              <h3 className="mb-2 text-sm font-bold">
                {professional.user.firstName} {professional.user.lastName}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {items.map((item) =>
                  item.appointment ? (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleAppointmentClick(item.appointment)}
                      aria-label={`${getAppointmentAriaLabel(item.appointment)}, ${STATUS_CONFIG[item.appointment.status].label}`}
                      className={cn(
                        'col-span-3 rounded-[14px] p-3 text-left text-sm',
                        STATUS_CONFIG[item.appointment.status].className,
                        PARTNER_FOCUS_CLASS,
                      )}
                    >
                      <b className="block truncate">
                        {item.appointment.startTime} -{' '}
                        {item.appointment.endTime} ·{' '}
                        {getClientName(item.appointment.user)}
                      </b>
                      <span className="block truncate text-xs">
                        {getVisitServiceNames(item.appointment)} ·{' '}
                        {STATUS_CONFIG[item.appointment.status].label}
                      </span>
                    </button>
                  ) : (
                    item.slot && (
                      <div
                        key={item.key}
                        className="min-h-11 rounded-[9px] border border-[#EBE9F0]"
                      >
                        <AgendaSlotButton slot={item.slot} />
                      </div>
                    )
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {isWorkingDay && !isBlockMode && dayAppointments.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-[18px] bg-[#F7F6FA] p-6 text-center">
          <p className="text-sm font-medium text-[#5F5C6E]">
            Nenhum agendamento
          </p>
          <button
            type="button"
            onClick={() => handleQuickAdd(date)}
            aria-label={`Adicionar agendamento em ${dayTitle}`}
            className={AGENDA_BUTTON_CLASS}
          >
            <Plus className="size-4" aria-hidden="true" />
            Adicionar
          </button>
        </div>
      )}

      {isWorkingDay && !isBlockMode && dayAppointments.length > 0 && (
        <ul className="space-y-2">
          {dayAppointments.map((appointment) => {
            const status = STATUS_CONFIG[appointment.status];

            return (
              <li key={appointment.id}>
                <button
                  type="button"
                  onClick={() => handleAppointmentClick(appointment)}
                  aria-label={`${getAppointmentAriaLabel(appointment)}, ${status.label}`}
                  className={APPOINTMENT_CARD_CLASS}
                >
                  <time className="text-sm font-extrabold">
                    {appointment.startTime}
                  </time>
                  <span className="min-w-0">
                    <b className="block truncate text-[15px]">
                      {getClientName(appointment.user)}
                    </b>
                    <span className="mt-0.5 block truncate text-[13px] text-[#5F5C6E]">
                      {getVisitServiceNames(appointment)} ·{' '}
                      {appointment.storeMember.user.firstName}{' '}
                      {appointment.storeMember.user.lastName}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-[#5F5C6E]">
                      {formatPriceByCountry(
                        getVisitItems(appointment).reduce(
                          (total, item) => total + (item.service.price ?? 0),
                          0,
                        ),
                      )}
                    </span>
                    <span
                      className={cn(
                        'mt-1.5 inline-block rounded-full px-[9px] py-[3px] text-xs font-bold',
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

AgendaGridMobileView.displayName = 'AgendaGridMobileView';
