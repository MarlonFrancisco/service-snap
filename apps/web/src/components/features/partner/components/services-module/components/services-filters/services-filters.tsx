import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_PORTAL_CLASS,
} from '../../../../partner.styles';
import {
  SERVICES_BUTTON_CLASS,
  SERVICES_PRIMARY_BUTTON_CLASS,
} from '../../services-module.styles';
import { getCategoryColor } from '../../utils/colors';
import { ALL_CATEGORIES_FILTER } from '../../utils/services-sections';
import { useServicesFilters } from './services-filters.hook';

const TOOLBAR_BUTTON_CLASS = 'min-h-12 grow sm:grow-0';

export const ServicesFilters = () => {
  const {
    searchQuery,
    categories,
    filterCategory,
    hasActiveFilters,
    setFilterCategory,
    handleSearchChange,
    handleClearFilters,
    handleManageCategories,
    handleAddService,
  } = useServicesFilters();

  return (
    <div className="flex flex-wrap gap-2">
      <input
        type="search"
        aria-label="Buscar serviços"
        placeholder="Buscar serviços por nome ou descrição..."
        value={searchQuery}
        onChange={handleSearchChange}
        className={cn(
          'h-12 min-w-0 flex-[1_1_260px] rounded-full border border-[#E3E1EA] bg-white px-[18px] text-sm font-medium text-[#0B0B0F] placeholder:text-[#6F6C7E]',
          PARTNER_FOCUS_CLASS,
        )}
      />

      <Select value={filterCategory} onValueChange={setFilterCategory}>
        <SelectTrigger
          aria-label="Filtrar por categoria"
          className="grow rounded-full border-[#E3E1EA] bg-white px-[18px] text-[13px] font-semibold text-[#0B0B0F] shadow-none hover:bg-[#F7F6FA] focus-visible:ring-2 focus-visible:ring-[#0B0B0F] data-[size=default]:h-12 sm:grow-0"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={PARTNER_PORTAL_CLASS}>
          <SelectItem value={ALL_CATEGORIES_FILTER} className="min-h-11">
            Todas as categorias
          </SelectItem>
          {categories.map((category) => (
            <SelectItem
              key={category.id}
              value={category.id}
              className="min-h-11"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'size-2.5 shrink-0 rounded-full',
                  getCategoryColor(category.color).swatchClass,
                )}
              />
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearFilters}
          className={cn(SERVICES_BUTTON_CLASS, TOOLBAR_BUTTON_CLASS)}
        >
          Limpar filtros
        </button>
      )}

      <button
        type="button"
        onClick={handleManageCategories}
        className={cn(SERVICES_BUTTON_CLASS, TOOLBAR_BUTTON_CLASS)}
      >
        Gerenciar categorias
      </button>

      <button
        type="button"
        onClick={handleAddService}
        className={cn(SERVICES_PRIMARY_BUTTON_CLASS, TOOLBAR_BUTTON_CLASS, 'px-[18px]')}
      >
        Adicionar serviço
      </button>
    </div>
  );
};
