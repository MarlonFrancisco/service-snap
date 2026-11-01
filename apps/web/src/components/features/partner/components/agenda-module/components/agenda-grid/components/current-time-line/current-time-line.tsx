import { memo } from 'react';
import { useCurrentTimeLine } from './current-time-line.hook';
import type { TCurrentTimeLineConfig } from './current-time-line.types';

/**
 * Linha que indica o horário atual na agenda.
 */
export const CurrentTimeLine = memo((config: TCurrentTimeLineConfig) => {
  const { topPosition, isVisible, currentTime } = useCurrentTimeLine(config);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="img"
      className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-[#B42318]"
      style={{ top: topPosition }}
      aria-label={`Horário atual: ${currentTime}`}
    >
      <span className="absolute top-[-11px] right-1.5 rounded-full bg-[#B42318] px-[7px] py-px text-[11px] font-bold text-white">
        {currentTime}
      </span>
    </div>
  );
});

CurrentTimeLine.displayName = 'CurrentTimeLine';
