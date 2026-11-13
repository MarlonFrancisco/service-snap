import type { TSearchRatingOption } from '../../../search.types';

export type TRatingFilterConfig = {
  /** Valor marcado no menu (`any` quando não há nota mínima). */
  value: string;
  /** Rótulo do chip: `Nota 4,5+` ou `Nota`. */
  label: string;
  isActive: boolean;
  options: ReadonlyArray<TSearchRatingOption>;
  onValueChange: (value: string) => void;
};
