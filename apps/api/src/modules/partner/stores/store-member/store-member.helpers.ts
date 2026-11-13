import { BadRequestException } from '@nestjs/common';
import {
  timeToMinutes,
  WEEK_DAYS,
} from '../../../../utils/helpers/schedule.helpers';
import type {
  TDayHours,
  TWeekDay,
  TWorkingHours,
} from '../../../../utils/helpers/schedule.types';

const assertValidDay = (weekDay: TWeekDay, hours: TDayHours) => {
  const open = timeToMinutes(hours.openTime);
  const close = timeToMinutes(hours.closeTime);
  const hasLunch = !!hours.lunchStartTime && !!hours.lunchEndTime;
  const lunchStart = hasLunch ? timeToMinutes(hours.lunchStartTime) : null;
  const lunchEnd = hasLunch ? timeToMinutes(hours.lunchEndTime) : null;

  if (close <= open) {
    throw new BadRequestException(`${weekDay}: closeTime must be after openTime`);
  }

  if (
    hasLunch &&
    (lunchEnd <= lunchStart || lunchStart < open || lunchEnd > close)
  ) {
    throw new BadRequestException(
      `${weekDay}: lunch must be inside the working hours`,
    );
  }
};

/**
 * Guarda só os dias enviados: um dia ausente segue a loja e `null` é folga. O
 * DTO, como instância de classe, traz os sete dias como `undefined`, e um `in`
 * leria todos como folga. Objeto vazio vira `null` (segue a loja inteira).
 */
export function normalizeWorkingHours(
  input: TWorkingHours | null | undefined,
): TWorkingHours | null {
  if (!input) return null;

  const hours: TWorkingHours = {};

  WEEK_DAYS.forEach((weekDay) => {
    const day = input[weekDay];

    if (day === undefined) return;
    if (day === null) {
      hours[weekDay] = null;
      return;
    }

    const normalized: TDayHours = {
      openTime: day.openTime,
      closeTime: day.closeTime,
      lunchStartTime: day.lunchStartTime || null,
      lunchEndTime: day.lunchEndTime || null,
    };

    assertValidDay(weekDay, normalized);
    hours[weekDay] = normalized;
  });

  return Object.keys(hours).length ? hours : null;
}
