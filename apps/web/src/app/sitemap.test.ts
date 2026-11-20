import { describe, expect, it, vi } from 'vitest';
import { loadStoreSitemap } from '@/utils/helpers/store-sitemap.helper';
import sitemap from './sitemap';

vi.mock('@/service/search', () => ({ SearchService: {} }));
vi.mock('@/utils/helpers/store-sitemap.helper', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('@/utils/helpers/store-sitemap.helper')
  >()),
  loadStoreSitemap: vi.fn(),
}));

const categoryCityUrls = (entries: { url: string }[]) =>
  entries.filter((entry) => entry.url.includes('/categoria/barbearia/'));

describe('sitemap', () => {
  it('sai sem páginas categoria + cidade quando nenhuma chega ao limite', async () => {
    vi.mocked(loadStoreSitemap).mockResolvedValue({
      stores: [{ id: 'store-1' }],
      categoryCities: [
        { category: 'Barbearia', city: 'Campinas', storeCount: 2 },
      ],
    });

    const entries = await sitemap();

    expect(categoryCityUrls(entries)).toEqual([]);
    expect(entries.some((entry) => entry.url.endsWith('/pricing'))).toBe(true);
    expect(
      entries.some((entry) => entry.url.endsWith('/booking/store-1')),
    ).toBe(true);
  });

  it('inclui o par com lojas suficientes', async () => {
    vi.mocked(loadStoreSitemap).mockResolvedValue({
      stores: [],
      categoryCities: [
        { category: 'Barbearia', city: 'Campinas', storeCount: 3 },
      ],
    });

    expect(categoryCityUrls(await sitemap())).toHaveLength(1);
  });

  it('não quebra quando a API falha', async () => {
    vi.mocked(loadStoreSitemap).mockResolvedValue(null);

    await expect(sitemap()).resolves.not.toHaveLength(0);
  });
});
