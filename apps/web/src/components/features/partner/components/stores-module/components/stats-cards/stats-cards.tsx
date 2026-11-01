import { PARTNER_MUTED_TEXT_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { useStatsCards } from './stats-cards.hook';

const LABEL_CLASS = cn('text-[13px] font-semibold', PARTNER_MUTED_TEXT_CLASS);
const VALUE_CLASS = 'mt-1.5 text-[28px] leading-tight font-extrabold';
const CARD_CLASS = 'rounded-[22px] border border-[#EBE9F0] p-[22px]';

export const StatsCards = () => {
  const { totalStores, activeStores } = useStatsCards();

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3.5">
      <div className={CARD_CLASS}>
        <p className={LABEL_CLASS}>Total de lojas</p>
        <p className={VALUE_CLASS}>{totalStores}</p>
      </div>
      <div className={CARD_CLASS}>
        <p className={LABEL_CLASS}>Lojas ativas</p>
        <p className={VALUE_CLASS}>
          {activeStores} de {totalStores}
        </p>
      </div>
    </div>
  );
};
