import { cn } from '@repo/ui';
import { BriefcaseBusiness, Search, Store } from 'lucide-react';
import Link from 'next/link';
import {
  SERVICES_BUTTON_CLASS,
  SERVICES_PRIMARY_BUTTON_CLASS,
} from '../../services-module.styles';
import { ServicesStatePanel } from '../services-state-panel';

type TEmptyServicesListConfig =
  | { variant: 'empty'; onAddService: () => void }
  | { variant: 'no-results'; onClearFilters: () => void }
  | { variant: 'no-store' };

const ACTION_CLASS = 'mt-1.5 px-[18px]';

export const EmptyServicesList = (config: TEmptyServicesListConfig) => {
  if (config.variant === 'no-store') {
    return (
      <ServicesStatePanel
        icon={Store}
        title="Nenhuma loja cadastrada"
        description="Você ainda não cadastrou nenhuma loja. Adicione a primeira para começar a receber agendamentos."
      >
        <Link
          href="/partner/stores"
          className={cn(SERVICES_PRIMARY_BUTTON_CLASS, ACTION_CLASS)}
        >
          Adicionar nova loja
        </Link>
      </ServicesStatePanel>
    );
  }

  if (config.variant === 'no-results') {
    return (
      <ServicesStatePanel
        icon={Search}
        title="Nenhum serviço encontrado"
        description="Tente ajustar os filtros ou fazer uma nova busca."
      >
        <button
          type="button"
          onClick={config.onClearFilters}
          className={cn(SERVICES_BUTTON_CLASS, ACTION_CLASS, 'font-bold')}
        >
          Limpar filtros
        </button>
      </ServicesStatePanel>
    );
  }

  return (
    <ServicesStatePanel
      icon={BriefcaseBusiness}
      title="Nenhum serviço cadastrado"
      description="Comece adicionando seu primeiro serviço."
    >
      <button
        type="button"
        onClick={config.onAddService}
        className={cn(SERVICES_PRIMARY_BUTTON_CLASS, ACTION_CLASS)}
      >
        Adicionar primeiro serviço
      </button>
    </ServicesStatePanel>
  );
};
