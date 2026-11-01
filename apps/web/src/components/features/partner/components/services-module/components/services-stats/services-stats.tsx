import { cn } from '@repo/ui';
import { PARTNER_MUTED_TEXT_CLASS } from '../../../../partner.styles';
import { SERVICES_KPI_GRID_CLASS } from '../../services-module.styles';

type TServicesStatsConfig = {
  total: number;
  active: number;
};

const CARD_CLASS = 'rounded-[22px] border border-[#EBE9F0] p-[22px]';
const LABEL_CLASS = cn('text-[13px] font-semibold', PARTNER_MUTED_TEXT_CLASS);
const VALUE_CLASS = 'mt-1.5 text-[28px] font-extrabold';

export const ServicesStats = ({ total, active }: TServicesStatsConfig) => (
  <div className={SERVICES_KPI_GRID_CLASS}>
    <div className={CARD_CLASS}>
      <p className={LABEL_CLASS}>Total de serviços</p>
      <p className={VALUE_CLASS}>{total}</p>
    </div>
    <div className={CARD_CLASS}>
      <p className={LABEL_CLASS}>Serviços ativos</p>
      <p className={VALUE_CLASS}>
        {active} de {total}
      </p>
    </div>
  </div>
);
