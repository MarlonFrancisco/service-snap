import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { Info, Plus } from 'lucide-react';
import { AgendaDataState } from '../agenda-data-state';
import { AgendaDayView } from '../agenda-day-view';
import { AgendaGrid } from '../agenda-grid';
import { AgendaMonthView } from '../agenda-month-view';
import { AgendaOverlays } from '../agenda-overlays';
import { AgendaToolbar } from '../agenda-toolbar/agenda-toolbar';
import { BlockModeAlert } from '../block-mode-alert/block-mode-alert';
import { useAgendaDefaultView } from './agenda-default-view.hook';

export function AgendaDefaultView() {
  const { view, showProfessionalNote, handleOpenAddAppointment } =
    useAgendaDefaultView();

  return (
    <div className="space-y-4">
      <AgendaToolbar />

      {showProfessionalNote && (
        <p className="flex items-center gap-2.5 rounded-[14px] bg-[#F7F6FA] px-4 py-3 text-sm font-medium">
          <Info
            className="size-[18px] shrink-0 stroke-[1.8] text-[#5F5C6E]"
            aria-hidden="true"
          />
          Você vê só a sua agenda. Para mudar serviços ou horários da loja,
          fale com o dono ou gerente.
        </p>
      )}

      <BlockModeAlert />

      <AgendaDataState>
        {view === 'day' && <AgendaDayView />}
        {view === 'week' && <AgendaGrid />}
        {view === 'month' && <AgendaMonthView />}
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

      <AgendaOverlays />
    </div>
  );
}
