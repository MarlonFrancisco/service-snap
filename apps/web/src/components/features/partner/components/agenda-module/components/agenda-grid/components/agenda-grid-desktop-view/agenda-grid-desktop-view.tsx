import { cn } from '@repo/ui';
import { memo } from 'react';
import {
  GRID_CONSTANTS,
  PRESENCE_LEGEND,
  STATUS_LEGEND,
} from '../../agenda-grid.constants';
import { AgendaColumn } from '../agenda-column';
import { AgendaPresenceChip } from '../agenda-presence-chip';
import { AgendaTimeColumn } from '../agenda-time-column';
import { BulkActionToolbar } from '../bulk-action-toolbar';
import { CurrentTimeLine } from '../current-time-line';
import { useAgendaGridDesktopView } from './agenda-grid-desktop-view.hook';
import type { TDesktopViewConfig } from './agenda-grid-desktop-view.types';

const SLOT_HEIGHT = GRID_CONSTANTS.WEEK_SLOT_HEIGHT;
const HEADER_HEIGHT = GRID_CONSTANTS.WEEK_HEADER_HEIGHT;

export const AgendaGridDesktopView = memo(
  ({ gridHook }: TDesktopViewConfig) => {
    const {
      timeSlots,
      hasTodayInWeek,
      isBlockMode,
      isFocusMode,
      scrollClassName,
      handleAppointmentClick,
      bulkBlockHook,
    } = gridHook;
    const { dayColumns, gridStyle } = useAgendaGridDesktopView(gridHook);

    return (
      <>
        <div
          className={cn(
            'overflow-auto rounded-[22px] border border-[#EBE9F0]',
            scrollClassName,
          )}
        >
          <div className="relative grid" style={gridStyle}>
            {hasTodayInWeek && (
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

            {dayColumns.map((day) => (
              <div key={day.dayIndex} className="min-w-0">
                <div
                  className={cn(
                    'sticky top-0 z-30 flex flex-col items-center justify-center border-b border-[#EBE9F0] text-center text-[13px] font-bold',
                    day.isToday
                      ? 'bg-[#0B0B0F] text-white'
                      : 'bg-[#F7F6FA] text-[#0B0B0F]',
                    !day.isWorkingDay && !day.isToday && 'text-[#5F5C6E]',
                  )}
                  style={{ height: HEADER_HEIGHT }}
                  aria-label={`${day.label}, ${day.date.getDate()}${day.isToday ? ', hoje' : ''}`}
                >
                  {day.shortLabel}
                  <span className="block text-lg leading-tight">
                    {day.date.getDate()}
                  </span>
                </div>

                {day.isWorkingDay ? (
                  <div className="flex">
                    {day.columns.map(({ id, column }) => (
                      <AgendaColumn
                        key={id}
                        column={column}
                        slotHeight={SLOT_HEIGHT}
                        showInitials
                        onAppointmentClick={handleAppointmentClick}
                      />
                    ))}
                  </div>
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

        {!isFocusMode && (
          <div
            aria-label="Legenda de status"
            className="flex flex-wrap gap-2 text-xs font-semibold"
          >
            {STATUS_LEGEND.map((status) => (
              <span
                key={status.label}
                className={cn('rounded-full px-2.5 py-[5px]', status.className)}
              >
                {status.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 font-medium text-[#5F5C6E]">
              <AgendaPresenceChip kind={PRESENCE_LEGEND.kind} isBordered />
              {PRESENCE_LEGEND.description}
            </span>
          </div>
        )}

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
  },
);

AgendaGridDesktopView.displayName = 'AgendaGridDesktopView';
