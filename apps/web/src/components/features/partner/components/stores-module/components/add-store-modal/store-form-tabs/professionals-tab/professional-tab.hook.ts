import { useStoreMemberMutations } from '@/hooks/partner/store/use-store-member-mutations/use-store-member-mutations.hook';
import { useStoreMembersQuery } from '@/hooks/use-query/use-store-members-query';
import { useStoresStore } from '@/store';
import { IProfessional } from '@/types/api';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { TStoreFormSchema } from '../store-form.schema';

export const useProfessionalTab = () => {
  const { updateStoreMemberMutation, deleteStoreMemberMutation } =
    useStoreMemberMutations();
  const { setIsAddProfessional } = useStoresStore();

  const form = useFormContext<TStoreFormSchema>();
  const storeId = form.watch('id');

  const { storeMembers, isPendingStoreMembers } = useStoreMembersQuery({
    storeId,
    enabled: !!storeId,
  });

  const handleAddProfessional = useCallback(
    (professional?: IProfessional) => {
      setIsAddProfessional({ isOpen: true, professional });
    },
    [setIsAddProfessional],
  );

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
    handleAddProfessional,
    handleDeleteProfessional,
    handleToggleProfessionalStatus,
  };
};
