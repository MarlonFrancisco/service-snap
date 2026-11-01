// @vitest-environment node
import { ApiHttpError } from '@/service/api';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from './page';

const REDIRECT_ERROR = 'NEXT_REDIRECT';

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((_path: string) => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('next/navigation', () => ({ redirect }));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => ({ value: `${name}-value` }),
  }),
}));
vi.mock('@/components/features/profile', () => ({ Profile: () => null }));

const stubUsersResponse = (status: number) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('{}', { status })),
  );

const renderPage = () => ProfilePage({ searchParams: Promise.resolve({}) });

describe('ProfilePage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    redirect.mockClear();
  });

  it('redirects home when the API rejects the session', async () => {
    stubUsersResponse(401);

    await expect(renderPage()).rejects.toThrow(REDIRECT_ERROR);
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('does not treat an API outage as a logged-out user', async () => {
    stubUsersResponse(503);

    await expect(renderPage()).rejects.toBeInstanceOf(ApiHttpError);
    expect(redirect).not.toHaveBeenCalled();
  });
});
