/** O que a notificação mostra, e para onde ela leva ao ser tocada. */
export type TPushPayload = {
  title: string;
  body: string;
  /** Caminho no web, ex.: `/partner/agenda`. */
  url: string;
  /** Mesma `tag` substitui a notificação anterior em vez de empilhar. */
  tag?: string;
};
