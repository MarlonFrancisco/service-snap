import { getBlockStyle } from '../../agenda-grid.helpers';
import { AgendaAppointmentBlock } from '../agenda-appointment-block';
import { AgendaSlotButton } from '../agenda-slot-button';
import type { TAgendaColumnConfig } from './agenda-column.types';

export const AgendaColumn = ({
  column,
  slotHeight,
  showInitials,
  onAppointmentClick,
}: TAgendaColumnConfig) => (
  <div className="relative min-w-0 flex-1">
    {column.rows.map(({ time, slot }) => (
      <div
        key={time}
        className="flex justify-end border-b border-l border-[#F0EEF4] bg-white p-0.5"
        style={{ height: slotHeight }}
      >
        {slot && <AgendaSlotButton slot={slot} />}
      </div>
    ))}

    {column.blocks.map((block) => (
      <AgendaAppointmentBlock
        key={block.appointment.id}
        appointment={block.appointment}
        isCompact={block.isCompact}
        showInitials={showInitials}
        rowSpan={block.rowSpan}
        style={getBlockStyle(block, slotHeight)}
        onClick={onAppointmentClick}
      />
    ))}
  </div>
);
