import { describe, expect, it } from 'vitest';
import {
  addMinutesToTime,
  buildSchedulePayload,
  getBookingTotals,
  getLocalDateKey,
  getServiceIdsByQuantity,
  splitServicesByProfessional,
} from './booking.helpers';
import { TBookingFormData } from './booking.schema';

type TService = TBookingFormData['selectedServices'][number];

const makeService = (id: string, overrides: Partial<TService> = {}) =>
  ({
    id,
    name: id,
    description: '',
    price: 50,
    duration: 30,
    quantity: 1,
    ...overrides,
  }) as TService;

const DATE = new Date(2026, 10, 3);

describe('getBookingTotals', () => {
  it('multiplies price and duration by quantity', () => {
    const totals = getBookingTotals([
      makeService('a', { price: 50, duration: 30, quantity: 2 }),
      makeService('b', { price: 20, duration: 15 }),
    ]);

    expect(totals).toEqual({ totalPrice: 120, totalDuration: 75 });
  });
});

describe('addMinutesToTime', () => {
  it('crosses the hour', () => {
    expect(addMinutesToTime('09:45', 30)).toBe('10:15');
  });
});

describe('getLocalDateKey', () => {
  it('keeps the local day late in the evening', () => {
    expect(getLocalDateKey(new Date(2026, 10, 3, 23, 30))).toBe('2026-11-03');
  });
});

describe('splitServicesByProfessional', () => {
  it('separates services the professional cannot perform', () => {
    const a = makeService('a');
    const b = makeService('b');

    expect(
      splitServicesByProfessional([a, b], { services: [{ id: 'a' }] }),
    ).toEqual({ performable: [a], unavailable: [b] });
  });
});

describe('getServiceIdsByQuantity', () => {
  it('repeats the id once per unit', () => {
    expect(
      getServiceIdsByQuantity([
        makeService('a', { quantity: 2 }),
        makeService('b'),
      ]),
    ).toEqual(['a', 'a', 'b']);
  });
});

describe('buildSchedulePayload', () => {
  const payload = buildSchedulePayload({
    services: [
      makeService('a', { duration: 30, quantity: 2 }),
      makeService('b', { duration: 15 }),
    ],
    date: DATE,
    startTime: '10:00',
    professionalId: 'p1',
  });

  it('ends after the total duration instead of at the start time', () => {
    expect(payload.startTime).toBe('10:00');
    expect(payload.endTime).toBe('11:15');
  });

  it('sends one service item per unit of quantity', () => {
    expect(payload.services.map((service) => service.id)).toEqual([
      'a',
      'a',
      'b',
    ]);
  });

  it('sends the resolved professional and the local date', () => {
    expect(payload.storeMember).toEqual({ id: 'p1' });
    expect(payload.date).toBe('2026-11-03');
  });
});
