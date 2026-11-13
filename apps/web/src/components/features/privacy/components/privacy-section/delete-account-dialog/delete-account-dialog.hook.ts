'use client';

import { useAnalytics } from '@/providers/analytics.provider';
import {
  isActiveSubscriptionConflict,
  PrivacyService,
} from '@/service/privacy';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { isDeleteConfirmed } from '../../../privacy.helpers';
import type { TDeleteAccountDialogConfig } from './delete-account-dialog.types';

export const useDeleteAccountDialog = ({
  isOpen,
  onOpenChange,
  onSubscriptionConflict,
}: TDeleteAccountDialogConfig) => {
  const [confirmation, setConfirmation] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const analytics = useAnalytics();

  const deleteAccountMutation = useMutation({
    mutationFn: () => PrivacyService.deleteAccount(),
  });
  const isDeleting = deleteAccountMutation.isPending;

  // Cada abertura começa sem a palavra digitada
  useEffect(() => {
    if (isOpen) {
      setConfirmation('');
      setSubmitError(null);
    }
  }, [isOpen]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isDeleting) return;
      onOpenChange(nextOpen);
    },
    [onOpenChange, isDeleting],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isDeleteConfirmed(confirmation) || isDeleting) return;

    setSubmitError(null);
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        analytics.track('account_deleted', {});
        analytics.reset();
        queryClient.clear();
        toast.success('Conta excluída');
        // A API já apagou os cookies; recarregar limpa o que ficou na memória
        window.location.assign('/');
      },
      onError: (error) => {
        if (isActiveSubscriptionConflict(error)) {
          onOpenChange(false);
          onSubscriptionConflict();
          return;
        }

        setSubmitError('Não foi possível excluir a conta. Tente de novo.');
      },
    });
  };

  return {
    confirmation,
    setConfirmation,
    canConfirm: isDeleteConfirmed(confirmation),
    submitError,
    isDeleting,
    handleOpenChange,
    handleSubmit,
  };
};
