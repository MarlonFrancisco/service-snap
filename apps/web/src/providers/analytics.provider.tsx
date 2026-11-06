'use client';

import {
  AnalyticsService,
  type IAnalytics,
  type IAnalyticsTracker,
} from '@repo/analytics';
import { createAnalytics } from '@/utils/helpers/analytics.helper';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  createContext,
  PropsWithChildren,
  Suspense,
  useContext,
  useEffect,
  useState,
} from 'react';

/** Fora do provider (testes, Storybook) as chamadas viram no-op. */
const AnalyticsContext = createContext<IAnalytics>(new AnalyticsService([]));

export function AnalyticsProvider({ children }: PropsWithChildren<unknown>) {
  // Uma instância por montagem, e não no módulo, pelo mesmo motivo do
  // QueryProvider: no servidor o módulo é compartilhado entre requisições.
  const [analytics] = useState(createAnalytics);

  useEffect(() => {
    void analytics.initialize();
  }, [analytics]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
      {/* useSearchParams exige Suspense para não desligar a renderização estática. */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </AnalyticsContext.Provider>
  );
}

function PageViewTracker() {
  const analytics = useContext(AnalyticsContext);
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    analytics.page({
      path: search ? `${pathname}?${search}` : pathname,
      title: document.title,
    });
  }, [analytics, pathname, search]);

  return null;
}

/** Componentes e hooks registram eventos só através desta interface. */
export const useAnalytics = (): IAnalyticsTracker =>
  useContext(AnalyticsContext);

/** Para quem precisa registrar o consentimento (banner de cookies). */
export const useAnalyticsConsent = (): IAnalytics['setConsent'] => {
  const analytics = useContext(AnalyticsContext);
  return (consent) => analytics.setConsent(consent);
};
