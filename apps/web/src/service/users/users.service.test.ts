// @vitest-environment node
import { getQueryClient } from '@/utils/helpers/query.helper';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from './users.service';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const sessionHeaders = (token: string) => ({
  Cookie: `access_token=${token}`,
});

describe('UsersService on the server', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('keeps the session of the request when a prefetch retries', async () => {
    vi.useFakeTimers();

    const cookiesByUrl: unknown[] = [];
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      cookiesByUrl.push((init.headers as Record<string, string>).Cookie);
      // Only request A's first attempt fails, so it retries while B is running.
      return cookiesByUrl.length === 1
        ? jsonResponse({ message: 'unavailable' }, 503)
        : jsonResponse({ email: 'someone@example.com' });
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const prefetchA = getQueryClient().prefetchQuery({
      queryKey: ['user', 'a'],
      queryFn: () => UsersService.getUser(sessionHeaders('token-a')),
    });

    await vi.advanceTimersByTimeAsync(0);

    const prefetchB = getQueryClient().prefetchQuery({
      queryKey: ['user', 'b'],
      queryFn: () => UsersService.getUser(sessionHeaders('token-b')),
    });

    await vi.advanceTimersByTimeAsync(5000);
    await Promise.all([prefetchA, prefetchB]);

    expect(cookiesByUrl).toEqual([
      'access_token=token-a',
      'access_token=token-b',
      'access_token=token-a',
    ]);
  });

  it('does not retry when the API rejects the session', async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn(async () => jsonResponse({}, 401));
    vi.stubGlobal('fetch', fetchMock);

    const prefetch = getQueryClient().prefetchQuery({
      queryKey: ['user', 'expired'],
      queryFn: () => UsersService.getUser(sessionHeaders('expired')),
    });

    await vi.advanceTimersByTimeAsync(10000);
    await prefetch;

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
