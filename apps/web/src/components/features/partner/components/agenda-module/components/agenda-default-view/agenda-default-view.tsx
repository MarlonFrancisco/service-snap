import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { Plus } from 'lucide-react';
import { AddAppointmentResponsive } from '../add-appointment-responsive/add-appointment-responsive';
import { AgendaDataState } from '../agenda-data-state';
import { AgendaDayView } from '../agenda-day-view';
import { AgendaGrid } from '../agenda-grid';
import { AgendaToolbar } from '../agenda-toolbar/agenda-toolbar';
import { AppointmentDetailsResponsive } from '../appointment-details-responsive/appointment-details-responsive';
import { BlockModeAlert } from '../block-mode-alert/block-mode-alert';
import { useAgendaDefaultView } from './agenda-default-view.hook';

export function AgendaDefaultView() {
  const { showDayView, handleOpenAddAppointment } = useAgendaDefaultView();

  return (
    <div className="space-y-4">
      <AgendaToolbar />

      <BlockModeAlert />

      <AgendaDataState>
        {showDayView ? <AgendaDayView /> : <AgendaGrid />}
      </AgendaDataState>

      <button
        type="button"
        aria-label="Novo agendamento"
        onClick={handleOpenAddAppointment}
        className={cn(
          'fixed right-5 bottom-5 z-30 grid size-14 place-items-center rounded-full bg-[#0B0B0F] text-white shadow-[0_12px_40px_rgba(15,12,30,0.25)] md:hidden',
          PARTNER_FOCUS_CLASS,
        )}
      >
        <Plus className="size-6" aria-hidden="true" />
      </button>

      <AppointmentDetailsResponsive />

      <AddAppointmentResponsive />
    </div>
  );
}
