export interface ISearchFilters {
  categories?: string[];
  priceRange?: [number, number];
  rating?: number;
  availability?: string;
  query?: string;
  location?: string;
  /** Explicit category constraint (prefer over free-text alone) */
  category?: string;
  date?: Date;
}
