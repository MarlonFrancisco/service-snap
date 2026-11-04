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
