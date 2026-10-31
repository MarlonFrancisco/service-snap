import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { MARKETPLACE_CATEGORIES } from '../../homepage-v2.mock';

export const useCategoryRail = () => {
  const router = useRouter();
  const [activeId, setActiveId] = useState(MARKETPLACE_CATEGORIES[0]?.id);

  const selectCategory = useCallback(
    (id: string, query: string) => {
      setActiveId(id);
      const params = new URLSearchParams({ query, category: query });
      router.push(`/booking?${params.toString()}`);
    },
    [router],
  );

  return { activeId, selectCategory };
};
