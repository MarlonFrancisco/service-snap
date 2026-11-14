import { PARTNER_MUTED_TEXT_CLASS } from '@/components/features/partner/partner.styles';
import { cn, Skeleton, TabsContent } from '@repo/ui';
import { AlertTriangle, Users } from 'lucide-react';
import {
  STORES_COMPACT_PRIMARY_BUTTON_CLASS,
  STORES_TAB_PANEL_CLASS,
} from '../../../../stores-module.styles';
import { PROFESSIONAL_REMOVE_CONSEQUENCE } from '../../../../utils/stores-module.constants';
import { ConfirmDialog } from '../../../confirm-dialog';
import { PlanLimitNotice } from '../../../plan-limit-notice';
import { StatePanel } from '../../../state-panel';
import { ProfessionalCard } from './professional-card';
import { useProfessionalTab } from './professional-tab.hook';
import { TeamRolesTable } from './team-roles-table';

export const ProfessionalTab = () => {
  const {
    professionals,
    isLoadingProfessionals,
    isErrorProfessionals,
    refetchProfessionals,
    professionalsUsage,
    isAddDisabled,
    teamSummary,
    isRemoveDialogOpen,
    removeDialogTitle,
    handleAddProfessional,
    handleUpgrade,
    handleRequestRemove,
    handleRemoveOpenChange,
    handleConfirmRemove,
    handleToggleProfessionalStatus,
  } = useProfessionalTab();

  return (
    <TabsContent value="staff" className={cn(STORES_TAB_PANEL_CLASS, 'gap-3.5')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[17px] font-bold">Equipe da loja</h3>
          <p className={cn('text-sm', PARTNER_MUTED_TEXT_CLASS)}>{teamSummary}</p>
        </div>

        {professionalsUsage?.isAtLimit ? (
          <button
            type="button"
            onClick={handleUpgrade}
            className={cn(
              STORES_COMPACT_PRIMARY_BUTTON_CLASS,
              'w-full sm:w-auto',
            )}
          >
            Fazer upgrade
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleAddProfessional()}
            disabled={isAddDisabled}
            className={cn(
              STORES_COMPACT_PRIMARY_BUTTON_CLASS,
              'w-full sm:w-auto',
            )}
          >
            Adicionar à equipe
          </button>
        )}
      </div>

      {professionalsUsage?.isAtLimit ? (
        <PlanLimitNotice
          description={`Você usa ${professionalsUsage.current} de ${professionalsUsage.limit} profissionais neste plano. Faça upgrade para continuar criando.`}
        />
      ) : null}

      {isLoadingProfessionals ? (
        <div className="grid gap-3" role="status" aria-label="Carregando equipe">
          <Skeleton className="h-[148px] rounded-[20px] bg-[#EBE9F0]" />
          <Skeleton className="h-[148px] rounded-[20px] bg-[#EBE9F0]" />
        </div>
      ) : isErrorProfessionals ? (
        <StatePanel
          tone="error"
          icon={AlertTriangle}
          title="Não foi possível carregar a equipe"
          description="Seus dados continuam salvos. Verifique a conexão e tente de novo."
          actionLabel="Tentar novamente"
          onAction={() => void refetchProfessionals()}
        />
      ) : professionals.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onEdit={handleAddProfessional}
              onToggleStatus={handleToggleProfessionalStatus}
              onRemove={handleRequestRemove}
            />
          ))}
        </div>
      ) : (
        <StatePanel
          icon={Users}
          title="Nenhum profissional na equipe"
          description="Adicione o primeiro profissional desta loja."
        />
      )}

      <TeamRolesTable />

      <ConfirmDialog
        open={isRemoveDialogOpen}
        onOpenChange={handleRemoveOpenChange}
        title={removeDialogTitle}
        description={PROFESSIONAL_REMOVE_CONSEQUENCE}
        cancelLabel="Manter na equipe"
        confirmLabel="Remover da equipe"
        onConfirm={handleConfirmRemove}
      />
    </TabsContent>
  );
};
