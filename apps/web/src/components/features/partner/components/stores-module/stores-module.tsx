'use client';

import { PARTNER_MUTED_TEXT_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AddStoreModal } from './components/add-store-modal';
import { EmptyStoreList } from './components/empty-store-list/empty-store-list';
import { PlanLimitNotice } from './components/plan-limit-notice';
import { StatePanel } from './components/state-panel';
import { StatsCards } from './components/stats-cards';
import { StoreCard } from './components/store-card';
import { StoreDetailsDrawer } from './components/store-details-drawer';
import { useStoresModule } from './stores-module.hook';
import { StoresModuleSkeleton } from './stores-module.skeleton';
import { STORES_PRIMARY_BUTTON_CLASS } from './stores-module.styles';
import { PLAN_UPGRADE_ROUTE } from './utils/stores-module.constants';

export const StoresModule = () => {
  const {
    stores,
    isPendingStores,
    hasLoadError,
    isFetchingStores,
    storesUsage,
    handleAddStore,
    handleRetry,
  } = useStoresModule();

  if (isPendingStores) {
    return <StoresModuleSkeleton />;
  }

  const header = (
    <div>
      <h2 className="text-2xl font-extrabold tracking-[-0.025em]">
        Gestão de lojas
      </h2>
      <p className={cn('mt-0.5 text-[15px]', PARTNER_MUTED_TEXT_CLASS)}>
        Gerencie suas lojas, equipes e configurações
      </p>
    </div>
  );

  if (hasLoadError) {
    return (
      <div className="grid gap-[18px]">
        {header}
        <StatePanel
          tone="error"
          icon={AlertTriangle}
          title="Não foi possível carregar"
          description="Seus dados continuam salvos. Verifique a conexão e tente de novo."
          actionLabel="Tentar novamente"
          isActionDisabled={isFetchingStores}
          onAction={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {header}

        {storesUsage?.isAtLimit ? (
          <Link
            href={PLAN_UPGRADE_ROUTE}
            className={cn(STORES_PRIMARY_BUTTON_CLASS, 'w-full sm:w-auto')}
          >
            Fazer upgrade
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddStore}
            className={cn(STORES_PRIMARY_BUTTON_CLASS, 'w-full sm:w-auto')}
          >
            Adicionar loja
          </button>
        )}
      </div>

      {storesUsage?.isAtLimit ? (
        <PlanLimitNotice
          description={`Você usa ${storesUsage.current} de ${storesUsage.limit} lojas neste plano. Faça upgrade para continuar criando.`}
        />
      ) : null}

      {stores.length > 0 ? (
        <>
          <StatsCards />
          <div className="grid gap-[18px]">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </>
      ) : (
        <EmptyStoreList />
      )}

      <StoreDetailsDrawer />

      <AddStoreModal />
    </div>
  );
};
