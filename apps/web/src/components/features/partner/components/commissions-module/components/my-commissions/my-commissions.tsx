'use client';

import { Lock, Percent } from 'lucide-react';
import {
  ModuleErrorState,
  ModuleStatePanel,
  NoStoreState,
} from '../../../notifications-module/components/module-state';
import {
  MANAGEMENT_LEAD_CLASS,
  MANAGEMENT_TITLE_CLASS,
} from '../../../cash-module/cash-module.styles';
import { CommissionsKpis } from '../commissions-kpis';
import { CommissionsLines } from '../commissions-lines';
import { CommissionsPeriod } from '../commissions-period';
import { useMyCommissions } from './my-commissions.hook';

export const MyCommissions = () => {
  const {
    storeState,
    periodState,
    kpis,
    rows,
    isLoading,
    isError,
    isForbidden,
    isRefreshing,
    handleRetry,
  } = useMyCommissions();

  if (storeState === 'no-store') return <NoStoreState />;

  const renderLines = () => {
    if (periodState.periodError) return null;
    if (isForbidden) {
      return (
        <ModuleStatePanel
          icon={Lock}
          headingLevel="h3"
          title="Sem comissões nesta loja"
          description="Só quem é da equipe da loja tem comissão."
        />
      );
    }
    if (isError) {
      return <ModuleErrorState headingLevel="h3" onRetry={handleRetry} />;
    }
    if (isLoading) return null;
    if (rows.length === 0) {
      return (
        <ModuleStatePanel
          icon={Percent}
          headingLevel="h3"
          title="Nenhum atendimento concluído no período"
          description="Os atendimentos concluídos aparecem aqui com a comissão de cada um."
        />
      );
    }

    return (
      <CommissionsLines
        rows={rows}
        label="Meus atendimentos no período"
        isRefreshing={isRefreshing}
      />
    );
  };

  return (
    <section aria-labelledby="my-commissions-title" className="grid gap-[18px]">
      <div>
        <h2 id="my-commissions-title" className={MANAGEMENT_TITLE_CLASS}>
          Minhas comissões
        </h2>
        <p className={MANAGEMENT_LEAD_CLASS}>
          Só atendimentos concluídos. A base é o que a loja recebeu no
          fechamento; sem fechamento, o preço reservado.
        </p>
      </div>

      <CommissionsPeriod {...periodState} />

      <CommissionsKpis
        kpis={kpis}
        isLoading={isLoading && !periodState.periodError}
      />

      {renderLines()}
    </section>
  );
};
