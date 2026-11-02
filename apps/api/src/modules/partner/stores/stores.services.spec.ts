import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoresService } from './stores.services';

const STORE_ID = 'store-1';

const makeService = () => {
  const storesRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
  };
  const storeSearchSync = { sync: vi.fn(), remove: vi.fn() };

  const service = new StoresService(
    storesRepository as never,
    storeSearchSync as never,
  );

  return { service, storesRepository, storeSearchSync };
};

describe('StoresService', () => {
  let ctx: ReturnType<typeof makeService>;

  beforeEach(() => {
    ctx = makeService();
  });

  describe('findOnePublic', () => {
    it('hides a store still in onboarding', async () => {
      ctx.storesRepository.findOne.mockResolvedValue({
        id: STORE_ID,
        onboarding: { completedAt: null },
      });

      await expect(
        ctx.service.findOnePublic(STORE_ID, []),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns a finished store without its onboarding data', async () => {
      ctx.storesRepository.findOne.mockResolvedValue({
        id: STORE_ID,
        onboarding: { completedAt: new Date(), linkSharedAt: new Date() },
      });

      await expect(ctx.service.findOnePublic(STORE_ID, [])).resolves.toEqual({
        id: STORE_ID,
      });
    });

    it('keeps serving older stores, which have no onboarding row', async () => {
      ctx.storesRepository.findOne.mockResolvedValue({
        id: STORE_ID,
        isActive: false,
        onboarding: null,
      });

      await expect(
        ctx.service.findOnePublic(STORE_ID, []),
      ).resolves.toMatchObject({ id: STORE_ID });
    });
  });

  describe('update', () => {
    it('does not let the store editor publish a draft', async () => {
      ctx.storesRepository.findOne.mockResolvedValue({
        id: STORE_ID,
        onboarding: { completedAt: null },
      });

      await expect(
        ctx.service.update(STORE_ID, { isActive: true } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(ctx.storesRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('search index', () => {
    it('resyncs the store after an update', async () => {
      await ctx.service.update(STORE_ID, { name: 'Novo nome' } as never);

      expect(ctx.storeSearchSync.sync).toHaveBeenCalledWith(STORE_ID);
    });

    it('removes the store from the index only after deleting it', async () => {
      const order: string[] = [];
      ctx.storesRepository.delete = vi.fn(async () => {
        order.push('db');
      });
      ctx.storeSearchSync.remove.mockImplementation(async () => {
        order.push('index');
      });

      await ctx.service.delete(STORE_ID);

      expect(order).toEqual(['db', 'index']);
    });

    it('keeps the store in the index when the delete fails', async () => {
      ctx.storesRepository.delete = vi.fn().mockRejectedValue(new Error('fk'));

      await expect(ctx.service.delete(STORE_ID)).rejects.toThrow('fk');
      expect(ctx.storeSearchSync.remove).not.toHaveBeenCalled();
    });
  });
});
