import { useStoreMemberMutations } from '@/hooks/partner/store/use-store-member-mutations/use-store-member-mutations.hook';
import { useStoreMembersQuery } from '@/hooks/use-query/use-store-members-query';
import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
import { useStoresStore } from '@/store';
import { IProfessional } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { TStoreFormSchema } from '../store-form.schema';

export const useProfessionalTab = () => {
  const { updateStoreMemberMutation, deleteStoreMemberMutation } =
    useStoreMemberMutations();
  const { setIsAddProfessional } = useStoresStore();
  const { currentPlan } = useSubscriptionQuery();
  const router = useRouter();

  const form = useFormContext<TStoreFormSchema>();
  const storeId = form.watch('id');

  const { storeMembers, isPendingStoreMembers, isError, refetch } =
    useStoreMembersQuery({
      storeId,
      enabled: !!storeId,
    });

  const professionalsUsage = useMemo(() => {
    if (!currentPlan) return null;

    const limit = currentPlan.features.PRO_LIMIT;
    const isUnlimited = limit === 0;
    const current = currentPlan.storeMembersLength;
    const isAtLimit = !isUnlimited && current >= limit;

    return {
      current,
      limit,
      isUnlimited,
      isAtLimit,
      label: isUnlimited
        ? `${current}/∞ no plano`
        : `${current}/${limit} no plano`,
    };
  }, [currentPlan]);

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
    router.push('/partner/plans/upgrade');
  }, [router]);

  const handleDeleteProfessional = useCallback(
    (professionalId: string) => {
      if (!storeId) return;

      deleteStoreMemberMutation.mutate(
        {
          storeId,
          professionalId,
        },
        {
          onSuccess: () => {
            setIsAddProfessional({ isOpen: false });
          },
        },
      );
    },
    [storeId, deleteStoreMemberMutation, setIsAddProfessional],
  );

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

  return {
    professionals: storeMembers,
    isLoadingProfessionals: !!storeId && isPendingStoreMembers,
    isErrorProfessionals: isError,
    refetchProfessionals: refetch,
    professionalsUsage,
    handleAddProfessional,
    handleUpgrade,
    handleDeleteProfessional,
    handleToggleProfessionalStatus,
  };
};
