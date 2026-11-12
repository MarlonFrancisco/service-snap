import { ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScheduleService } from './schedule.service';

const STORE_ID = '6f1d7c1a-0f3e-4b57-9f3a-1c2d3e4f5a6b';
const SERVICE_ID = '7a2e8d2b-1f4e-4c68-8a4b-2d3e4f5a6b7c';

const makeService = () => {
  const manager = {
    findOne: vi.fn().mockResolvedValue({ id: 'm1' }),
    find: vi.fn().mockResolvedValue([]),
    save: vi.fn(async (_entity, rows) =>
      rows.map((row: object, index: number) => ({ ...row, id: `s${index}` })),
    ),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
    transaction: vi.fn(async (callback) => callback(manager)),
  };
  const scheduleRepository = { manager, find: vi.fn().mockResolvedValue([]) };
  const storeRepository = {
    findOne: vi.fn().mockResolvedValue({
      openTime: '09:00',
      closeTime: '11:00',
      timezone: 'America/Sao_Paulo',
    }),
  };
  const serviceRepository = {
    find: vi.fn().mockResolvedValue([{ id: SERVICE_ID, duration: 30 }]),
  };
  const storeMemberRepository = {
    exists: vi.fn().mockResolvedValue(true),
    find: vi.fn().mockResolvedValue([
      {
        id: 'partial',
        services: [],
      },
      {
        id: 'deleted',
        isDeleted: true,
        services: [{ id: SERVICE_ID }],
      },
      {
        id: 'eligible',
        services: [{ id: SERVICE_ID }],
      },
    ]),
  };
  const blockedTimeRepository = { find: vi.fn().mockResolvedValue([]) };
  const usersService = { upsert: vi.fn().mockResolvedValue({ id: 'u1' }) };
  const notifications = {
    notifyBookingCreated: vi.fn(),
    notifyUpdate: vi.fn(),
    load: vi.fn().mockResolvedValue({
      id: 'sch1',
      status: 'scheduled',
      store: { id: STORE_ID, openTime: '09:00', closeTime: '18:00' },
      service: { id: SERVICE_ID, duration: 45 },
      storeMember: { id: 'm1' },
    }),
  };

  const service = new ScheduleService(
    scheduleRepository as never,
    storeRepository as never,
    serviceRepository as never,
    storeMemberRepository as never,
    blockedTimeRepository as never,
    usersService as never,
    notifications as never,
    { isHoliday: vi.fn().mockResolvedValue(false) } as never,
  );

  return {
    service,
    manager,
    notifications,
    scheduleRepository,
    storeMemberRepository,
    usersService,
    serviceRepository,
    storeRepository,
  };
};

// Data futura: reserva de cliente só entra em horário que a loja ofereceria
const DTO = {
  date: '2099-11-10',
  startTime: '10:00',
  endTime: '10:30',
  store: { id: STORE_ID },
  storeMember: { id: 'm1' },
  services: [{ id: SERVICE_ID, duration: 30 }],
  user: { email: 'ana@example.com' },
} as never;

