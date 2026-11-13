import { useStoreMemberMutations } from '@/hooks/partner/store/use-store-member-mutations/use-store-member-mutations.hook';
import { isApiHttpError } from '@/service/api';
import { useServicesStore, useStoresStore } from '@/store';
import type { IProfessional, IUser } from '@/types/api';
import type { IService } from '@/types/api/service.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIsMobile } from '@repo/ui/index';
import { useCallback, useEffect, useState } from 'react';
import { useForm, useFormContext, type FieldErrors } from 'react-hook-form';
import { getProfessionalName } from '../../utils/stores-module.helpers';
import type { TStoreFormSchema } from '../add-store-modal/store-form-tabs/store-form.schema';
import { PROFESSIONAL_MODAL_TABS } from './add-professional-modal.constants';
import {
  splitFullName,
  toProfessionalFormValues,
  toWorkingHoursPayload,
} from './add-professional-modal.helpers';
import type {
  TProfessionalModalTab,
  TStoreHoursReference,
} from './add-professional-modal.types';
import {
  professionalFormSchema,
  type TProfessionalFormSchema,
} from './add-professional.schema';

export const useAddProfessionalModal = () => {
  const { isAddProfessional, professional, setIsAddProfessional, store } =
    useStoresStore();
  const { createStoreMemberMutation, updateStoreMemberMutation } =
    useStoreMemberMutations();
  const [activeTab, setActiveTab] = useState<TProfessionalModalTab>('data');

  const storeForm = useFormContext<TStoreFormSchema>();

  // O horário salvo da loja: é dele que o profissional herda dias e horas.
  const getStoreHours = useCallback(
    (): TStoreHoursReference => ({
      openTime: storeForm.getValues('openTime'),
      closeTime: storeForm.getValues('closeTime'),
      lunchStartTime: storeForm.getValues('lunchStartTime'),
      lunchEndTime: storeForm.getValues('lunchEndTime'),
      businessDays: storeForm.getValues('businessDays'),
    }),
    [storeForm],
  );

  const form = useForm<TProfessionalFormSchema>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: toProfessionalFormValues(professional, getStoreHours()),
  });

  const isEditing = !!professional.id;
  const canGrantOwner = store.memberRole === 'owner';

  useEffect(() => {
    form.reset(toProfessionalFormValues(professional, getStoreHours()));
    setActiveTab('data');
  }, [professional, form, getStoreHours]);

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

  const handleClose = useCallback(() => {
    setIsAddProfessional({ isOpen: false });
  }, [setIsAddProfessional]);

  const submitCreate = useCallback(
    (data: TProfessionalFormSchema, storeId: string) => {
      const email = data.user.email.trim();
      const name = data.user.name.trim();

      createStoreMemberMutation.mutate(
        {
          storeId,
          professional: {
            role: data.role,
            user: {
              email,
              ...(name ? splitFullName(name) : {}),
            } as IUser,
            services: data.services as IService[],
          },
        },
        {
          onSuccess: handleClose,
          onError: (error) => {
            // 409: a pessoa já está na equipe; o aviso fica no campo de e-mail
            if (isApiHttpError(error) && error.status === 409) {
              form.setError('user.email', {
                message: 'Esta pessoa já faz parte da equipe',
              });
              form.setFocus('user.email');
            }
          },
        },
      );
    },
    [createStoreMemberMutation, form, handleClose],
  );

  const submitUpdate = useCallback(
    (data: TProfessionalFormSchema, storeId: string) => {
      const { dirtyFields } = form.formState;
      const isHoursDirty = !!dirtyFields.hoursMode || !!dirtyFields.days;

      updateStoreMemberMutation.mutate(
        {
          storeId,
          professional: {
            id: data.id,
            // Reenviar o papel de um sócio pediria permissão de dono
            ...(dirtyFields.role ? { role: data.role } : {}),
            services: data.services as IService[],
            ...(isHoursDirty
              ? { workingHours: toWorkingHoursPayload(data) }
              : {}),
          } as Partial<IProfessional>,
        },
        { onSuccess: handleClose },
      );
    },
    [form, updateStoreMemberMutation, handleClose],
  );

  const handleInvalid = useCallback(
    (errors: FieldErrors<TProfessionalFormSchema>) => {
      if (!isEditing) return;

      // Erros aparecem nos campos; abre a aba onde está o primeiro.
      if (errors.user || errors.role) setActiveTab('data');
      else if (errors.services) setActiveTab('services');
      else if (errors.days) setActiveTab('hours');
    },
    [isEditing],
  );

  const handleSubmit = useCallback(() => {
    form.handleSubmit((data) => {
      const storeId = storeForm.getValues('id')!;

      if (isEditing) submitUpdate(data, storeId);
      else submitCreate(data, storeId);
    }, handleInvalid)();
  }, [form, storeForm, isEditing, submitCreate, submitUpdate, handleInvalid]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) setIsAddProfessional({ isOpen: false });
    },
    [setIsAddProfessional],
  );

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TProfessionalModalTab);
  }, []);

  const professionalName =
    getProfessionalName(professional) || professional.user.email;

  return {
    form,
    isAddProfessional,
    isEditing,
    isMobile,
    services,
    selectedServices,
    canGrantOwner,
    tabs: PROFESSIONAL_MODAL_TABS,
    activeTab,
    isLoading:
      createStoreMemberMutation.isPending ||
      updateStoreMemberMutation.isPending,
    title: isEditing ? 'Editar profissional' : 'Adicionar à equipe',
    description: isEditing
      ? [professionalName, store.name].filter(Boolean).join(' · ')
      : 'Quem entra na equipe não precisa de assinatura própria.',
    submitLabel: isEditing ? 'Salvar' : 'Adicionar e convidar',
    addService,
    removeService,
    handleSubmit,
    handleOpenChange,
    handleTabChange,
    handleClose,
  };
};
