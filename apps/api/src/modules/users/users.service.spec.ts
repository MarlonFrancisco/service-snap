import { describe, expect, it, vi } from 'vitest';
import { UsersService } from './users.service';

type TStoredUser = { id: string; telephone?: string; email?: string };

const makeService = (users: TStoredUser[]) => {
  const userRepository = {
    findOne: vi.fn(async ({ where }) => {
      if (where.telephone) {
        return users.find((u) => u.telephone === where.telephone) ?? null;
      }
      if (!where.email) return null;
      // ILike(padrão): compara sem caixa, com `\` antes de `%` e `_`
      const pattern = String(where.email.value).replace(/\\(.)/g, '$1');
      return (
        users.find((u) => u.email?.toLowerCase() === pattern.toLowerCase()) ??
        null
      );
    }),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
    create: vi.fn((data) => data),
    save: vi.fn(async (data) => ({ id: 'new', ...data })),
  };
  const stripeService = {
    customers: {
      create: vi.fn().mockResolvedValue({ id: 'cus_1' }),
      update: vi.fn().mockResolvedValue({}),
    },
  };
  const service = new UsersService(
    userRepository as never,
    stripeService as never,
    {} as never,
    {} as never,
  );
  vi.spyOn(service, 'findById').mockResolvedValue({ id: 'x' } as never);

  return { service, userRepository };
};

const LINK = { telephone: '5511900000000', email: 'Ana@Gmail.com' };

describe('UsersService.linkVerifiedEmail', () => {
  it('adds the e-mail to the customer of that phone', async () => {
    const { service, userRepository } = makeService([
      { id: 'phone', telephone: '+5511900000000' },
    ]);

    await expect(service.linkVerifiedEmail(LINK)).resolves.toBe('linked');
    expect(userRepository.update).toHaveBeenCalledWith('phone', {
      email: 'ana@gmail.com',
    });
  });

  it('adds the phone to an account that has the e-mail but no phone', async () => {
    const { service, userRepository } = makeService([
      { id: 'email', email: 'ana@gmail.com' },
    ]);

    await expect(service.linkVerifiedEmail(LINK)).resolves.toBe('linked');
    expect(userRepository.update).toHaveBeenCalledWith('email', {
      telephone: '+5511900000000',
    });
  });

  it('creates the customer with both when neither exists', async () => {
    const { service, userRepository } = makeService([]);

    await expect(
      service.linkVerifiedEmail({ ...LINK, firstName: 'Ana' }),
    ).resolves.toBe('linked');
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        telephone: '+5511900000000',
        email: 'ana@gmail.com',
        firstName: 'Ana',
      }),
    );
  });

  it('does not merge two different accounts', async () => {
    const { service, userRepository } = makeService([
      { id: 'phone', telephone: '+5511900000000' },
      { id: 'email', email: 'ana@gmail.com', telephone: '+5521988887777' },
    ]);

    await expect(service.linkVerifiedEmail(LINK)).resolves.toBe('conflict');
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('does not take over an account with the e-mail and another phone', async () => {
    const { service, userRepository } = makeService([
      { id: 'email', email: 'ana@gmail.com', telephone: '+5521988887777' },
    ]);

    await expect(service.linkVerifiedEmail(LINK)).resolves.toBe('conflict');
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('escapes LIKE wildcards in the e-mail', async () => {
    const { service, userRepository } = makeService([]);

    await service.linkVerifiedEmail({ ...LINK, email: 'a_b%c@x.com' });

    const emailQuery = userRepository.findOne.mock.calls.find(
      ([{ where }]) => where.email,
    )![0];
    expect(emailQuery.where.email.value).toBe('a\\_b\\%c@x.com');
  });
});
