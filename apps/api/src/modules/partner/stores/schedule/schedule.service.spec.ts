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

  const service = new ScheduleService(
    scheduleRepository as never,
    storeRepository as never,
    serviceRepository as never,
    storeMemberRepository as never,
    blockedTimeRepository as never,
    usersService as never,
  );

  return { service, manager, usersService, serviceRepository, storeRepository };
};

const DTO = {
  date: '2026-11-10',
  startTime: '10:00',
  endTime: '10:30',
  storeMember: { id: 'm1' },
  services: [{ id: 'a', duration: 30 }],
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
        { id: 'a', duration: 30 },
        { id: 'a', duration: 30 },
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
