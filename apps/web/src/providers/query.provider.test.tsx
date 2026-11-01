// @vitest-environment node
import { HydrationBoundary, useQuery } from '@tanstack/react-query';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { QueryProvider } from './query.provider';

const dehydratedState = (key: string, data: string, dataUpdatedAt: number) => ({
  mutations: [],
  queries: [
    {
      queryKey: [key],
      queryHash: JSON.stringify([key]),
      state: {
        data,
        dataUpdateCount: 1,
        dataUpdatedAt,
        error: null,
        errorUpdateCount: 0,
        errorUpdatedAt: 0,
        fetchFailureCount: 0,
        fetchFailureReason: null,
        fetchMeta: null,
        isInvalidated: false,
        status: 'success' as const,
        fetchStatus: 'idle' as const,
      },
    },
  ],
});

function Probe({ queryKey }: { queryKey: string }) {
  const { data } = useQuery<string>({
    queryKey: [queryKey],
    queryFn: () => 'client',
    enabled: false,
  });
  return <p>{data ?? 'empty'}</p>;
}

const renderRequest = (
  queryKey: string,
  state?: ReturnType<typeof dehydratedState>,
) =>
  renderToString(
    <QueryProvider>
      <HydrationBoundary state={state}>
        <Probe queryKey={queryKey} />
      </HydrationBoundary>
    </QueryProvider>,
  );

describe('QueryProvider on the server', () => {
  it('renders each request from its own prefetched data', () => {
    const key = 'search';

    expect(renderRequest(key, dehydratedState(key, 'primeiro', 1))).toContain(
      'primeiro',
    );
    expect(renderRequest(key, dehydratedState(key, 'segundo', 2))).toContain(
      'segundo',
    );
  });

  it('does not leak a previous request into one without prefetch', () => {
    const key = 'subscription/current-plan';

    renderRequest(key, dehydratedState(key, 'plano-do-usuario-a', 1));

    expect(renderRequest(key)).not.toContain('plano-do-usuario-a');
  });
});
