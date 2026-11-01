import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { StoreAccessGuard } from './store-access.guard';

const createContext = (request: Record<string, unknown>) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

const createRequest = () =>
  ({
    user: { sub: 'user-1' },
    params: { storeId: 'store-1' },
  }) as Record<string, unknown>;

const createGuard = ({
  member = null,
  isOwner = false,
}: {
  member?: { role: string } | null;
  isOwner?: boolean;
}) =>
  new StoreAccessGuard(
    { findStoreMember: vi.fn().mockResolvedValue(member) } as never,
    { exists: vi.fn().mockResolvedValue(isOwner) } as never,
  );

describe('StoreAccessGuard', () => {
  it('allows a store member', async () => {
    const request = createRequest();
    const guard = createGuard({ member: { role: 'manager' } });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.storeMemberRole).toBe('manager');
  });

  it('allows the owner even when not a member', async () => {
    const request = createRequest();
    const guard = createGuard({ isOwner: true });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.storeMemberRole).toBe('owner');
  });

  it('rejects a user who is neither member nor owner', async () => {
    const guard = createGuard({});

    await expect(
      guard.canActivate(createContext(createRequest())),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
