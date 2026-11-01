import type { TPricingPlanItem } from '../../pricing.types';

export type TPricingPlanCardConfig = TPricingPlanItem & {
  /** Sobrescreve o rótulo padrão; o painel usa "Fazer upgrade" e variações. */
  actionLabel?: string;
  /** Desativa a ação além do plano atual. */
  isActionDisabled?: boolean;
  /** Assume o clique no lugar da assinatura padrão. */
  onSelectPlan?: (priceId: string) => void;
  /** Quem já assina não tem período de teste a anunciar. */
  hideTrial?: boolean;
};
