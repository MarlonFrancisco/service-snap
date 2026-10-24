import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScheduleService } from './schedule.service';

describe('ScheduleService.findAvailability', () => {
  const find = vi.fn();
  let service: ScheduleService;

  beforeEach(() => {
    find.mockReset();
    service = new ScheduleService(
      { find } as never,
      {} as never,
    );
  });

  it('returns slim rows without customer PII', async () => {
    find.mockResolvedValue([
      {
        id: 'sch-1',
        date: '2026-10-24',
        startTime: '10:00',
        endTime: '10:30',
        status: 'scheduled',
        storeMember: { id: 'mem-1', user: { firstName: 'Ada' } },
        user: { email: 'secret@example.com' },
      },
    ]);

    const result = await service.findAvailability('store-1');

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          store: { id: 'store-1' },
        }),
        relations: ['storeMember'],
      }),
    );
    expect(result).toEqual([
      {
        id: 'sch-1',
        date: '2026-10-24',
        startTime: '10:00',
        endTime: '10:30',
        status: 'scheduled',
        storeMember: { id: 'mem-1' },
      },
    ]);
    expect(JSON.stringify(result)).not.toContain('secret@example.com');
    expect(JSON.stringify(result)).not.toContain('Ada');
  });
});
