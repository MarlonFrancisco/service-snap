/** Data que não entrou na série e o motivo, para a loja resolver. */
export type TSeriesConflict = {
  occurrence: number;
  date: string;
  reason: string;
};

export type TSeriesCreated = {
  id: string;
  created: { occurrence: number; date: string; scheduleIds: string[] }[];
  conflicts: TSeriesConflict[];
};
