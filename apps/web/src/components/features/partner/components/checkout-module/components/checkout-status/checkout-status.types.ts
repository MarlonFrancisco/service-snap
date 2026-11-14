import type { TCheckoutVisitConfig } from '../../checkout-module.types';

export type TCheckoutStatusConfig = TCheckoutVisitConfig & {
  /** Troca os detalhes pelo formulário de fechamento. */
  onOpenCheckout: () => void;
};

export type TUseCheckoutStatusConfig = TCheckoutVisitConfig;
