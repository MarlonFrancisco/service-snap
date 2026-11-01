// @vitest-environment jsdom
import { UserIdentificationProvider } from '@/providers/user-identification.provider';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUserQuery } from './use-user-query.hook';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

const USER_ID = 'user-1';

const setCookie = (value: string, maxAge = 60) => {
  document.cookie = `user_identification=${value}; path=/; max-age=${maxAge}`;
};

const makeClient = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  });
  client.setQueryData(CACHE_QUERY_KEYS.user(USER_ID), {
    email: 'ana@example.com',
  });
  return client;
};

function Probe() {
  const { isLoggedIn } = useUserQuery();
  return <p>{isLoggedIn ? 'logado' : 'visitante'}</p>;
}

const App = ({ client, id }: { client: QueryClient; id?: string }) => (
  <UserIdentificationProvider value={id}>
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>
  </UserIdentificationProvider>
);

describe('useUserQuery hydration', () => {
  afterEach(() => {
    setCookie('', -1);
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  it('renders a logged-in user the same on server and client', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);

    // js-cookie sees no cookie during SSR, so the cookie is only set afterwards.
    const html = renderToString(<App client={makeClient()} id={USER_ID} />);
    setCookie(USER_ID);

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const recoverableErrors: unknown[] = [];
    await act(async () => {
      hydrateRoot(container, <App client={makeClient()} id={USER_ID} />, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
    });

    expect(recoverableErrors).toEqual([]);
    expect(html).toContain('logado');
    expect(container.textContent).toBe('logado');
  });

  it('follows the cookie after hydration so logout takes effect', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);

    const html = renderToString(<App client={makeClient()} id={USER_ID} />);

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    await act(async () => {
      hydrateRoot(container, <App client={makeClient()} id={USER_ID} />, {
        onRecoverableError: () => undefined,
      });
    });

    expect(container.textContent).toBe('visitante');
  });
});
