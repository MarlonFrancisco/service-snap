import { useStoreMemberMutations } from '@/hooks/partner/store/use-store-member-mutations/use-store-member-mutations.hook';
import { useServicesStore, useStoresStore } from '@/store';
import type { IProfessional, IUser } from '@/types/api';
import type { IService } from '@/types/api/service.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIsMobile } from '@repo/ui/index';
import { useCallback, useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import type { TStoreFormSchema } from '../add-store-modal/store-form-tabs/store-form.schema';
import {
  professionalFormSchema,
  type TProfessionalFormSchema,
} from './add-professional.schema';

const toProfessionalFormValues = (
  professional: IProfessional,
): TProfessionalFormSchema => ({
  id: professional.id,
  role: professional.role || 'professional',
  user: {
    email: professional.user.email || '',
  },
  services: professional.services ?? [],
});

export const useAddProfessionalModal = () => {
  const { isAddProfessional, professional, setIsAddProfessional } =
    useStoresStore();
  const { createStoreMemberMutation, updateStoreMemberMutation } =
    useStoreMemberMutations();

  const storeForm = useFormContext<TStoreFormSchema>();

  const form = useForm<TProfessionalFormSchema>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: toProfessionalFormValues(professional),
  });

  const isEditing = !!professional.id;

  useEffect(() => {
    form.reset(toProfessionalFormValues(professional));
  }, [professional, form]);

  const isMobile = useIsMobile();
  const services = useServicesStore((state) => state.services);

  const selectedServices = form.watch('services') || [];

  const addService = (serviceId: string) => {
    if (!selectedServices.some((s) => s.id === serviceId)) {
      const next = [
        ...selectedServices,
        {
          id: serviceId,
          name: services.find((s) => s.id === serviceId)?.name || '',
        },
      ];
      form.setValue('services', next, { shouldDirty: true });
    }
  };

  const removeService = (serviceId: string) => {
    const next = selectedServices.filter((s) => s.id !== serviceId);
    form.setValue('services', next, { shouldDirty: true });
  };

  // Erros aparecem nos próprios campos, via `FormMessage`.
  const handleSubmit = useCallback(() => {
    form.handleSubmit((data) => {
      const fn = isEditing
        ? updateStoreMemberMutation.mutate
        : createStoreMemberMutation.mutate;

      fn(
        {
          storeId: storeForm.getValues('id')!,
          professional: {
            id: data.id || undefined,
            role: data.role,
            user: {
              email: data.user.email,
            } as IUser,
            services: data.services as IService[],
          },
        },
        {
          onSuccess: () => {
            setIsAddProfessional({ isOpen: false });
          },
        },
      );
    })();
  }, [
    form,
    storeForm,
    createStoreMemberMutation,
    updateStoreMemberMutation,
    isEditing,
    setIsAddProfessional,
  ]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) setIsAddProfessional({ isOpen: false });
    },
    [setIsAddProfessional],
  );

  const handleClose = useCallback(() => {
    setIsAddProfessional({ isOpen: false });
  }, [setIsAddProfessional]);

  return {
    form,
    isAddProfessional,
    isEditing,
    isMobile,
    services,
    selectedServices,
    isLoading:
      createStoreMemberMutation.isPending ||
      updateStoreMemberMutation.isPending,
    title: isEditing ? 'Editar profissional' : 'Novo profissional',
    description: isEditing
      ? 'Altere o papel e os serviços. Nome e telefone vêm do cadastro do usuário.'
      : 'Nome e telefone são sincronizados pelo cadastro do usuário.',
    submitLabel: isEditing ? 'Salvar alterações' : 'Adicionar profissional',
    addService,
    removeService,
    handleSubmit,
    handleOpenChange,
    handleClose,
  };
};
