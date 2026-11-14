/** "Só este" ou "este e os próximos". */
export type TSeriesCancelScope = 'one' | 'following';

export type TScheduleSeriesCancelConfig = {
  /** Agendamento aberto nos detalhes (o primeiro serviço da visita). */
  scheduleId: string;
  seriesId: string;
  /** Volta para os detalhes sem cancelar. */
  onBack: () => void;
  /** Depois de cancelar: fechar os detalhes, por exemplo. */
  onDone: () => void;
};

export type TUseScheduleSeriesCancelConfig = Omit<
  TScheduleSeriesCancelConfig,
  'onBack'
>;
