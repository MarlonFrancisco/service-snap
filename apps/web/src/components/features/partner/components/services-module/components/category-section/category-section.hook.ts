import { useServicesStore } from '@/store';
import { INITIAL_SERVICE } from '@/store/admin/services/services.constants';
import type { TServiceSection } from '../../services-module.types';
import { formatServiceCount } from '../../utils/services-sections';

export const useCategorySection = ({ section }: { section: TServiceSection }) => {
  const setServiceModalParams = useServicesStore(
    (state) => state.setServiceModalParams,
  );

  const { category, services, activeCount } = section;
  const isEmpty = services.length === 0;

  const summaryLabel = isEmpty
    ? 'Nenhum serviço'
    : `${formatServiceCount(services.length)} · ${activeCount} ${
        activeCount === 1 ? 'ativo' : 'ativos'
      }`;

  const handleQuickAdd = () => {
    setServiceModalParams({
      isOpen: true,
      service: { ...INITIAL_SERVICE, category },
    });
  };

  return {
    isEmpty,
    summaryLabel,
    handleQuickAdd,
  };
};
