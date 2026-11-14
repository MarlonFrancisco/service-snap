/** Um horário voltou a ficar livre: cancelamento ou remarcação para outro dia, hora ou profissional. */
export type TScheduleSlotFreed = {
  storeId: string;
  /** Dia que ganhou a vaga, `YYYY-MM-DD`. */
  date: string;
};

export type TScheduleSlotFreedListener = (
  event: TScheduleSlotFreed,
) => Promise<unknown>;
