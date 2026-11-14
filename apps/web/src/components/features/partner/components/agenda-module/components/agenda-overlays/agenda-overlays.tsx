import { AddAppointmentResponsive } from '../add-appointment-responsive/add-appointment-responsive';
import { AgendaReschedulePopover } from '../agenda-reschedule-popover';
import { AppointmentDetailsResponsive } from '../appointment-details-responsive/appointment-details-responsive';
import { BlockTimeDialog } from '../block-time-dialog';
import { BlockedTimeDialog } from '../blocked-time-dialog';
import { MyHoursDialog } from '../my-hours-dialog';
import { RescheduleDialog } from '../reschedule-dialog';

/** Diálogos e popovers da agenda, iguais na visão normal e no modo foco. */
export const AgendaOverlays = () => (
  <>
    <AppointmentDetailsResponsive />
    <AddAppointmentResponsive />
    <RescheduleDialog />
    <BlockTimeDialog />
    <BlockedTimeDialog />
    <MyHoursDialog />
    <AgendaReschedulePopover />
  </>
);
