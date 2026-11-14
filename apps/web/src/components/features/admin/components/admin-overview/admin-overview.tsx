'use client';

import { Skeleton } from '@repo/ui';
import { PANEL_TITLE_CLASS } from '../../../partner/components/audit-logs-module/audit-logs-module.styles';
import { ModuleErrorState } from '../../../partner/components/notifications-module/components/module-state';
import { AdminStores } from '../admin-stores';
import { useAdminOverview } from './admin-overview.hook';

const KPI_CLASS =
  'flex flex-col gap-1 rounded-[20px] bg-white p-[18px] shadow-[0_8px_28px_rgba(15,12,30,0.08)]';

export const AdminOverview = () => {
  const { kpis, isLoading, isError, isRetrying, handleRetry } =
    useAdminOverview();

  const renderKpis = () => {
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label="Carregando números"
          className="grid gap-3.5 sm:grid-cols-2"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-[108px] rounded-[20px] bg-[#E9E7EF]"
            />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <ModuleErrorState
          headingLevel="h2"
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      );
    }

    return (
      <dl className="grid gap-3.5 sm:grid-cols-2">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={KPI_CLASS}>
            <dt className="text-[13px] text-[#5F5C6E]">{kpi.label}</dt>
            <dd className="m-0 text-[22px] font-extrabold tracking-[-0.02em] tabular-nums">
              {kpi.value}
            </dd>
            <dd className="m-0 text-[13px] text-[#5F5C6E]">{kpi.detail}</dd>
          </div>
        ))}
      </dl>
    );
  };

  return (
    <AdminStores
      headingLevel="h2"
      intro={
        <>
          <h1 className={PANEL_TITLE_CLASS}>Visão geral</h1>
          {renderKpis()}
        </>
      }
    />
  );
};
