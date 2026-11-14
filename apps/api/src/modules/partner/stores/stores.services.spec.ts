import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoresService } from './stores.services';

const STORE_ID = 'store-1';

const makeService = () => {
  const storesRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    create: vi.fn((dto) => dto),
    save: vi.fn(async (store) => ({ id: STORE_ID, ...store })),
  };
  const storeSearchSync = { sync: vi.fn(), remove: vi.fn() };
  const subscriptionRepository = { findOne: vi.fn() };

  const service = new StoresService(
    storesRepository as never,
    storeSearchSync as never,
    subscriptionRepository as never,
    { getBotContact: vi.fn().mockResolvedValue(null) } as never,
  );

  return { service, storesRepository, storeSearchSync, subscriptionRepository };
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
        whatsappBot: null,
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

  describe('store limit (UNIT_LIMIT)', () => {
    const OWNER_ID = 'owner-1';
    const withLimit = (UNIT_LIMIT: number | null) =>
      ctx.subscriptionRepository.findOne.mockResolvedValue({
        features: { UNIT_LIMIT },
      });

    it('blocks activating a store past the plan limit', async () => {
      withLimit(1);
      ctx.storesRepository.count.mockResolvedValue(1);
      ctx.storesRepository.findOne.mockResolvedValue({
        id: STORE_ID,
        isActive: false,
        onboarding: null,
        owner: { id: OWNER_ID },
      });

      await expect(
        ctx.service.update(STORE_ID, { isActive: true } as never),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(ctx.storesRepository.update).not.toHaveBeenCalled();
    });

    it('lets an already active store be saved at the limit', async () => {
      withLimit(1);
      ctx.storesRepository.findOne.mockResolvedValue({
        id: STORE_ID,
        isActive: true,
        onboarding: null,
        owner: { id: OWNER_ID },
      });

      await ctx.service.update(STORE_ID, { isActive: true } as never);

      expect(ctx.storesRepository.count).not.toHaveBeenCalled();
      expect(ctx.storesRepository.update).toHaveBeenCalled();
    });

    it('blocks creating an active store past the plan limit', async () => {
      withLimit(2);
      ctx.storesRepository.count.mockResolvedValue(2);

      await expect(
        ctx.service.create({ isActive: true } as never, OWNER_ID),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(ctx.storesRepository.save).not.toHaveBeenCalled();
    });

    it('treats an unlimited plan as no limit', async () => {
      withLimit(null);

      await ctx.service.create({ isActive: true } as never, OWNER_ID);

      expect(ctx.storesRepository.count).not.toHaveBeenCalled();
      expect(ctx.storesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ owner: { id: OWNER_ID } }),
      );
    });

    it('does not count inactive stores being created', async () => {
      withLimit(1);

      await ctx.service.create({ isActive: false } as never, OWNER_ID);

      expect(ctx.subscriptionRepository.findOne).not.toHaveBeenCalled();
      expect(ctx.storesRepository.save).toHaveBeenCalled();
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
