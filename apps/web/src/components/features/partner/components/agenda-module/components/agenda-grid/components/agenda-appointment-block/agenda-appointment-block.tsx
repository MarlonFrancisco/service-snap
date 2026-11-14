import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { STATUS_CONFIG } from '../../agenda-grid.constants';
import {
  getAppointmentCardAriaLabel,
  getClientName,
  getProfessionalInitials,
  getVisitDuration,
  getVisitItems,
  getVisitServiceNames,
} from '../../agenda-grid.helpers';
import { AgendaPresenceChip } from '../agenda-presence-chip';
import type { TAgendaAppointmentBlockConfig } from './agenda-appointment-block.types';

export const AgendaAppointmentBlock = ({
  appointment,
  isCompact,
  showInitials,
  rowSpan,
  presence,
  style,
  isDraggable,
  isMoving,
  onClick,
  onDragStart,
  onDragEnd,
}: TAgendaAppointmentBlockConfig) => {
  const status = STATUS_CONFIG[appointment.status];
  const serviceCount = getVisitItems(appointment).length;
  const isVisit = serviceCount > 1;
  const schedule =
    rowSpan > 1
      ? `${appointment.startTime}–${appointment.endTime}`
      : appointment.startTime;
  const ariaLabel = `${getAppointmentCardAriaLabel(appointment, presence)}${isDraggable ? '. Arraste para remarcar' : ''}`;

  return (
    <button
      type="button"
      draggable={isDraggable}
      onClick={() => onClick(appointment)}
      onDragStart={(event) => onDragStart(appointment, event)}
      onDragEnd={onDragEnd}
      aria-label={ariaLabel}
      className={cn(
        'absolute z-10 block overflow-hidden rounded-[9px] px-[7px] py-[3px] text-left text-[11px] leading-[14px] transition-[filter] hover:brightness-95',
        isMoving
          ? 'border-2 border-dashed border-[#C9C6D4] bg-white text-[#5F5C6E]'
          : status.className,
        isDraggable && 'cursor-grab active:cursor-grabbing',
        PARTNER_FOCUS_CLASS,
        'focus-visible:outline-offset-[-2px]',
      )}
      style={style}
    >
      {isMoving ? (
        <span className="flex h-full items-center justify-center text-[11px] font-semibold">
          Saindo de {appointment.startTime}
        </span>
      ) : (
        <>
          <span className="flex min-w-0 items-center text-xs font-bold">
            {showInitials && (
              <span
                aria-hidden="true"
                className="mr-[3px] inline-grid h-3.5 min-w-5 shrink-0 place-items-center rounded-[5px] bg-white/75 px-[3px] text-[10px] font-extrabold"
              >
                {getProfessionalInitials(appointment.storeMember)}
              </span>
            )}
            <span className="min-w-0 truncate">
              {getClientName(appointment.user)}
            </span>
          </span>
          {isVisit && (
            <span className="my-0.5 inline-block rounded-full bg-white/85 px-[7px] py-px text-[10px] font-extrabold">
              {serviceCount} serviços
            </span>
          )}
          {isVisit && !isCompact && (
            <>
              <span className="block truncate">
                {schedule} · {getVisitDuration(appointment)}
              </span>
              <span className="block truncate">
                {getVisitServiceNames(appointment)}
              </span>
            </>
          )}
          {!isVisit && !isCompact && (
            <span className="block truncate">
              {appointment.service.name} · {schedule}
            </span>
          )}
          {/* A cor já diz o status: com presença, a linha dele vira o selo. */}
          {presence ? (
            <AgendaPresenceChip kind={presence.kind} />
          ) : (
            <span className="block truncate">{status.label}</span>
          )}
        </>
      )}
    </button>
  );
};
