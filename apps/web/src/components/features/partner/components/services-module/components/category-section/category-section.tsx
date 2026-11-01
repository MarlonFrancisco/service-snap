import { cn } from '@repo/ui';
import {
  PARTNER_MUTED_TEXT_CLASS,
} from '../../../../partner.styles';
import { SERVICES_BUTTON_CLASS } from '../../services-module.styles';
import type { TServiceSection } from '../../services-module.types';
import { getCategoryColor } from '../../utils/colors';
import { ServiceCard } from '../service-card';
import { useCategorySection } from './category-section.hook';

export const CategorySection = ({ section }: { section: TServiceSection }) => {
  const { isEmpty, summaryLabel, handleQuickAdd } = useCategorySection({
    section,
  });
  const { category, services } = section;
  const titleId = `service-category-${category.id}`;

  return (
    <section
      aria-labelledby={titleId}
      className="overflow-hidden rounded-[22px] border border-[#EBE9F0]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#F7F6FA] px-5 py-3.5">
        <div className="min-w-0">
          <h3
            id={titleId}
            className="flex items-center gap-2 text-base font-extrabold"
          >
            <span
              aria-hidden="true"
              className={cn(
                'size-2.5 shrink-0 rounded-full',
                getCategoryColor(category.color).swatchClass,
              )}
            />
            <span className="min-w-0 break-words">{category.name}</span>
          </h3>
          <p className={cn('text-[13px]', PARTNER_MUTED_TEXT_CLASS)}>
            {summaryLabel}
          </p>
        </div>
        <button
          type="button"
          aria-label={`Adicionar nesta categoria: ${category.name}`}
          onClick={handleQuickAdd}
          className={SERVICES_BUTTON_CLASS}
        >
          Adicionar nesta categoria
        </button>
      </div>

      {isEmpty ? (
        <p
          className={cn(
            'border-t border-[#F0EEF4] px-5 py-4 text-[13px]',
            PARTNER_MUTED_TEXT_CLASS,
          )}
        >
          Nenhum serviço nesta categoria ainda.
        </p>
      ) : (
        services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))
      )}
    </section>
  );
};
