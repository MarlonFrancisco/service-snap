'use client';

import { isApiHttpError } from '@/service/api';
import { AnamnesisPublicService } from '@/service/anamnesis';
import type { TSubmitAnamnesis } from '@/types/api/anamnesis.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  buildAnamnesisSchema,
  formatDateTime,
  getEmptyAnswers,
  toAnamnesisAnswers,
} from '../../anamnesis.helpers';
import type { TAnamnesisFormValues } from '../../anamnesis.types';
import type { TUseAnamnesisFormCardConfig } from './anamnesis-form-card.types';

/** Erro do envio em uma frase, sem repetir nenhuma resposta. */
const getSubmitErrorMessage = (error: unknown) => {
  if (isApiHttpError(error) && error.status === 410) {
    return 'Este link expirou. Peça um novo link para a loja.';
  }
  if (isApiHttpError(error) && error.status === 400) {
    return 'Confira as respostas e envie de novo.';
  }

  return 'Não foi possível enviar a ficha. Verifique a conexão e tente de novo.';
};

export const useAnamnesisFormCard = ({
  token,
  form: inviteForm,
}: TUseAnamnesisFormCardConfig) => {
  const schema = useMemo(
    () => buildAnamnesisSchema(inviteForm.fields),
    [inviteForm.fields],
  );
  const form = useForm<TAnamnesisFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getEmptyAnswers(inviteForm.fields),
  });
  const [isSent, setIsSent] = useState(false);

  // Dado de saúde: nada de log nem cache, só o envio
  const submitMutation = useMutation({
    mutationFn: (submission: TSubmitAnamnesis) =>
      AnamnesisPublicService.submit(token, submission),
    onSuccess: () => setIsSent(true),
  });

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    submitMutation.reset();

    void form.handleSubmit((values) =>
      submitMutation.mutate({
        formId: inviteForm.id,
        answers: toAnamnesisAnswers(inviteForm.fields, values.answers),
        consent: true,
      }),
    )(event);
  };

  return {
    form,
    handleSubmit,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.isError
      ? getSubmitErrorMessage(submitMutation.error)
      : null,
    isSent,
    previousSubmissionLabel: inviteForm.submittedAt
      ? formatDateTime(inviteForm.submittedAt)
      : null,
    consentError: form.formState.errors.consent?.message,
  };
};