describe('ScheduleService with a store still in onboarding', () => {
  const DRAFT = {
    openTime: '09:00',
    closeTime: '11:00',
    timezone: 'America/Sao_Paulo',
    onboarding: { completedAt: null },
  };

  it('does not offer availability', async () => {
    const ctx = makeService();
    ctx.storeRepository.findOne.mockResolvedValue(DRAFT);

    await expect(
      ctx.service.getAvailability(STORE_ID, {
        date: '2026-11-10',
        serviceIds: SERVICE_ID,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('does not accept a booking', async () => {
    const ctx = makeService();
    ctx.storeRepository.findOne.mockResolvedValue(DRAFT);

    await expect(
      ctx.service.create({
        ...(DTO as object),
        store: { id: STORE_ID },
      } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(ctx.manager.save).not.toHaveBeenCalled();
  });
});

describe('ScheduleService.create', () => {
  let ctx: ReturnType<typeof makeService>;

  beforeEach(() => {
    ctx = makeService();
  });

  it('rejects an overlap without touching the user or saving', async () => {
    ctx.manager.find.mockResolvedValue([
      { startTime: '10:15', endTime: '10:45', status: 'scheduled' },
    ]);

    await expect(ctx.service.create(DTO)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(ctx.usersService.upsert).not.toHaveBeenCalled();
    expect(ctx.manager.save).not.toHaveBeenCalled();
  });

  it('locks the professional before checking the agenda', async () => {
    await ctx.service.create(DTO);

    expect(ctx.manager.findOne.mock.calls[0]![1]).toMatchObject({
      where: { id: 'm1' },
      lock: { mode: 'pessimistic_write' },
    });
    expect(ctx.manager.findOne.mock.invocationCallOrder[0]!).toBeLessThan(
      ctx.manager.find.mock.invocationCallOrder[0]!,
    );
  });

  it('saves one row per service with the upserted user', async () => {
    await ctx.service.create({
      ...(DTO as object),
      services: [
        { id: SERVICE_ID, duration: 30 },
        { id: SERVICE_ID, duration: 30 },
      ],
    } as never);

    const rows = ctx.manager.save.mock.calls[0]![1];
    expect(rows.map((row: { endTime: string }) => row.endTime)).toEqual([
      '10:30',
      '11:00',
    ]);
    expect(rows[0].user).toEqual({ id: 'u1' });
  });
});

describe('ScheduleService.getAvailability', () => {
  it('sums repeated services and skips ineligible members', async () => {
    const { service } = makeService();

    const slots = await service.getAvailability(STORE_ID, {
      date: '2099-11-10',
      serviceIds: `${SERVICE_ID},${SERVICE_ID}`,
    });

    expect(slots.map((slot) => [slot.time, slot.storeMemberId])).toEqual([
      ['09:00', 'eligible'],
      ['09:30', 'eligible'],
      ['10:00', 'eligible'],
      ['10:30', null],
    ]);
  });

  it('rejects malformed service ids', async () => {
    const { service } = makeService();

    await expect(
      service.getAvailability(STORE_ID, {
        date: '2099-11-10',
        serviceIds: 'abc',
      }),
    ).rejects.toThrow('serviceIds');
  });

  it('rejects a service from another store', async () => {
    const { service, serviceRepository } = makeService();
    serviceRepository.find.mockResolvedValue([]);

    await expect(
      service.getAvailability(STORE_ID, {
        date: '2099-11-10',
        serviceIds: SERVICE_ID,
      }),
    ).rejects.toThrow('Service not found');
  });

  it('fails when the store does not exist', async () => {
    const { service, storeRepository } = makeService();
    storeRepository.findOne.mockResolvedValue(null);

    await expect(
      service.getAvailability(STORE_ID, {
        date: '2099-11-10',
        serviceIds: SERVICE_ID,
      }),
    ).rejects.toThrow('Store not found');
  });
});

describe('ScheduleService.reschedule', () => {
  let ctx: ReturnType<typeof makeService>;
  const MOVE = { date: '2099-11-12', startTime: '14:00', storeMemberId: 'm2' };

  beforeEach(() => {
    ctx = makeService();
  });

  it('moves the appointment keeping the service duration and notifies', async () => {
    await ctx.service.reschedule(STORE_ID, 'sch1', MOVE);

    expect(ctx.manager.findOne.mock.calls[0]![1]).toMatchObject({
      where: { id: 'm2' },
      lock: { mode: 'pessimistic_write' },
    });
    expect(ctx.manager.update).toHaveBeenCalledWith(
      expect.anything(),
      { id: 'sch1' },
      {
        date: '2099-11-12',
        startTime: '14:00',
        endTime: '14:45',
        storeMember: { id: 'm2' },
      },
    );
    expect(ctx.notifications.notifyUpdate).toHaveBeenCalledTimes(1);
  });

  it('does not count the appointment itself as a conflict', async () => {
    await ctx.service.reschedule(STORE_ID, 'sch1', MOVE);

    const where = ctx.manager.find.mock.calls[0]![1].where;
    expect(where.id).toMatchObject({ _type: 'not', _value: 'sch1' });
  });

  it('rejects an overlap with another appointment', async () => {
    ctx.manager.find.mockResolvedValue([
      { startTime: '14:30', endTime: '15:00', status: 'scheduled' },
    ]);

    await expect(
      ctx.service.reschedule(STORE_ID, 'sch1', MOVE),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(ctx.manager.update).not.toHaveBeenCalled();
  });

  it('refuses an appointment from another store or already cancelled', async () => {
    ctx.notifications.load.mockResolvedValueOnce({
      id: 'sch1',
      status: 'scheduled',
      store: { id: 'other' },
    });
    await expect(
      ctx.service.reschedule(STORE_ID, 'sch1', MOVE),
    ).rejects.toBeInstanceOf(NotFoundException);

    ctx.notifications.load.mockResolvedValueOnce({
      id: 'sch1',
      status: 'cancelled',
      store: { id: STORE_ID },
    });
    await expect(
      ctx.service.reschedule(STORE_ID, 'sch1', MOVE),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(ctx.manager.update).not.toHaveBeenCalled();
  });

  it('refuses a professional from another store', async () => {
    ctx.storeMemberRepository.exists.mockResolvedValue(false);

    await expect(
      ctx.service.reschedule(STORE_ID, 'sch1', MOVE),
    ).rejects.toThrow('Professional not found');
  });
});

describe('ScheduleService.findUpcomingForCustomer', () => {
  it('looks up by the normalized phone, only future scheduled ones', async () => {
    const { service, scheduleRepository } = makeService();

    await service.findUpcomingForCustomer(
      STORE_ID,
      '5511900000000',
      '2026-11-03',
    );

    const { where } = scheduleRepository.find.mock.calls[0]![0];
    expect(where).toMatchObject({
      store: { id: STORE_ID },
      user: { telephone: '+5511900000000' },
      status: 'scheduled',
    });
    expect(where.date).toMatchObject({
      _type: 'moreThanOrEqual',
      _value: '2026-11-03',
    });
  });

  it('returns nothing without a phone instead of an unfiltered search', async () => {
    const { service, scheduleRepository } = makeService();

    await expect(
      service.findUpcomingForCustomer(STORE_ID, '', '2026-11-03'),
    ).resolves.toEqual([]);
    expect(scheduleRepository.find).not.toHaveBeenCalled();
  });
});
