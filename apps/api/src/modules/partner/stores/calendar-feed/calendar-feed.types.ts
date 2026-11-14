/** Um atendimento já pronto para virar evento de calendário. */
export type TCalendarFeedEvent = {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location: string;
  /** Última alteração: o calendário usa para saber se o evento mudou. */
  updatedAt: Date;
};

export type TCalendarFeedResponse = {
  /** Endereço para colar em "Adicionar calendário por URL". */
  url: string;
  createdAt: Date;
};
