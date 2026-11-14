'use client';

import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@repo/ui';
import { Lock, UserCheck } from 'lucide-react';
import Link from 'next/link';
import {
  ModuleErrorState,
  ModuleStatePanel,
  NoStoreState,
} from '../notifications-module/components/module-state';
import {
  RETENTION_LABEL_CLASS,
  RETENTION_LEAD_CLASS,
  RETENTION_PRIMARY_BUTTON_CLASS,
  RETENTION_SELECT_CLASS,
  RETENTION_TITLE_CLASS,
} from '../packages-module/packages-module.styles';
import { INACTIVE_DAYS_OPTIONS } from './campaigns-module.helpers';
import { useCampaignsModule } from './campaigns-module.hook';
import { CampaignsHistory } from './components/campaigns-history';
import { InactiveCustomersTable } from './components/inactive-customers-table';
import { NewCampaignForm } from './components/new-campaign-form';

export const CampaignsModule = () => {
  const {
    storeId,
    storeName,
    timeZone,
    view,
    inactiveDays,
    setInactiveDays,
    rows,
    countLabel,
    isLoadingRows,
    isRowsError,
    isRefreshingRows,
    handleRetryRows,
    areAllSelected,
    canToggleAll,
    handleToggleAll,
    handleToggleCustomer,
    handleOptOut,
    optingOutId,
    setChannel,
    channelOptions,
    hasWhatsappPlan,
    audience,
  } = useCampaignsModule();

  if (view === 'no-store') return <NoStoreState />;
  if (view === 'no-access') {
    return (
      <ModuleStatePanel
        icon={Lock}
        title="Sem acesso às campanhas"
        description="Campanha fala em nome da loja com a base toda: só o dono e o gerente enviam."
      >
        <Link href="/partner/agenda" className={RETENTION_PRIMARY_BUTTON_CLASS}>
          Ir para a agenda
        </Link>
      </ModuleStatePanel>
    );
  }
  if (view === 'error') {
    return <ModuleErrorState onRetry={handleRetryRows} />;
  }

  const renderCustomers = () => {
    if (view === 'loading' || isLoadingRows) {
      return (
        <Skeleton
          role="status"
          aria-label="Carregando clientes"
          className="h-[260px] rounded-[20px] bg-[#F0EEF4]"
        />
      );
    }
    if (isRowsError) {
      return (
        <ModuleErrorState
          headingLevel="h3"
          onRetry={handleRetryRows}
          isRetrying={isRefreshingRows}
        />
      );
    }
    if (rows.length === 0) {
      return (
        <ModuleStatePanel
          icon={UserCheck}
          headingLevel="h3"
          title={`Ninguém sumido há ${inactiveDays} dias`}
          description="Todo mundo que veio voltou ou já tem horário marcado. Tente um período menor."
        />
      );
    }

    return (
      <InactiveCustomersTable
        rows={rows}
        isRefreshing={isRefreshingRows}
        areAllSelected={areAllSelected}
        canToggleAll={canToggleAll}
        onToggleAll={handleToggleAll}
        onToggle={handleToggleCustomer}
        onOptOut={handleOptOut}
        optingOutId={optingOutId}
      />
    );
  };

  return (
    <div className="grid items-start gap-7 min-[1180px]:grid-cols-[minmax(0,1fr)_480px]">
      <section aria-labelledby="campaigns-title" className="grid min-w-0 gap-4">
        <div>
          <h2 id="campaigns-title" className={RETENTION_TITLE_CLASS}>
            Campanhas de reativação
          </h2>
          <p className={RETENTION_LEAD_CLASS}>
            Quem veio e não voltou, sem horário marcado.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2.5">
          <div className={RETENTION_LABEL_CLASS}>
            <span id="campaigns-inactive-days-label">Sem visita há</span>
            <Select
              value={String(inactiveDays)}
              onValueChange={(value) => setInactiveDays(Number(value))}
            >
              <SelectTrigger
                aria-labelledby="campaigns-inactive-days-label"
                className={cn(RETENTION_SELECT_CLASS, 'min-w-[160px]')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={PARTNER_PORTAL_CLASS}>
                {INACTIVE_DAYS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isLoadingRows && !isRowsError ? (
            <span className="flex min-h-[46px] items-center text-[13px] text-[#5F5C6E]">
              {countLabel}
            </span>
          ) : null}
        </div>

        {renderCustomers()}

        <CampaignsHistory storeId={storeId} timeZone={timeZone} />
      </section>

      <aside aria-label="Nova campanha" className="grid gap-3.5">
        <NewCampaignForm
          storeId={storeId}
          storeName={storeName}
          audience={audience}
          channelOptions={channelOptions}
          onChannelChange={setChannel}
          hasWhatsappPlan={hasWhatsappPlan}
        />
      </aside>
    </div>
  );
};
