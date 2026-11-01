import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoresService } from './stores.services';

const STORE_ID = 'store-1';

const makeService = () => {
  const storesRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
  };
  const searchService = {
    indexStore: vi.fn(),
    deleteStoreIndex: vi.fn(),
  };

  const service = new StoresService(
    storesRepository as never,
    searchService as never,
  );

  return { service, storesRepository, searchService };
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

  describe('syncSearchIndex', () => {
    it('never rejects when the index is down', async () => {
      ctx.storesRepository.findOne.mockResolvedValue({
        id: STORE_ID,
        isActive: false,
      });
      ctx.searchService.deleteStoreIndex.mockRejectedValue(new Error('down'));

      await expect(
        ctx.service.syncSearchIndex(STORE_ID),
      ).resolves.toBeUndefined();
    });
  });
});
