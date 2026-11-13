import { cn } from '@repo/ui';
import { memo } from 'react';
import { GRID_CONSTANTS } from '../agenda-grid/agenda-grid.constants';
import {
  getProfessionalFullName,
  getProfessionalInitials,
} from '../agenda-grid/agenda-grid.helpers';
import { AgendaColumn } from '../agenda-grid/components/agenda-column';
import { AgendaDayStrip } from '../agenda-grid/components/agenda-day-strip';
import { AgendaTimeColumn } from '../agenda-grid/components/agenda-time-column';
import { BulkActionToolbar } from '../agenda-grid/components/bulk-action-toolbar';
import { CurrentTimeLine } from '../agenda-grid/components/current-time-line';
import { useAgendaDayView } from './agenda-day-view.hook';

const SLOT_HEIGHT = GRID_CONSTANTS.DAY_SLOT_HEIGHT;
const HEADER_HEIGHT = GRID_CONSTANTS.DAY_HEADER_HEIGHT;

/**
 * Visão de dia no desktop: uma coluna por profissional.
 * No mobile, a agenda já é organizada por dia e usa AgendaGridMobileView.
 */
export const AgendaDayView = memo(() => {
  const {
    timeSlots,
    isBlockMode,
    selectedDayData,
    professionalColumns,
    weekDaysNavigation,
    dayTitle,
    gridStyle,
    scrollClassName,
    handleSelectDay,
    handleAppointmentClick,
    handleBlockedBlockClick,
    bulkBlockHook,
    drag,
  } = useAgendaDayView();

  if (!selectedDayData) {
    return null;
  }

  const { isToday, isWorkingDay, holiday } = selectedDayData;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="text-2xl font-extrabold tracking-[-0.025em]">
          {dayTitle}
        </h2>
        {isToday && (
          <span className="rounded-full bg-[#0B0B0F] px-[11px] py-[5px] text-xs font-bold text-white">
            Hoje
          </span>
        )}
        {!isWorkingDay && (
          <span className="rounded-full bg-[#F4F3F7] px-[11px] py-[5px] text-xs font-bold text-[#5F5C6E]">
            Dia não útil
          </span>
        )}
        {holiday && (
          <span className="rounded-full bg-[#DEDBE6] px-[11px] py-[5px] text-xs font-bold text-[#0B0B0F]">
            {holiday.name ? `Feriado · ${holiday.name}` : 'Feriado'}
          </span>
        )}
      </div>

      <AgendaDayStrip
        days={weekDaysNavigation}
        variant="pill"
        onSelect={handleSelectDay}
      />

      <div
        className={cn(
          'overflow-auto rounded-[22px] border border-[#EBE9F0]',
          scrollClassName,
        )}
      >
        <div className="relative grid" style={gridStyle}>
          {isToday && (
            <CurrentTimeLine
              timeSlots={timeSlots}
              slotHeight={SLOT_HEIGHT}
              headerHeight={HEADER_HEIGHT}
            />
          )}

          <AgendaTimeColumn
            timeSlots={timeSlots}
            slotHeight={SLOT_HEIGHT}
            headerHeight={HEADER_HEIGHT}
          />

          {professionalColumns.map(({ professional, column }) => (
            <div key={professional.id} className="flex min-w-0 flex-col">
              <div
                className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-[#EBE9F0] bg-[#F7F6FA] px-3 text-sm font-bold"
                style={{ height: HEADER_HEIGHT }}
              >
                <span
                  aria-hidden="true"
                  className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#0B0B0F] text-xs font-bold text-white"
                >
                  {getProfessionalInitials(professional)}
                </span>
                <span className="truncate">
                  {getProfessionalFullName(professional)}
                </span>
              </div>

              {isWorkingDay ? (
                <AgendaColumn
                  column={column}
                  slotHeight={SLOT_HEIGHT}
                  showInitials={false}
                  drag={drag}
                  onAppointmentClick={handleAppointmentClick}
                  onBlockedClick={handleBlockedBlockClick}
                />
              ) : (
                <div
                  className="border-l border-[#F0EEF4] bg-[#F7F6FA] p-2 text-center text-xs font-medium text-[#5F5C6E]"
                  style={{ height: SLOT_HEIGHT * timeSlots.length }}
                >
                  Dia não útil
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isBlockMode && (
        <BulkActionToolbar
          selectedCount={bulkBlockHook.selectedSlotsArray.length}
          actionLabel={bulkBlockHook.bulkActionLabel}
          onBlock={bulkBlockHook.executeBlockAction}
          onClear={bulkBlockHook.clearSelection}
        />
      )}
    </>
  );
});

AgendaDayView.displayName = 'AgendaDayView';
