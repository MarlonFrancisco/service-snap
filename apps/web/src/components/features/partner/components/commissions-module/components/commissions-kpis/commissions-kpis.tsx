import { Skeleton } from '@repo/ui';
import {
  MANAGEMENT_KPI_CLASS,
  MANAGEMENT_KPI_LABEL_CLASS,
  MANAGEMENT_KPI_VALUE_CLASS,
} from '../../../cash-module/cash-module.styles';
import type { TCommissionsKpisConfig } from './commissions-kpis.types';

export const CommissionsKpis = ({
  kpis,
  isLoading,
}: TCommissionsKpisConfig) => (
  <ul
    aria-label="Resumo do período"
    aria-busy={isLoading || undefined}
    className="grid gap-3.5 sm:grid-cols-3"
  >
    {kpis.map((kpi) => (
      <li key={kpi.label} className={MANAGEMENT_KPI_CLASS}>
        <span className={MANAGEMENT_KPI_LABEL_CLASS}>{kpi.label}</span>
        {isLoading ? (
          <Skeleton className="h-7 w-24 rounded-full bg-[#F0EEF4]" />
        ) : (
          <b className={MANAGEMENT_KPI_VALUE_CLASS}>{kpi.value}</b>
        )}
      </li>
    ))}
  </ul>
);
