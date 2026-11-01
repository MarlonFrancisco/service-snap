import { useEffect, useState } from 'react';
import type {
  TCurrentTimeLineConfig,
  TCurrentTimeLinePosition,
} from './current-time-line.types';

const SLOT_DURATION_MINUTES = 30;

const timeToMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Hook para calcular a posição da linha de horário atual
 * Atualiza a cada minuto
 */
export function useCurrentTimeLine({
  timeSlots,
  slotHeight,
  headerHeight,
}: TCurrentTimeLineConfig): TCurrentTimeLinePosition {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const currentMinutes = timeToMinutes(currentTime);
  const slotMinutes = timeSlots.map(timeToMinutes);
  const slotIndex =
    slotMinutes.filter((minutes) => minutes <= currentMinutes).length - 1;
  const lastSlotMinutes = slotMinutes.at(-1);

  if (
    slotIndex < 0 ||
    lastSlotMinutes === undefined ||
    currentMinutes > lastSlotMinutes
  ) {
    return { topPosition: 0, isVisible: false, currentTime };
  }

  // No almoço não há linha na grade: a marca para no fim do último slot da manhã.
  const progressInSlot = Math.min(
    (currentMinutes - (slotMinutes[slotIndex] ?? 0)) / SLOT_DURATION_MINUTES,
    1,
  );

  return {
    topPosition: headerHeight + (slotIndex + progressInSlot) * slotHeight,
    isVisible: true,
    currentTime,
  };
}
