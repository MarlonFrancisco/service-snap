import type { TAgendaTimeColumnConfig } from './agenda-time-column.types';

export const AgendaTimeColumn = ({
  timeSlots,
  slotHeight,
  headerHeight,
}: TAgendaTimeColumnConfig) => (
  <div className="sticky left-0 z-[35] bg-white">
    <div
      aria-hidden="true"
      className="sticky top-0 z-10 border-b border-[#EBE9F0] bg-[#F7F6FA]"
      style={{ height: headerHeight }}
    />
    {timeSlots.map((time) => (
      <div
        key={time}
        className="border-b border-[#F0EEF4] p-1.5 text-right text-xs text-[#5F5C6E]"
        style={{ height: slotHeight }}
      >
        {time}
      </div>
    ))}
  </div>
);
