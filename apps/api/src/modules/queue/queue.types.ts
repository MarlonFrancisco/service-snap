/**
 * Trabalhos que passam pelo QStash, com o corpo de cada um. Só ids e decisões
 * já tomadas: quem trata recarrega o que precisa do banco.
 */
export type TQueueJobMap = {
  /** `notify` falso: lote (série recorrente) que só manda o webhook. */
  'schedule.created': {
    scheduleIds: string[];
    createdByStore: boolean;
    notify: boolean;
  };
  'schedule.cancelled': {
    scheduleId: string;
    cancelledByCustomer: boolean;
    notify: boolean;
  };
  /** O que mudou é decidido na requisição, que ainda conhece o "antes". */
  'schedule.updated': {
    scheduleId: string;
    webhook: boolean;
    notifyChange: boolean;
    previousSchedule?: string;
    /** Dia (YYYY-MM-DD) do horário antigo, que ficou livre para a lista de espera. */
    freedDate?: string;
  };
  'webhook.delivery': { deliveryId: string };
  'campaign.message': { recipientId: string };
};

export type TQueueJobType = keyof TQueueJobMap;

export type TQueueJob<T extends TQueueJobType = TQueueJobType> = {
  [K in T]: { type: K; data: TQueueJobMap[K] };
}[T];

export type TQueueAttempt = {
  /** Quantas vezes o QStash já tentou antes desta (`Upstash-Retried`). */
  retried: number;
  /** Erro agora não volta mais: é a hora de marcar a falha. */
  isLastAttempt: boolean;
};

export type TQueueHandler<T extends TQueueJobType> = (
  data: TQueueJobMap[T],
  attempt: TQueueAttempt,
) => Promise<unknown>;
