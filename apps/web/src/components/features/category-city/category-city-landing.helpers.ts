import type { TCategoryCityBusiness } from '@/utils/helpers/category-city.helper';

/** "Rua X, São Paulo - SP", omitindo as partes que a loja não preencheu. */
export const formatStoreLocation = ({
  address,
  city,
  state,
}: TCategoryCityBusiness): string => {
  const place = [city, state].filter(Boolean).join(' - ');

  return [address, place].filter(Boolean).join(', ');
};

/** Nome da lista nos eventos `view_item_list` e `select_item`. */
export const CATEGORY_CITY_LIST_NAME = 'category_city';

/** `path` é `/booking/<id>`; o id vira o `item_id` dos eventos. */
export const getStoreIdFromPath = (path: string): string =>
  path.split('/').filter(Boolean).pop() ?? path;
