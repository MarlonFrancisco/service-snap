import { useMemo, useState } from 'react';
import {
  ALL_BUSINESS_TYPES,
  FEATURED_BUSINESS_TYPES,
} from '../../partner-onboarding.constants';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export const useWelcomeStep = (selected: string | null) => {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const query = normalize(search);

  const options = useMemo(() => {
    if (query) {
      return ALL_BUSINESS_TYPES.filter((type) =>
        normalize(type).includes(query),
      );
    }

    const list: string[] = showAll
      ? [...ALL_BUSINESS_TYPES]
      : [...FEATURED_BUSINESS_TYPES];

    // Quem escolheu pela busca continua vendo a própria escolha selecionada.
    return selected && !list.includes(selected) ? [selected, ...list] : list;
  }, [query, showAll, selected]);

  const customType = search.trim();

  return {
    search,
    setSearch,
    options,
    canShowAll: !query && !showAll,
    showAllTypes: () => setShowAll(true),
    // Nenhum tipo cobre todo negócio: quem não se encontra usa o que digitou.
    customType: query && !options.length ? customType : null,
  };
};
