/** Um atendimento da visita no cálculo do fechamento. */
export type TCheckoutLine = {
  scheduleId: string;
  serviceId: string | null;
  price: number;
  /** Valor de uma sessão quando o atendimento sai de pacote. */
  sessionValue: number | null;
};

export type TCheckoutTotals = {
  subtotal: number;
  discount: number;
  total: number;
  received: number;
  /** Base da comissão de cada atendimento, na ordem de `lines`. */
  baseAmounts: number[];
};
