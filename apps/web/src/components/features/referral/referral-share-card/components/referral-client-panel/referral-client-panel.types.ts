import type { useReferralShareCard } from '../../referral-share-card.hook';

export type TReferralClientPanelConfig = ReturnType<
  typeof useReferralShareCard
> & {
  /** Fixa o painel ao rolar no desktop; só faz sentido quando ele é a coluna lateral da página. */
  isSticky?: boolean;
};
