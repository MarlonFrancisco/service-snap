import { describe, expect, it } from 'vitest';
import {
  buildAvailabilitySlots,
  filterAvailableTimeSlots,
  hasScheduleConflict,
  toDateKey,
} from './schedule.helpers';

const DATE = '2026-11-10'; // terça-feira
const NOW = new Date('2026-11-01T12:00:00Z');

const STORE = {
  openTime: '09:00',
  closeTime: '12:00',
  timezone: 'America/Sao_Paulo',
};

const makeSchedule = (
  startTime: string,
  endTime: string,
  status = 'scheduled',
) => ({ date: DATE, startTime, endTime, status }) as never;

const member = (id: string, overrides = {}) => ({
  id,
  schedules: [],
  blockedTimes: [],
  ...overrides,
});

const build = (overrides = {}) =>
  buildAvailabilitySlots({
    store: STORE,
    date: DATE,
    durationMinutes: 30,
    members: [member('m1')],
    now: NOW,
    ...overrides,
  });

const freeTimes = (slots: { time: string; available: boolean }[]) =>
  slots.filter((slot) => slot.available).map((slot) => slot.time);

describe('buildAvailabilitySlots', () => {
  it('does not offer the closing time', () => {
    expect(build().map((slot) => slot.time)).toEqual([
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
    ]);
  });

  it('marks slots whose service would end after closing as unavailable', () => {
    expect(freeTimes(build({ durationMinutes: 90 }))).toEqual([
      '09:00',
      '09:30',
      '10:00',
      '10:30',
    ]);
  });

  it('marks slots that would cross lunch as unavailable', () => {
    const slots = build({
      store: { ...STORE, lunchStartTime: '10:00', lunchEndTime: '11:00' },
      durationMinutes: 60,
    });

    expect(slots.map((slot) => slot.time)).not.toContain('10:00');
    expect(freeTimes(slots)).toEqual(['09:00', '11:00']);
  });

  it('checks the whole service against existing schedules', () => {
    const slots = build({
      durationMinutes: 60,
      members: [member('m1', { schedules: [makeSchedule('10:00', '10:30')] })],
    });

    expect(freeTimes(slots)).toEqual(['09:00', '10:30', '11:00']);
  });

  it('ignores cancelled schedules', () => {
    const slots = build({
      members: [
        member('m1', {
          schedules: [makeSchedule('09:00', '12:00', 'cancelled')],
        }),
      ],
    });

    expect(freeTimes(slots)).toContain('09:00');
  });

  it('respects recurring blocks on the same weekday', () => {
    const slots = build({
      members: [
        member('m1', {
          blockedTimes: [{ isRecurring: true, dayOfWeek: 2, time: '09:00' }],
        }),
      ],
    });

    expect(freeTimes(slots)).not.toContain('09:00');
    expect(freeTimes(slots)).toContain('09:30');
  });

  it('assigns the first free member of each slot', () => {
    const slots = build({
      members: [
        member('m1', { schedules: [makeSchedule('09:00', '09:30')] }),
        member('m2'),
      ],
    });

    expect(slots[0]).toEqual({
      time: '09:00',
      available: true,
      storeMemberId: 'm2',
    });
    expect(slots[1]!.storeMemberId).toBe('m1');
  });

  it('marks every slot unavailable when no member is eligible', () => {
    expect(freeTimes(build({ members: [] }))).toEqual([]);
  });

  it('returns nothing on a closed day', () => {
    const store = { ...STORE, businessDays: { tuesday: false } };

    expect(build({ store })).toEqual([]);
  });

  it('returns nothing for a past date', () => {
    expect(build({ date: '2026-10-31' })).toEqual([]);
  });

  it('hides past times today using the store timezone', () => {
    // 13:15 em UTC são 10:15 em São Paulo
    const slots = build({
      date: '2026-11-10',
      now: new Date('2026-11-10T13:15:00Z'),
    });

    expect(freeTimes(slots)).toEqual(['10:30', '11:00', '11:30']);
  });
});

describe('filterAvailableTimeSlots', () => {
  it('keeps checking only the slot start without a duration', () => {
    const free = filterAvailableTimeSlots(
      ['09:00', '09:30'],
      new Date(`${DATE}T12:00:00Z`),
      [],
      [makeSchedule('09:30', '10:00')],
    );

    expect(free).toEqual(['09:00']);
  });
});

describe('hasScheduleConflict', () => {
  const existing = [makeSchedule('10:00', '11:00')];

  it('detects an overlap with any new item', () => {
    expect(
      hasScheduleConflict(existing, [
        { startTime: '09:00', endTime: '09:30' },
        { startTime: '09:30', endTime: '10:30' },
      ]),
    ).toBe(true);
  });

  it('allows items that only touch the existing schedule', () => {
    expect(
      hasScheduleConflict(existing, [
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '11:00', endTime: '11:30' },
      ]),
    ).toBe(false);
  });

  it('ignores cancelled schedules', () => {
    expect(
      hasScheduleConflict(
        [makeSchedule('10:00', '11:00', 'cancelled')],
        [{ startTime: '10:00', endTime: '11:00' }],
      ),
    ).toBe(false);
  });
});

describe('toDateKey', () => {
  it('keeps a date string', () => {
    expect(toDateKey('2026-11-10')).toBe('2026-11-10');
  });

  it('uses the local day of a Date', () => {
    expect(toDateKey(new Date(2026, 10, 10, 23, 30))).toBe('2026-11-10');
  });
});
