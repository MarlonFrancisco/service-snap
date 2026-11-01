import { useEffect, useState } from 'react';
import type { TLegalTocItem } from '../legal-document.types';

/** Faixa logo abaixo do header fixo onde a seção é considerada a atual. */
const ACTIVE_BAND_ROOT_MARGIN = '-112px 0px -70% 0px';

export const useLegalToc = (items: TLegalTocItem[]) => {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entered = entries.find((entry) => entry.isIntersecting);
        if (entered) setActiveId(entered.target.id);
      },
      { rootMargin: ACTIVE_BAND_ROOT_MARGIN },
    );

    items.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [items]);

  return { activeId, handleSelect: setActiveId };
};
