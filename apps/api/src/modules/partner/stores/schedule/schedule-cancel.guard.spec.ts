import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ScheduleCancelGuard } from './schedule-cancel.guard';

const createContext = (request: Record<string, unknown>) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

const createRequest = () =>
  ({
    user: { sub: 'user-1' },
    params: { storeId: 'store-1', id: 'schedule-1' },
  }) as Record<string, unknown>;

const createGuard = ({
  member = null,
  isOwner = false,
  isCustomer = false,
}: {
  member?: { role: string } | null;
  isOwner?: boolean;
  isCustomer?: boolean;
}) => {
  const scheduleRepository = {
    exists: vi.fn().mockResolvedValue(isCustomer),
  };

  return {
    scheduleRepository,
    guard: new ScheduleCancelGuard(
      { findStoreMember: vi.fn().mockResolvedValue(member) } as never,
      { exists: vi.fn().mockResolvedValue(isOwner) } as never,
      scheduleRepository as never,
    ),
  };
};

describe('ScheduleCancelGuard', () => {
  it('allows the customer who booked, scoped to the URL store', async () => {
    const { guard, scheduleRepository } = createGuard({ isCustomer: true });

    await expect(
      guard.canActivate(createContext(createRequest())),
    ).resolves.toBe(true);
    expect(scheduleRepository.exists).toHaveBeenCalledWith({
      where: {
        id: 'schedule-1',
        store: { id: 'store-1' },
        user: { id: 'user-1' },
      },
    });
  });

  it('allows a store member', async () => {
    const { guard } = createGuard({ member: { role: 'professional' } });

    await expect(
      guard.canActivate(createContext(createRequest())),
    ).resolves.toBe(true);
  });

  it('allows the owner', async () => {
    const { guard } = createGuard({ isOwner: true });

    await expect(
      guard.canActivate(createContext(createRequest())),
    ).resolves.toBe(true);
  });

  it('rejects a user with no link to the store or the booking', async () => {
    const { guard } = createGuard({});

    await expect(
      guard.canActivate(createContext(createRequest())),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
