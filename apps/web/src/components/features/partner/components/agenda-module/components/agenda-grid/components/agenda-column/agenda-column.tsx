import { cn } from '@repo/ui';
import { getBlockStyle, getBlockedBlockStyle } from '../../agenda-grid.helpers';
import { AgendaAppointmentBlock } from '../agenda-appointment-block';
import { AgendaBlockedBlock } from '../agenda-blocked-block';
import { AgendaClosedNotice } from '../agenda-closed-notice';
import { AgendaSlotButton } from '../agenda-slot-button';
import type { TAgendaColumnConfig } from './agenda-column.types';

export const AgendaColumn = ({
  column,
  slotHeight,
  showInitials,
  drag,
  onAppointmentClick,
  onBlockedClick,
}: TAgendaColumnConfig) => {
  const { closedNotice } = column;

  return (
    <div className="relative min-w-0 flex-1">
      {column.rows.map(({ time, slot }) => {
        const dropTarget = slot?.dropTarget;
        const isDropActive =
          !!dropTarget && drag.activeDropKey === dropTarget.key;

        return (
          <div
            key={time}
            className={cn(
              'flex justify-end border-b border-l border-[#F0EEF4] p-0.5',
              closedNotice ? 'bg-[#F7F6FA]' : 'bg-white',
            )}
            style={{ height: slotHeight }}
            onDragOver={
              dropTarget
                ? (event) => drag.handleRowDragOver(dropTarget, event)
                : undefined
            }
            onDragLeave={
              dropTarget
                ? (event) => drag.handleRowDragLeave(dropTarget, event)
                : undefined
            }
            onDrop={
              dropTarget
                ? (event) => drag.handleRowDrop(dropTarget, event)
                : undefined
            }
          >
            {isDropActive ? (
              <span className="flex h-full w-full items-center justify-center rounded-[9px] bg-[#F6ECFE] text-xs font-bold text-[#0B0B0F] outline-2 -outline-offset-2 outline-[#9810FA] outline-dashed">
                Soltar aqui
              </span>
            ) : (
              slot && <AgendaSlotButton slot={slot} />
            )}
          </div>
        );
      })}

      {closedNotice && <AgendaClosedNotice notice={closedNotice} />}

      {column.blockedBlocks.map((block) => (
        <AgendaBlockedBlock
          key={block.blockedTime.id}
          block={block}
          style={getBlockedBlockStyle(block, slotHeight)}
          onClick={onBlockedClick}
        />
      ))}

      {column.blocks.map((block) => (
        <AgendaAppointmentBlock
          key={block.appointment.id}
          appointment={block.appointment}
          isCompact={block.isCompact}
          showInitials={showInitials}
          rowSpan={block.rowSpan}
          presence={block.presence}
          style={getBlockStyle(block, slotHeight)}
          isDraggable={drag.canDrag(block.appointment)}
          isMoving={drag.movingVisitId === block.appointment.id}
          onClick={onAppointmentClick}
          onDragStart={drag.handleBlockDragStart}
          onDragEnd={drag.handleBlockDragEnd}
        />
      ))}
    </div>
  );
};
