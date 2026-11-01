import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { StoreRoleGuard } from './store-role.guard';

const createContext = (request: Record<string, unknown>) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
  }) as unknown as ExecutionContext;

const createRequest = () =>
  ({
    user: { sub: 'user-1' },
    params: { storeId: 'store-1' },
  }) as Record<string, unknown>;

const createGuard = ({
  member = null,
  isOwner = false,
  roles = ['owner', 'manager'],
}: {
  member?: { role: string } | null;
  isOwner?: boolean;
  roles?: string[];
}) =>
  new StoreRoleGuard(
    { findStoreMember: vi.fn().mockResolvedValue(member) } as never,
    { getAllAndOverride: vi.fn().mockReturnValue(roles) } as never,
    { exists: vi.fn().mockResolvedValue(isOwner) } as never,
  );

describe('StoreRoleGuard', () => {
  it('allows a member whose role is required', async () => {
    const request = createRequest();
    const guard = createGuard({ member: { role: 'manager' } });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.storeMemberRole).toBe('manager');
  });

  it('rejects a member whose role is not required', async () => {
    const guard = createGuard({ member: { role: 'professional' } });

    await expect(
      guard.canActivate(createContext(createRequest())),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows the owner even when not a member', async () => {
    const request = createRequest();
    const guard = createGuard({ isOwner: true });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.storeMemberRole).toBe('owner');
  });

  it('allows the owner registered as a professional', async () => {
    const request = createRequest();
    const guard = createGuard({
      member: { role: 'professional' },
      isOwner: true,
    });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.storeMemberRole).toBe('owner');
  });

  it('does not let the owner through when the route excludes owners', async () => {
    const guard = createGuard({ isOwner: true, roles: ['manager'] });

    await expect(
      guard.canActivate(createContext(createRequest())),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a user with no link to the store', async () => {
    const guard = createGuard({});

    await expect(
      guard.canActivate(createContext(createRequest())),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
