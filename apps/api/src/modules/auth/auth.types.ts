/** Quantas vezes algo foi usado dentro de uma janela de tempo. */
export type TUsageWindow = {
  count: number;
  /** Instante (ms) em que a contagem zera. */
  resetAt: number;
};
