import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScheduleService } from './schedule.service';

describe('ScheduleService.findAvailability', () => {
  const find = vi.fn();
  let service: ScheduleService;

  beforeEach(() => {
    find.mockReset();
    service = new ScheduleService({ find } as never, {} as never);
  });

  it('queries slim availability fields for the store', async () => {
    const rows = [
      {
        id: 'sch-1',
        date: '2026-10-24',
        startTime: '10:00',
        endTime: '10:30',
        status: 'scheduled',
        storeMember: { id: 'mem-1' },
      },
    ];
    find.mockResolvedValue(rows);

    const result = await service.findAvailability('store-1');

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          store: { id: 'store-1' },
        }),
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
          storeMember: { id: true },
        },
        relations: ['storeMember'],
      }),
    );
    expect(result).toBe(rows);
  });
});
