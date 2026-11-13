'use client';

import { useCustomersMutations } from '@/hooks/partner/use-customers-mutations';
import { isApiHttpError } from '@/service/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  NEW_CUSTOMER_EMPTY_VALUES,
  newCustomerSchema,
  type TNewCustomerSchema,
} from './new-customer-dialog.schema';
import type { TUseNewCustomerDialogConfig } from './new-customer-dialog.types';

const getCreateCustomerError = (error: unknown) => {
  if (isApiHttpError(error) && error.status === 403) {
    return 'Só o dono e o gerente da loja cadastram clientes.';
  }
  if (isApiHttpError(error) && error.status === 400) {
    return 'Confira os dados: precisa de nome e de telefone ou e-mail válidos.';
  }

  return 'Não foi possível cadastrar o cliente. Tente de novo.';
};

export const useNewCustomerDialog = ({
  storeId,
  isOpen,
  onOpenChange,
}: TUseNewCustomerDialogConfig) => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createCustomerMutation } = useCustomersMutations({ storeId });

  const form = useForm<TNewCustomerSchema>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: NEW_CUSTOMER_EMPTY_VALUES,
  });

  // Cada abertura começa limpa
  useEffect(() => {
    if (isOpen) {
      form.reset(NEW_CUSTOMER_EMPTY_VALUES);
      setSubmitError(null);
    }
  }, [isOpen, form]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && createCustomerMutation.isPending) return;
      onOpenChange(nextOpen);
    },
    [onOpenChange, createCustomerMutation.isPending],
  );

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    setSubmitError(null);

    void form.handleSubmit((data) => {
      createCustomerMutation.mutate(
        {
          firstName: data.firstName,
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.telephone && { telephone: data.telephone }),
          ...(data.email && { email: data.email }),
        },
        {
          onSuccess: (customer) => {
            toast.success('Cliente cadastrado');
            onOpenChange(false);
            router.push(`/partner/clientes/${customer.id}`);
          },
          onError: (error) => setSubmitError(getCreateCustomerError(error)),
        },
      );
    })(event);
  };

  return {
    form,
    submitError,
    isSubmitting: createCustomerMutation.isPending,
    handleOpenChange,
    handleSubmit,
  };
};
