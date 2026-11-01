import type { ICategory, IService } from '@/types/api/service.types';
import type { TServiceSection } from '../services-module.types';

type TBuildServiceSectionsConfig = {
  categories: ICategory[];
  searchQuery: string;
  filterCategory: string;
};

export const ALL_CATEGORIES_FILTER = 'all';

export const formatServiceCount = (count: number) =>
  `${count} ${count === 1 ? 'serviço' : 'serviços'}`;

const matchesSearch = (service: IService, query: string) =>
  (service.name ?? '').toLowerCase().includes(query) ||
  (service.description ?? '').toLowerCase().includes(query);

/**
 * Com busca, só entram categorias com resultado. Sem busca, categorias vazias
 * continuam na lista porque é por elas que se adiciona o primeiro serviço.
 */
export const buildServiceSections = ({
  categories,
  searchQuery,
  filterCategory,
}: TBuildServiceSectionsConfig): TServiceSection[] => {
  const query = searchQuery.trim().toLowerCase();

  return categories
    .filter(
      (category) =>
        filterCategory === ALL_CATEGORIES_FILTER ||
        category.id === filterCategory,
    )
    .map((category) => {
      const services = query
        ? category.services.filter((service) => matchesSearch(service, query))
        : category.services;

      return {
        category,
        services: services.map((service) => ({ ...service, category })),
        activeCount: services.filter((service) => service.isActive).length,
      };
    })
    .filter((section) => !query || section.services.length > 0)
    .sort(
      (a, b) =>
        b.services.length - a.services.length ||
        a.category.name.localeCompare(b.category.name, 'pt-BR'),
    );
};
