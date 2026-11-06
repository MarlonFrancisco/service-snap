import { useStoreMemberMutations } from '@/hooks/partner/store/use-store-member-mutations/use-store-member-mutations.hook';
import { useStoreMembersQuery } from '@/hooks/use-query/use-store-members-query';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useStoresStore } from '@/store';
import type { IProfessional } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { PLAN_UPGRADE_ROUTE } from '../../../../utils/stores-module.constants';
import {
  getPlanUsage,
  getProfessionalName,
} from '../../../../utils/stores-module.helpers';
import type { TStoreFormSchema } from '../store-form.schema';

const getTeamSummary = (count: number) =>
  `${count} ${count === 1 ? 'profissional' : 'profissionais'} nesta loja`;

export const useProfessionalTab = () => {
  const { updateStoreMemberMutation, deleteStoreMemberMutation } =
    useStoreMemberMutations();
  const { setIsAddProfessional } = useStoresStore();
  const { currentPlan } = useSubscriptionQuery();
  const router = useRouter();
  const [professionalToRemove, setProfessionalToRemove] =
    useState<IProfessional | null>(null);

  const form = useFormContext<TStoreFormSchema>();
  const storeId = form.watch('id');

  const { storeMembers, isPendingStoreMembers, isError, refetch } =
    useStoreMembersQuery({
      storeId,
      enabled: !!storeId,
    });

  const professionalsUsage = useMemo(
    () =>
      currentPlan
        ? getPlanUsage(
            currentPlan.storeMembersLength,
            currentPlan.features.PRO_LIMIT,
          )
        : null,
    [currentPlan],
  );

  const analytics = useAnalytics();
  const hasTrackedLimitRef = useRef(false);

  // No limite o botão de adicionar dá lugar ao upgrade: conta quando aparece.
  useEffect(() => {
    if (!professionalsUsage?.isAtLimit || hasTrackedLimitRef.current) return;
    hasTrackedLimitRef.current = true;

    analytics.track('plan_limit_reached', {
      limit_type: 'professionals',
      current: professionalsUsage.current,
      limit: professionalsUsage.limit,
      source: 'store_form',
    });
  }, [professionalsUsage, analytics]);

  const isLoadingProfessionals = !!storeId && isPendingStoreMembers;

  const handleAddProfessional = useCallback(
    (professional?: IProfessional) => {
      if (!professional && professionalsUsage?.isAtLimit) {
        return;
      }
      setIsAddProfessional({ isOpen: true, professional });
    },
    [setIsAddProfessional, professionalsUsage?.isAtLimit],
  );

  const handleUpgrade = useCallback(() => {
    router.push(PLAN_UPGRADE_ROUTE);
  }, [router]);

  const handleRemoveOpenChange = useCallback((open: boolean) => {
    if (!open) setProfessionalToRemove(null);
  }, []);

  const handleConfirmRemove = useCallback(() => {
    if (!storeId || !professionalToRemove) return;

    deleteStoreMemberMutation.mutate(
      {
        storeId,
        professionalId: professionalToRemove.id,
      },
      {
        onSuccess: () => {
          setIsAddProfessional({ isOpen: false });
        },
      },
    );
  }, [
    storeId,
    professionalToRemove,
    deleteStoreMemberMutation,
    setIsAddProfessional,
  ]);

  const handleToggleProfessionalStatus = useCallback(
    (professional: IProfessional) => {
      if (!storeId) return;

      updateStoreMemberMutation.mutate({
        storeId,
        professional: {
          id: professional.id,
          isActive: !professional.isActive,
        },
      });
    },
    [storeId, updateStoreMemberMutation],
  );

  const removalName = professionalToRemove
    ? getProfessionalName(professionalToRemove) ||
      professionalToRemove.user.email
    : 'este profissional';

  const statusSummary = isLoadingProfessionals
    ? 'Carregando profissionais...'
    : isError
      ? 'Não foi possível carregar a equipe'
      : getTeamSummary(storeMembers.length);

  return {
    professionals: storeMembers,
    isLoadingProfessionals,
    isErrorProfessionals: isError,
    refetchProfessionals: refetch,
    professionalsUsage,
    isAddDisabled: isLoadingProfessionals || isError,
    teamSummary:
      professionalsUsage && !isLoadingProfessionals
        ? `${statusSummary} · ${professionalsUsage.label}`
        : statusSummary,
    isRemoveDialogOpen: !!professionalToRemove,
    removeDialogTitle: `Remover ${removalName} da equipe?`,
    handleAddProfessional,
    handleUpgrade,
    handleRequestRemove: setProfessionalToRemove,
    handleRemoveOpenChange,
    handleConfirmRemove,
    handleToggleProfessionalStatus,
  };
};
