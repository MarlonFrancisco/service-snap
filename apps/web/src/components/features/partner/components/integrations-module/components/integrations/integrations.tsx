'use client';

import { Skeleton } from '@repo/ui';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import {
  ModuleErrorState,
  ModuleStatePanel,
  NoStoreState,
} from '../../../notifications-module/components/module-state';
import {
  PANEL_CAPTION_CLASS,
  PANEL_PRIMARY_BUTTON_CLASS,
} from '../../../audit-logs-module/audit-logs-module.styles';
import { ApiKeysCard } from '../api-keys-card';
import { WebhooksCard } from '../webhooks-card';
import { useIntegrations } from './integrations.hook';

export const Integrations = () => {
  const { storeId, storeState, hasNoAccess, handleRetry } = useIntegrations();

  if (storeState === 'no-store') return <NoStoreState />;
  if (storeState === 'error') {
    return <ModuleErrorState onRetry={handleRetry} />;
  }
  if (hasNoAccess) {
    return (
      <ModuleStatePanel
        icon={Lock}
        title="Sem acesso às integrações"
        description="Só o dono e o gerente da loja criam chaves de API e webhooks."
      >
        <Link href="/partner/agenda" className={PANEL_PRIMARY_BUTTON_CLASS}>
          Ir para a agenda
        </Link>
      </ModuleStatePanel>
    );
  }
  if (storeState === 'loading') {
    return (
      <div
        role="status"
        aria-label="Carregando integrações"
        className="grid gap-7 xl:grid-cols-2"
      >
        <Skeleton className="h-72 w-full rounded-[24px] bg-[#F0EEF4]" />
        <Skeleton className="h-72 w-full rounded-[24px] bg-[#F0EEF4]" />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-7 xl:grid-cols-2">
      <section
        aria-labelledby="integrations-api"
        className="grid min-w-0 gap-3.5"
      >
        <h2 id="integrations-api" className={PANEL_CAPTION_CLASS}>
          API pública
        </h2>
        <ApiKeysCard key={storeId} storeId={storeId} />
      </section>

      <section
        aria-labelledby="integrations-webhooks"
        className="grid min-w-0 gap-3.5"
      >
        <h2 id="integrations-webhooks" className={PANEL_CAPTION_CLASS}>
          Webhooks
        </h2>
        <WebhooksCard key={storeId} storeId={storeId} />
      </section>
    </div>
  );
};
