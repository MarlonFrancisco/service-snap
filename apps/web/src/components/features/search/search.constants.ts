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

/** Nome da lista de resultados nos eventos `view_item_list` e `select_item`. */
export const SEARCH_LIST_NAME = 'search';
