import type { ReactNode } from 'react';
import type { TSeriesResult } from '../../schedule-series-module.types';

export type TScheduleSeriesResultConfig = TSeriesResult & {
  /** Título do Dialog/Drawer que envolve o resultado. */
  title: ReactNode;
  onPickAnotherTime: (date: string) => void;
  onDone: () => void;
};
