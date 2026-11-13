import type { TCheckoutVisitConfig } from '../../checkout-module.types';

export type TCheckoutFormConfig = TCheckoutVisitConfig & {
  /** Volta para os detalhes sem fechar. */
  onCancel: () => void;
  /** Fechou: quem abriu decide o que fazer (ex.: fechar os detalhes). */
  onDone: () => void;
};
