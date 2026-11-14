'use client';

import { Skeleton } from '@repo/ui';
import { NoStoreState } from '../notifications-module/components/module-state';
import { useCommissionsModule } from './commissions-module.hook';
import { CommissionRules } from './components/commission-rules';
import { CommissionsReport } from './components/commissions-report';
import { MyCommissions } from './components/my-commissions';

/** Dono e gerente veem a equipe e as regras; o profissional, só a própria. */
export const CommissionsModule = () => {
  const { storeState, isProfessional } = useCommissionsModule();

  if (storeState === 'no-store') return <NoStoreState />;
  if (storeState === 'loading') {
    return (
      <Skeleton
        role="status"
        aria-label="Carregando comissões"
        className="h-64 rounded-[24px] bg-[#F0EEF4]"
      />
    );
  }
  if (isProfessional) return <MyCommissions />;

  return (
    <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_400px]">
      <CommissionsReport />
      <CommissionRules />
    </div>
  );
};
