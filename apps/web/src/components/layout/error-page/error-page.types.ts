export type TErrorPageConfig = {
  /** O que foi lançado: do servidor chega um `Error` com `digest`; do cliente, qualquer valor. */
  error: unknown;
  /** Busca e renderiza de novo o trecho que falhou. */
  retry: () => void;
};
