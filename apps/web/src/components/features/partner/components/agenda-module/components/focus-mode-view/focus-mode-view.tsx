import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { Plus } from 'lucide-react';
import { AddAppointmentResponsive } from '../add-appointment-responsive/add-appointment-responsive';
import { AgendaDataState } from '../agenda-data-state';
import { AgendaGrid } from '../agenda-grid';
import { AgendaToolbar } from '../agenda-toolbar/agenda-toolbar';
import { AppointmentDetailsResponsive } from '../appointment-details-responsive/appointment-details-responsive';
import { BlockModeAlert } from '../block-mode-alert/block-mode-alert';
import { useFocusModeView } from './focus-mode-view.hook';

export function FocusModeView() {
  const { handleOpenAddAppointment } = useFocusModeView();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="border-b border-[#EBE9F0] bg-white px-4 py-3 md:px-6 md:py-3.5">
        <AgendaToolbar variant="focus" />
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 md:px-6">
        <BlockModeAlert />

        <AgendaDataState>
          <AgendaGrid />
        </AgendaDataState>
      </div>

      <button
        type="button"
        aria-label="Novo agendamento"
        onClick={handleOpenAddAppointment}
        className={cn(
          'fixed right-5 bottom-5 z-40 grid size-14 place-items-center rounded-full bg-[#0B0B0F] text-white shadow-[0_12px_40px_rgba(15,12,30,0.25)] md:hidden',
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
