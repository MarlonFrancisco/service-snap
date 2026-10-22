import { useStoreMemberMutations } from '@/hooks/partner/store/use-store-member-mutations/use-store-member-mutations.hook';
import { useServicesStore, useStoresStore } from '@/store';
import { IUser } from '@/types/api';
import { IService } from '@/types/api/service.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIsMobile } from '@repo/ui/index';
import { useCallback, useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { TStoreFormSchema } from '../add-store-modal/store-form-tabs/store-form.schema';
import {
  professionalFormSchema,
  TProfessionalFormSchema,
} from './add-professional.schema';

export const useAddProfessionalModal = () => {
  const { isAddProfessional, professional, setIsAddProfessional } =
    useStoresStore();
  const { createStoreMemberMutation, updateStoreMemberMutation } =
    useStoreMemberMutations();

  const storeForm = useFormContext<TStoreFormSchema>();

  const form = useForm<TProfessionalFormSchema>({
    resolver: zodResolver(professionalFormSchema),
  });

  const isEditing = !!professional.id;

  useEffect(() => {
    form.reset({
      id: professional.id,
      role: professional.role || 'professional',
      user: {
        email: professional.user.email || '',
      },
      services: professional.services,
    });
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

  const handleSubmit = useCallback(() => {
    const asyncFn = async () => {
      const data = form.getValues();

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
    };

    form.handleSubmit(asyncFn, (errors) => {
      const firstError = Object.values(errors)[0]?.message;
      if (firstError) {
        toast.error(firstError);
      }
    })();
  }, [
    form,
    storeForm,
    createStoreMemberMutation,
    updateStoreMemberMutation,
    isEditing,
    setIsAddProfessional,
  ]);

  const handleClose = useCallback(() => {
    setIsAddProfessional({ isOpen: false });
  }, [setIsAddProfessional]);

  return {
    form,
    isAddProfessional,
    professional,
    isEditing,
    isMobile,
    services,
    selectedServices,
    isLoading:
      createStoreMemberMutation.isPending ||
      updateStoreMemberMutation.isPending,
    addService,
    removeService,
    handleSubmit,
    handleClose,
  };
};
