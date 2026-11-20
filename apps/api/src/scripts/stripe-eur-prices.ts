/**
 * Preços EUR de Portugal aprovados pelo Marlon (#23), em cêntimos e sem IVA.
 * Só registados: nenhum script os aplica até à decisão fiscal (entidade e
 * conta Stripe). Entram como `currency_options.eur` dos prices atuais.
 */
export const EUR_PRICES = {
  month: { solo: 1490, team: 2990, multi: 5990 },
  year: { solo: 14300, team: 28700, multi: 57500 },
} as const;
