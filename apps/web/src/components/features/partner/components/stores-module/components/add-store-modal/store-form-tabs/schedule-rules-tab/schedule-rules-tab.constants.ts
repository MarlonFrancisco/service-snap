import {
  formatAdvanceLabel,
  formatDaysLabel,
  formatMinutesLabel,
} from './schedule-rules-tab.helpers';
import type { TScheduleRuleOption } from './schedule-rules-tab.types';

const toOptions = (
  values: readonly number[],
  format: (value: number) => string,
): readonly TScheduleRuleOption[] =>
  values.map((value) => ({ value, label: format(value) }));

/** Os mesmos passos que a API aceita em `slotIntervalMinutes`. */
export const SLOT_INTERVAL_OPTIONS = toOptions(
  [5, 10, 15, 20, 30, 45, 60, 90, 120],
  formatMinutesLabel,
);

/** Em minutos: sem mínimo, 30 min, 1 h, 2 h, 4 h, 12 h, 24 h e 48 h. */
export const MIN_ADVANCE_OPTIONS = toOptions(
  [0, 30, 60, 120, 240, 720, 1440, 2880],
  formatAdvanceLabel,
);

/** 0 é sem limite e fica por último, como no desenho. */
export const MAX_ADVANCE_DAYS_OPTIONS = toOptions(
  [7, 14, 30, 60, 90, 180, 0],
  formatDaysLabel,
);
