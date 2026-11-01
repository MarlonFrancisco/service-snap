import type { useAgendaDayView } from './agenda-day-view.hook';

export type TDayViewHook = ReturnType<typeof useAgendaDayView>;

export interface IDayViewConfig {
  dayViewHook: TDayViewHook;
}
