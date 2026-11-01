import { IService } from '@/types/api/service.types';
import { cn } from '@repo/ui';
import { PARTNER_MUTED_TEXT_CLASS } from '../../../../partner.styles';
import {
  SERVICES_BUTTON_CLASS,
  SERVICES_DANGER_OUTLINE_BUTTON_CLASS,
} from '../../services-module.styles';
import { ServicesConfirmDialog } from '../services-confirm-dialog';
import { useServiceCard } from './service-card.hook';

export const ServiceCard = ({ service }: { service: IService }) => {
  const {
    priceLabel,
    durationLabel,
    isDeleteDialogOpen,
    isDeletingService,
    isUpdatingService,
    setIsDeleteDialogOpen,
    handleEdit,
    handleRequestDelete,
    handleConfirmDelete,
    handleToggleStatus,
  } = useServiceCard({ service });

  return (
    <article className="flex flex-wrap items-center justify-between gap-3.5 border-t border-[#F0EEF4] px-5 py-4">
      <div className="min-w-0">
        <h4 className="flex flex-wrap items-center gap-2 text-[15px] font-bold">
          <span className="min-w-0 break-words">{service.name}</span>
          <span
            className={cn(
              'rounded-full px-[9px] py-[3px] text-xs font-bold',
              service.isActive
                ? 'bg-[#DFF2E7] text-[#0A5536]'
                : 'bg-[#F4F3F7] text-[#5F5C6E]',
            )}
          >
            {service.isActive ? 'Ativo' : 'Inativo'}
          </span>
        </h4>
        {service.description && (
          <p className={cn('mt-0.5 text-[13px]', PARTNER_MUTED_TEXT_CLASS)}>
            {service.description}
          </p>
        )}
        <p className="mt-0.5 text-[13px] font-semibold">
          {priceLabel} · {durationLabel}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          aria-label={`Editar ${service.name}`}
          onClick={handleEdit}
          className={SERVICES_BUTTON_CLASS}
        >
          Editar
        </button>
        <button
          type="button"
          aria-label={`${service.isActive ? 'Desativar' : 'Ativar'} ${service.name}`}
          disabled={isUpdatingService}
          onClick={handleToggleStatus}
          className={SERVICES_BUTTON_CLASS}
        >
          {service.isActive ? 'Desativar' : 'Ativar'}
        </button>
        <button
          type="button"
          aria-label={`Excluir ${service.name}`}
          onClick={handleRequestDelete}
          className={SERVICES_DANGER_OUTLINE_BUTTON_CLASS}
        >
          Excluir
        </button>
      </div>

      <ServicesConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={`Excluir o serviço ${service.name}?`}
        description="Ele deixa de aparecer para novos agendamentos e perde o vínculo com os profissionais. Os agendamentos já feitos com este serviço, passados e futuros, também são apagados: somem da agenda e das métricas, e os clientes não são avisados. Esta ação não pode ser desfeita."
        cancelLabel="Manter serviço"
        confirmLabel="Excluir serviço"
        isPending={isDeletingService}
        onConfirm={handleConfirmDelete}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </article>
  );
};
