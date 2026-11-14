'use client';

import { usePackagesMutations } from '@/hooks/partner/use-packages-mutations';
import { isApiHttpError } from '@/service/api';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { MAX_PACKAGE_ITEMS } from '../../packages-module.helpers';
import { useStoreServiceOptions } from '../../packages-module.hook';
import {
  toPackageFormValues,
  toPackagePayload,
} from './package-form-dialog.helpers';
import {
  PACKAGE_FORM_EMPTY_ITEM,
  packageFormSchema,
  type TPackageFormSchema,
} from './package-form-dialog.schema';
import type { TUsePackageFormDialogConfig } from './package-form-dialog.types';

const getSaveError = (error: unknown) => {
  if (isApiHttpError(error) && error.status === 403) {
    return 'Só o dono e o gerente da loja mexem nos pacotes.';
  }
  if (isApiHttpError(error) && error.status === 400) {
    return 'Confira os serviços e os valores do pacote.';
  }

  return 'Não foi possível salvar o pacote. Tente de novo.';
};

export const usePackageFormDialog = ({
  storeId,
  isOpen,
  onOpenChange,
  servicePackage,
}: TUsePackageFormDialogConfig) => {
  const isEditing = !!servicePackage;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { serviceOptions, isLoadingServices } = useStoreServiceOptions(
    storeId,
    isOpen,
  );
  const { createPackageMutation, updatePackageMutation } = usePackagesMutations(
    { storeId },
  );
  const isSubmitting =
    createPackageMutation.isPending || updatePackageMutation.isPending;

  const form = useForm<TPackageFormSchema>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: toPackageFormValues(servicePackage),
  });
  const items = useFieldArray({ control: form.control, name: 'items' });

  // Cada abertura começa do pacote escolhido (ou em branco)
  useEffect(() => {
    if (isOpen) {
      form.reset(toPackageFormValues(servicePackage));
      setSubmitError(null);
    }
  }, [isOpen, servicePackage, form]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isSubmitting) return;
      onOpenChange(nextOpen);
    },
    [onOpenChange, isSubmitting],
  );

  const handleAddItem = useCallback(() => {
    if (items.fields.length < MAX_PACKAGE_ITEMS) {
      items.append(PACKAGE_FORM_EMPTY_ITEM);
    }
  }, [items]);

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);

    void form.handleSubmit((values) => {
      const payload = toPackagePayload(values);
      const callbacks = {
        onSuccess: () => {
          toast.success(isEditing ? 'Pacote salvo' : 'Pacote criado');
          onOpenChange(false);
        },
        onError: (error: unknown) => setSubmitError(getSaveError(error)),
      };

      if (servicePackage) {
        updatePackageMutation.mutate(
          {
            id: servicePackage.id,
            changes: {
              ...payload,
              // Na edição, apagar a descrição precisa chegar na API
              description: values.description.trim(),
              isActive: values.isActive,
            },
          },
          callbacks,
        );
        return;
      }

      createPackageMutation.mutate(payload, callbacks);
    })(event);
  };

  return {
    form,
    isEditing,
    title: isEditing ? 'Editar pacote' : 'Novo pacote',
    submitLabel: isEditing ? 'Salvar pacote' : 'Criar pacote',
    validityHint: 'Em dias, a partir da venda. Vazio: não vence.',
    itemFields: items.fields,
    itemsError:
      form.formState.errors.items?.root?.message ??
      form.formState.errors.items?.message,
    canAddItem: items.fields.length < MAX_PACKAGE_ITEMS,
    handleAddItem,
    handleRemoveItem: items.remove,
    serviceOptions: serviceOptions.map((option) => ({
      id: option.id,
      label: option.isActive ? option.name : `${option.name} (inativo)`,
    })),
    isLoadingServices,
    submitError,
    isSubmitting,
    handleOpenChange,
    handleSubmit,
  };
};
