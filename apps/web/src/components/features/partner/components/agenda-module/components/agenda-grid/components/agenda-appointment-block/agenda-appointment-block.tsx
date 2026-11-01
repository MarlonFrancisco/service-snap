import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { STATUS_CONFIG } from '../../agenda-grid.constants';
import {
  getAppointmentAriaLabel,
  getClientName,
  getProfessionalInitials,
} from '../../agenda-grid.helpers';
import type { TAgendaAppointmentBlockConfig } from './agenda-appointment-block.types';

export const AgendaAppointmentBlock = ({
  appointment,
  isCompact,
  showInitials,
  rowSpan,
  style,
  onClick,
}: TAgendaAppointmentBlockConfig) => {
  const status = STATUS_CONFIG[appointment.status];
  const schedule =
    rowSpan > 1
      ? `${appointment.startTime} - ${appointment.endTime}`
      : appointment.startTime;

  return (
    <button
      type="button"
      onClick={() => onClick(appointment)}
      aria-label={`${getAppointmentAriaLabel(appointment)}, ${status.label}`}
      className={cn(
        'absolute z-10 block overflow-hidden rounded-[9px] px-[7px] py-[3px] text-left text-[11px] leading-[14px] transition-[filter] hover:brightness-95',
        status.className,
        PARTNER_FOCUS_CLASS,
        'focus-visible:outline-offset-[-2px]',
      )}
      style={style}
    >
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
      {!isCompact && (
        <span className="block truncate">
          {appointment.service.name} · {schedule}
        </span>
      )}
      <span className="block truncate">{status.label}</span>
    </button>
  );
};
