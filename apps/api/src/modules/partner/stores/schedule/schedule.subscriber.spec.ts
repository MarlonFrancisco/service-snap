import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ScheduleSubscriber } from './schedule.subscriber';

const setup = (scheduleConfirmation: ReturnType<typeof vi.fn>) => {
  const createHistory = vi.fn().mockResolvedValue(undefined);
  const subscriber = new ScheduleSubscriber(
    { subscribers: [] } as never,
    { create: createHistory } as never,
    { scheduleConfirmation } as never,
    { get: vi.fn() } as never,
  );
  const event = {
    entity: { id: 'schedule-1' },
    manager: {
      findOne: vi.fn().mockResolvedValue({
        id: 'schedule-1',
        date: '2026-11-03',
        startTime: '09:30',
        store: { name: 'Loja' },
        user: { email: 'cliente@teste.com' },
      }),
    },
  };

  return { subscriber, event, createHistory };
};

describe('ScheduleSubscriber', () => {
  it('records the confirmation as sent', async () => {
    const { subscriber, event, createHistory } = setup(
      vi.fn().mockResolvedValue({}),
    );

    await subscriber.afterInsert(event as never);

    expect(createHistory.mock.calls[0][0].status).toBe('sent');
  });

  it('keeps the booking when the confirmation email fails', async () => {
    const { subscriber, event, createHistory } = setup(
      vi.fn().mockRejectedValue(new ServiceUnavailableException()),
    );

    await expect(
      subscriber.afterInsert(event as never),
    ).resolves.toBeUndefined();

    expect(createHistory.mock.calls[0][0].status).toBe('failed');
  });
});
