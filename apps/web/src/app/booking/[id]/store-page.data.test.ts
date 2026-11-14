import { ApiHttpError } from '@/service/api/http-error';
import { StoreService } from '@/service/store/store.service';
import type { IStore } from '@/types/api/stores.types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  loadStorePage,
  storePageDescription,
  storePageTitle,
} from './store-page.data';

const STORE_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

const store = (overrides: Partial<IStore> = {}) =>
  ({
    id: STORE_ID,
    name: 'Barbearia do Zé',
    city: 'São Paulo',
    description: 'Cortes clássicos e barba.',
    isActive: true,
    ...overrides,
  }) as IStore;

describe('loadStorePage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('treats something that is neither a UUID nor a slug as missing without calling the API', async () => {
    const get = vi.spyOn(StoreService, 'get');

    await expect(loadStorePage('Not A Store!')).resolves.toEqual({ status: 'missing' });
    expect(get).not.toHaveBeenCalled();
  });

  it('maps a 404 to missing', async () => {
    vi.spyOn(StoreService, 'get').mockRejectedValue(
      new ApiHttpError(404, null),
    );

    await expect(loadStorePage(STORE_ID)).resolves.toEqual({
      status: 'missing',
    });
  });

  it('maps other failures to unavailable', async () => {
    vi.spyOn(StoreService, 'get').mockRejectedValue(
      new ApiHttpError(500, null),
    );

    await expect(loadStorePage(STORE_ID)).resolves.toEqual({
      status: 'unavailable',
    });
  });

  it('returns the store', async () => {
    vi.spyOn(StoreService, 'get').mockResolvedValue(store());

    await expect(loadStorePage(STORE_ID)).resolves.toEqual({
      status: 'ok',
      store: store(),
    });
  });
});

describe('storePageTitle', () => {
  it('includes the city when known', () => {
    expect(storePageTitle(store())).toBe(
      'Barbearia do Zé em São Paulo | ServiceSnap',
    );
    expect(storePageTitle(store({ city: '' }))).toBe(
      'Barbearia do Zé | ServiceSnap',
    );
  });
});

describe('storePageDescription', () => {
  it('uses the store description', () => {
    expect(storePageDescription(store())).toBe('Cortes clássicos e barba.');
  });

  it('falls back when there is no description', () => {
    expect(storePageDescription(store({ description: '  ' }))).toBe(
      'Agende um horário com Barbearia do Zé em São Paulo no ServiceSnap.',
    );
  });

  it('cuts long descriptions on a word boundary', () => {
    const result = storePageDescription(
      store({ description: 'palavra '.repeat(40) }),
    );

    expect(result.length).toBeLessThanOrEqual(155);
    expect(result.endsWith('palavra…')).toBe(true);
  });
});
