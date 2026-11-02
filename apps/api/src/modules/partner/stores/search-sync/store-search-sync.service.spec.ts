import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoreSearchSyncService } from './store-search-sync.service';

const STORE_ID = 'store-1';

const bookableStore = {
  id: STORE_ID,
  name: 'Barbearia',
  isActive: true,
  onboarding: { completedAt: new Date() },
  services: [{ id: 'service-1', name: 'Corte', isActive: true }],
  storeMembers: [
    {
      role: 'professional',
      isActive: true,
      isDeleted: false,
      services: [{ id: 'service-1' }],
    },
  ],
  categories: [],
  owner: { id: 'owner-1' },
  createdAt: new Date(),
};

const makeService = () => {
  const storesRepository = { findOne: vi.fn() };
  const searchService = {
    indexStore: vi.fn(),
    deleteStoreIndex: vi.fn(),
  };

  const service = new StoreSearchSyncService(
    storesRepository as never,
    searchService as never,
  );

  return { service, storesRepository, searchService };
};

describe('StoreSearchSyncService', () => {
  let ctx: ReturnType<typeof makeService>;

  beforeEach(() => {
    ctx = makeService();
  });

  it('indexes a store the customer can book', async () => {
    ctx.storesRepository.findOne.mockResolvedValue(bookableStore);

    await ctx.service.sync(STORE_ID);

    expect(ctx.searchService.indexStore).toHaveBeenCalledWith(
      STORE_ID,
      expect.objectContaining({ serviceNames: ['Corte'] }),
      expect.objectContaining({ ownerId: 'owner-1' }),
    );
    expect(ctx.searchService.deleteStoreIndex).not.toHaveBeenCalled();
  });

  it('removes the store when its last active service is gone', async () => {
    ctx.storesRepository.findOne.mockResolvedValue({
      ...bookableStore,
      services: [{ id: 'service-1', name: 'Corte', isActive: false }],
    });

    await ctx.service.sync(STORE_ID);

    expect(ctx.searchService.deleteStoreIndex).toHaveBeenCalledWith(STORE_ID);
    expect(ctx.searchService.indexStore).not.toHaveBeenCalled();
  });

  it('removes the store when no professional can be booked', async () => {
    ctx.storesRepository.findOne.mockResolvedValue({
      ...bookableStore,
      storeMembers: [],
    });

    await ctx.service.sync(STORE_ID);

    expect(ctx.searchService.deleteStoreIndex).toHaveBeenCalledWith(STORE_ID);
  });

  it('removes a store that no longer exists', async () => {
    ctx.storesRepository.findOne.mockResolvedValue(null);

    await ctx.service.sync(STORE_ID);

    expect(ctx.searchService.deleteStoreIndex).toHaveBeenCalledWith(STORE_ID);
  });

  it('never rejects when the index is down', async () => {
    ctx.storesRepository.findOne.mockResolvedValue({
      ...bookableStore,
      isActive: false,
    });
    ctx.searchService.deleteStoreIndex.mockRejectedValue(new Error('down'));

    await expect(ctx.service.sync(STORE_ID)).resolves.toBeUndefined();
    await expect(ctx.service.remove(STORE_ID)).resolves.toBeUndefined();
  });
});
