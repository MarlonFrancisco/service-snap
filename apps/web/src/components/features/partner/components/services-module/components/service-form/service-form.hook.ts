import { useServicesStore } from '@/store';
import { IService } from '@/types/api/service.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { serviceFormSchema, TServiceFormData } from './service-form.schema';

const DEFAULT_SERVICE_DURATION_MINUTES = 30;

const toServiceFormValues = (service: IService): TServiceFormData => ({
  id: service.id,
  name: service.name ?? '',
  description: service.description ?? '',
  duration: service.duration || DEFAULT_SERVICE_DURATION_MINUTES,
  price: service.price,
  // Sem `id` vazio o erro cairia em `category`, fora do campo `category.id`.
  category: { id: service.category?.id ?? '' },
  isActive: service.isActive,
});

export const useServiceForm = () => {
  const service = useServicesStore((state) => state.service);
  const isServiceModalOpen = useServicesStore(
    (state) => state.isServiceModalOpen,
  );
  const setServiceModalParams = useServicesStore(
    (state) => state.setServiceModalParams,
  );

  const form = useForm<TServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: toServiceFormValues(service),
  });

  // Reabrir "Novo serviço" mantém o mesmo objeto no store: depender só de
  // `service` deixaria no formulário o que foi digitado na vez anterior.
  useEffect(() => {
    if (isServiceModalOpen) {
      form.reset(toServiceFormValues(service));
    }
  }, [service, isServiceModalOpen, form]);

  const handleClose = () => {
    setServiceModalParams({ isOpen: false });
  };

  const isEditing = !!service.id;

  return {
    form,
    isEditing,
    serviceName: service.name,
    isServiceModalOpen,
    handleClose,
  };
};
