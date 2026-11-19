import type { TAgendaTimeColumnConfig } from './agenda-time-column.types';

export const AgendaTimeColumn = ({
  timeSlots,
  slotHeight,
  headerHeight,
}: TAgendaTimeColumnConfig) => (
  <div className="sticky left-0 z-[35] bg-white">
    <div
      aria-hidden="true"
      className="sticky top-0 z-10 border-b border-line bg-surface"
      style={{ height: headerHeight }}
    />
    {timeSlots.map((time) => (
      <div
        key={time}
        className="border-b border-surface-3 p-1.5 text-right text-xs text-ink-muted"
        style={{ height: slotHeight }}
      >
        {time}
      </div>
    ))}
  </div>
);
