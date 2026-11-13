/** Dia em que a loja inteira não atende. */
export interface IStoreHoliday {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  name: string | null;
}
