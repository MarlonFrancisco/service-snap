'use client';

import { formatTime } from '@/components/features/anamnesis/anamnesis.helpers';
import { useAnamnesisMutations } from '@/hooks/partner/use-anamnesis-mutations';
import { useAnamnesisResponseQuery } from '@/hooks/partner/use-anamnesis-query';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { formatAnswer, formatConsent } from '../../../anamnesis-module.helpers';
import type {
  TAnamnesisAnswerRow,
  TAnamnesisResponseDialogConfig,
} from './anamnesis-response-dialog.types';

/**
 * Leitura de uma ficha. Cada abertura pede as respostas de novo (a API
 * registra a leitura) e nada fica no cache depois de fechar.
 */
export const useAnamnesisResponseDialog = ({
  storeId,
  customerId,
  row,
  onClose,
}: TAnamnesisResponseDialogConfig) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { user } = useUserQuery();
  const {
    response,
    responseReadAt,
    isLoadingResponse,
    isResponseError,
    isResponseForbidden,
    isResponseNotFound,
    refetchResponse,
  } = useAnamnesisResponseQuery({
    storeId,
    responseId: row?.id,
    enabled: !!row,
  });
  const { deleteResponseMutation } = useAnamnesisMutations({ storeId });

  useEffect(() => {
    setIsConfirmingDelete(false);
  }, [row?.id]);

  const answers = useMemo<TAnamnesisAnswerRow[]>(
    () =>
      (response?.fields ?? []).map((field) => {
        const value = response?.answers[field.id];
        const answer = formatAnswer(field, value);

        return {
          id: field.id,
          label: field.label,
          answer,
          isEmpty: answer === 'Não respondida',
        };
      }),
    [response],
  );

  const viewerName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'você';

  const handleDelete = useCallback(() => {
    if (!row) return;

    deleteResponseMutation.mutate(
      { responseId: row.id, customerId },
      {
        onSuccess: () => {
          toast.success('Ficha apagada');
          onClose();
        },
        onError: () => toast.error('Não foi possível apagar a ficha'),
      },
    );
  }, [row, customerId, deleteResponseMutation, onClose]);

  return {
    isOpen: !!row,
    title: response
      ? `${response.formName} · versão ${response.formVersion}`
      : row?.formName ?? 'Ficha de anamnese',
    consentLabel: response ? formatConsent(response.consentAt) : null,
    contextLine: response
      ? [
          [response.customer.firstName, response.customer.lastName]
            .filter(Boolean)
            .join(' ') || 'Cliente',
          row?.appointmentLabel
            ? `atendimento de ${row.appointmentLabel}`
            : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : null,
    auditLine: response
      ? `Esta leitura ficou registrada no histórico da loja: ${viewerName}, hoje às ${formatTime(responseReadAt)}.`
      : null,
    answers,
    isLoading: isLoadingResponse,
    isForbidden: isResponseForbidden,
    isNotFound: isResponseNotFound,
    isError: isResponseError && !isResponseForbidden && !isResponseNotFound,
    handleRetry: () => void refetchResponse(),
    isConfirmingDelete,
    handleRequestDelete: () => setIsConfirmingDelete(true),
    handleDismissDelete: () => setIsConfirmingDelete(false),
    handleDelete,
    isDeleting: deleteResponseMutation.isPending,
  };
};
