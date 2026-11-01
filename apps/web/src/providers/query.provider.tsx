'use client';

import { getQueryClient } from '@/utils/helpers/query.helper';
import { QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

export function QueryProvider({ children }: PropsWithChildren<unknown>) {
  // Must run per render: at module scope the server would share one client,
  // and its cache, across every request and user.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
