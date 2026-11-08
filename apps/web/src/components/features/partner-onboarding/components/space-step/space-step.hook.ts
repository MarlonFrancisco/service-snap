import { useAnalytics } from '@/providers/analytics.provider';
import { OnboardingService } from '@/service/partner/onboarding';
import { useLocaleStore } from '@/store/locale';
import type { TOnboardingStore } from '@/types/api/onboarding.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { COUNTRIES, type TCountryCode } from '@repo/shared/constants';
import {
  getPostalCodePlaceholder,
  getPostalCodeRegex,
  getStates,
  isValidPhoneLength,
  normalizePhone,
} from '@repo/shared/validators';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { COUNTRY_OPTIONS, DEFAULT_ONBOARDING_COUNTRY } from '../../partner-onboarding.constants';
import {
  getApiErrorMessage,
  maskPhoneFor,
  maskPostalCodeFor,
  toLocalPhone,
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
  country: z.enum(COUNTRY_OPTIONS.map(({ code }) => code) as [TCountryCode]),
  zipCode: z.string().trim(),
  address: z.string().trim().min(3, 'Informe a rua e o número'),
  city: z.string().trim().min(2, 'Informe a cidade'),
  state: z.string().trim().max(100, 'Use no máximo 100 caracteres'),
  telephone: z.string().trim(),
})
  // CEP, estado e telefone dependem do país escolhido no mesmo formulário
  .superRefine(({ country, zipCode, state, telephone }, ctx) => {
    const { postalCodeLabel } = COUNTRIES[country];
    const states = getStates(country);

    if (!getPostalCodeRegex(country).test(zipCode)) {
      ctx.addIssue({
        code: 'custom',
        path: ['zipCode'],
        message: `Informe o ${postalCodeLabel} completo`,
      });
    }
    if (states.length && !states.some(({ code }) => code === state.toUpperCase())) {
      ctx.addIssue({ code: 'custom', path: ['state'], message: 'Escolha o estado' });
    }
    if (!isValidPhoneLength(telephone, country)) {
      ctx.addIssue({
        code: 'custom',
        path: ['telephone'],
        message: 'Informe o telefone completo',
      });
    }
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
  const localeCountry = useLocaleStore((state) => state.country);
  const initialCountry: TCountryCode =
    store?.country ?? localeCountry ?? DEFAULT_ONBOARDING_COUNTRY;
  const analytics = useAnalytics();
  const mutation = useOnboardingMutation(OnboardingService.saveSpace.bind(OnboardingService));

  const form = useForm<TSpaceForm>({
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      name: store?.name ?? '',
      description: store?.description ?? '',
      country: initialCountry,
      zipCode: store?.zipCode ?? '',
      address: store?.address ?? '',
      city: store?.city ?? '',
      state: store?.state ?? '',
      telephone: store?.telephone ? toLocalPhone(store.telephone, initialCountry) : '',
    },
  });

  // O formState é um proxy: só calcula o campo que for lido durante a renderização.
  const { isDirty } = form.formState;

  const submit = (afterSave: () => void) =>
    form.handleSubmit(
      async (values) => {
        const hasStates = getStates(values.country).length > 0;

        await mutation.mutateAsync({
          ...values,
          state: hasStates ? values.state.toUpperCase() : values.state,
          // A API grava em E.164: o DDI sai do país escolhido
          telephone: normalizePhone(values.telephone, values.country),
          businessType: businessType ?? 'Outro',
        });
        afterSave();
      },
      () => setExitBlocked(afterSave === exitAfterSave),
    )();

  const completeStep = () => {
    analytics.track('onboarding_step_completed', { step: 'space' });
    onSaved();
  };

  const exitAfterSave = () => {
    analytics.track('onboarding_save_and_exit', {
      step: 'space',
      had_changes: true,
    });
    onExit();
  };

  const handleContinue = () => {
    setExitBlocked(false);
    void submit(completeStep).catch(() => undefined);
  };

  const handleSaveAndExit = () => {
    // Nada digitado: não há o que salvar, nem por que barrar a saída.
    if (!isDirty) {
      analytics.track('onboarding_save_and_exit', {
        step: 'space',
        had_changes: false,
      });
      onExit();
      return;
    }
    void submit(exitAfterSave).catch(() => undefined);
  };

  const description = form.watch('description');
  const country = form.watch('country');
  const countryData = COUNTRIES[country];

  /** Troca de país: refaz as máscaras e limpa um estado que não existe lá. */
  const handleCountryChange = (next: TCountryCode) => {
    const { zipCode, telephone, state } = form.getValues();
    const nextStates = getStates(next);
    const options = { shouldDirty: true, shouldValidate: form.formState.isSubmitted };

    form.setValue('country', next, options);
    form.setValue('zipCode', maskPostalCodeFor(zipCode, next), options);
    form.setValue('telephone', maskPhoneFor(telephone, next), options);
    if (nextStates.length && !nextStates.some(({ code }) => code === state.toUpperCase())) {
      form.setValue('state', '', options);
    }
  };

  return {
    form,
    countryOptions: COUNTRY_OPTIONS,
    region: {
      postalCodeLabel: countryData.postalCodeLabel,
      postalCodePlaceholder: getPostalCodePlaceholder(country),
      stateLabel: countryData.stateLabel,
      states: getStates(country),
      phoneCode: countryData.phoneCode,
      phonePlaceholder: countryData.phoneFormat.replace(/#/g, '0'),
    },
    handleCountryChange,
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
          const mask = field === 'zipCode' ? maskPostalCodeFor : maskPhoneFor;
          // Sem revalidar, o erro antigo continuaria sobre um valor já corrigido.
          form.setValue(field, mask(event.target.value, form.getValues('country')), {
            shouldDirty: true,
            shouldValidate: form.formState.isSubmitted,
          });
        },
      }),
    handleContinue,
    handleSaveAndExit,
  };
};
