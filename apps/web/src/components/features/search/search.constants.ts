export const SERVICE_CATEGORIES = [
  'Salão de Beleza',
  'Barbearia',
  'Spa & Massagem',
  'Odontologia',
  'Personal Trainer',
  'Estética',
] as const;

export const LOCATIONS = [
  { value: '', label: 'Todas as localidades' },
  { value: 'sao-paulo', label: 'São Paulo, SP' },
  { value: 'rio-janeiro', label: 'Rio de Janeiro, RJ' },
  { value: 'belo-horizonte', label: 'Belo Horizonte, MG' },
  { value: 'porto-alegre', label: 'Porto Alegre, RS' },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: 'any', label: 'Qualquer horário' },
  { value: 'today', label: 'Hoje' },
  { value: 'tomorrow', label: 'Amanhã' },
  { value: 'weekend', label: 'Este fim de semana' },
] as const;

export const RATING_OPTIONS = [
  { value: '0', label: 'Todas as avaliações' },
  { value: '3', label: '3+ estrelas' },
  { value: '4', label: '4+ estrelas' },
  { value: '4.5', label: '4.5+ estrelas' },
] as const;

export const PRICE_RANGE_LIMITS = {
  min: 0,
  max: 500,
  step: 10,
} as const;

/** Notas mínimas que a API aceita; qualquer outro valor da URL é ignorado. */
export const SEARCH_MIN_RATING_VALUES = [
  '1',
  '2',
  '3',
  '4',
  '4.5',
  '5',
] as const;

/** Opções do chip "Nota" na linha de filtros. */
export const SEARCH_RATING_FILTER_OPTIONS = [
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '4.5', label: '4,5+' },
] as const;

/** Valor do item "Qualquer nota", que remove o filtro de nota. */
export const SEARCH_RATING_ANY_VALUE = 'any';

/** Nomes dos filtros na query string de `/booking`. */
export const SEARCH_FILTER_PARAMS = {
  minRating: 'minRating',
  availableToday: 'availableToday',
} as const;

/** Nome da lista de resultados nos eventos `view_item_list` e `select_item`. */
export const SEARCH_LIST_NAME = 'search';
