import { OnboardingService } from '@/service/partner/onboarding';
import type { TOnboardingStore } from '@/types/api/onboarding.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  getApiErrorMessage,
  maskPhone,
  maskZipCode,
} from '../../partner-onboarding.helpers';
import { useOnboardingMutation } from '../../partner-onboarding.hook';

const spaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Use pelo menos 3 caracteres')
    .max(100, 'Use no máximo 100 caracteres'),
  description: z
    .string()
    .trim()
    .min(10, 'Use pelo menos 10 caracteres')
    .max(500, 'Use no máximo 500 caracteres'),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, 'Informe o CEP completo'),
  address: z.string().trim().min(3, 'Informe a rua e o número'),
  city: z.string().trim().min(2, 'Informe a cidade'),
  state: z.string().regex(/^[A-Za-z]{2}$/, 'Use a sigla, como SP'),
  telephone: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Informe o telefone com DDD'),
});

type TSpaceForm = z.infer<typeof spaceSchema>;

type TUseSpaceStepParams = {
  store: TOnboardingStore | null;
  businessType: string | null;
  onSaved: () => void;
  onExit: () => void;
};

export const useSpaceStep = ({
  store,
  businessType,
  onSaved,
  onExit,
}: TUseSpaceStepParams) => {
  const [exitBlocked, setExitBlocked] = useState(false);
  const mutation = useOnboardingMutation(OnboardingService.saveSpace.bind(OnboardingService));

  const form = useForm<TSpaceForm>({
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      name: store?.name ?? '',
      description: store?.description ?? '',
      zipCode: store?.zipCode ?? '',
      address: store?.address ?? '',
      city: store?.city ?? '',
      state: store?.state ?? '',
      telephone: store?.telephone ?? '',
    },
  });

  // O formState é um proxy: só calcula o campo que for lido durante a renderização.
  const { isDirty } = form.formState;

  const submit = (afterSave: () => void) =>
    form.handleSubmit(
      async (values) => {
        await mutation.mutateAsync({
          ...values,
          state: values.state.toUpperCase(),
          businessType: businessType ?? 'Outro',
        });
        afterSave();
      },
      () => setExitBlocked(afterSave === onExit),
    )();

  const handleContinue = () => {
    setExitBlocked(false);
    void submit(onSaved).catch(() => undefined);
  };

  const handleSaveAndExit = () => {
    // Nada digitado: não há o que salvar, nem por que barrar a saída.
    if (!isDirty) {
      onExit();
      return;
    }
    void submit(onExit).catch(() => undefined);
  };

  const description = form.watch('description');

  return {
    form,
    descriptionLength: description.length,
    isSaving: mutation.isPending,
    exitBlocked,
    error: exitBlocked
      ? 'Corrija os campos destacados para salvar.'
      : mutation.isError
        ? getApiErrorMessage(mutation.error, 'Não foi possível salvar. Tente de novo.')
        : null,
    registerMasked: (field: 'zipCode' | 'telephone') =>
      form.register(field, {
        onChange: (event: { target: { value: string } }) => {
          const mask = field === 'zipCode' ? maskZipCode : maskPhone;
          // Sem revalidar, o erro antigo continuaria sobre um valor já corrigido.
          form.setValue(field, mask(event.target.value), {
            shouldDirty: true,
            shouldValidate: form.formState.isSubmitted,
          });
        },
      }),
    handleContinue,
    handleSaveAndExit,
  };
};
