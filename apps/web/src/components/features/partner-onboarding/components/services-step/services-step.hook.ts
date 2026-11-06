import { useAnalytics } from '@/providers/analytics.provider';
import { OnboardingService } from '@/service/partner/onboarding';
import type {
  TAddServicePayload,
  TOnboardingService,
  TOnboardingState,
} from '@/types/api/onboarding.types';
import { useMemo, useState } from 'react';
import {
  NEW_CATEGORY_VALUE,
  SERVICE_SUGGESTIONS,
} from '../../partner-onboarding.constants';
import {
  getApiErrorMessage,
  maskCurrency,
  parseCurrency,
} from '../../partner-onboarding.helpers';
import { useOnboardingMutation } from '../../partner-onboarding.hook';

const MIN_DURATION = 5;
const MAX_DURATION = 600;

type TUseServicesStepParams = {
  state: TOnboardingState;
  businessType: string | null;
  onSaved: () => void;
  onExit: () => void;
};

export const useServicesStep = ({
  state,
  businessType,
  onSaved,
  onExit,
}: TUseServicesStepParams) => {
  const suggestedCategory = businessType ?? state.categories[0]?.name ?? null;
  const suggestions = suggestedCategory
    ? (SERVICE_SUGGESTIONS[suggestedCategory] ?? [])
    : [];

  const categoryOptions = useMemo(
    () => [
      ...new Set([
        ...(suggestedCategory ? [suggestedCategory] : []),
        ...state.categories.map((category) => category.name),
      ]),
    ],
    [suggestedCategory, state.categories],
  );

  const [category, setCategory] = useState(
    suggestedCategory ?? NEW_CATEGORY_VALUE,
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [name, setName] = useState(
    state.services.length ? '' : (suggestions[0] ?? ''),
  );
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const analytics = useAnalytics();

  const addMutation = useOnboardingMutation(
    OnboardingService.addService.bind(OnboardingService),
  );
  const removeMutation = useOnboardingMutation(
    OnboardingService.removeService.bind(OnboardingService),
  );
  const stepMutation = useOnboardingMutation(
    OnboardingService.setStep.bind(OnboardingService),
  );

  const isNewCategory = category === NEW_CATEGORY_VALUE;

  const groups = useMemo(() => {
    const byCategory = new Map<string, TOnboardingService[]>();

    state.services.forEach((service) => {
      const key = service.category?.name ?? '';
      byCategory.set(key, [...(byCategory.get(key) ?? []), service]);
    });

    return [...byCategory.entries()].map(([categoryName, services]) => ({
      categoryName,
      services,
    }));
  }, [state.services]);

  const buildPayload = (): TAddServicePayload | string => {
    const categoryName = isNewCategory ? newCategoryName.trim() : category;
    const minutes = Number(duration.replace(/\D/g, ''));
    const value = parseCurrency(price);

    if (categoryName.length < 2) return 'Informe o nome da categoria.';
    if (name.trim().length < 2) return 'Informe o nome do serviço.';
    if (minutes < MIN_DURATION || minutes > MAX_DURATION) {
      return 'Informe a duração em minutos, entre 5 e 600.';
    }
    if (value < 1) return 'Informe um preço a partir de R$ 1,00.';

    return { categoryName, name: name.trim(), duration: minutes, price: value };
  };

  const addFromForm = async () => {
    const payload = buildPayload();

    if (typeof payload === 'string') {
      setFormError(payload);
      return false;
    }

    setFormError(null);
    // "Adicione pelo menos um serviço" deixa de valer assim que este entrar.
    stepMutation.reset();

    try {
      const next = await addMutation.mutateAsync(payload);
      analytics.track('onboarding_service_added', {
        services_count: next.services.length,
        is_new_category: isNewCategory,
        from_suggestion: suggestions.includes(payload.name),
      });
    } catch {
      return false;
    }

    setName('');
    setDuration('');
    setPrice('');
    setNewCategoryName('');

    if (isNewCategory) {
      setCategory(payload.categoryName);
    }

    return true;
  };

  // Preço ou duração preenchidos mostram intenção: "continuar" não pode perder
  // um serviço que só faltou adicionar. O nome conta pouco, porque vem sugerido.
  const hasPendingService = Boolean(duration || price);

  const advance = async (afterSave: () => void) => {
    if (hasPendingService && !(await addFromForm())) {
      return;
    }

    afterSave();
  };

  const handleContinue = () =>
    void advance(async () => {
      setFormError(null);

      try {
        const next = await stepMutation.mutateAsync('team');
        analytics.track('onboarding_step_completed', {
          step: 'services',
          services_count: next.services.length,
        });
        onSaved();
      } catch {
        // A mensagem aparece via `stepMutation.error`.
      }
    });

  const handleSaveAndExit = () => {
    const hadChanges = hasPendingService;
    void advance(() => {
      analytics.track('onboarding_save_and_exit', {
        step: 'services',
        had_changes: hadChanges,
      });
      onExit();
    });
  };

  const apiError = addMutation.error ?? removeMutation.error ?? stepMutation.error;

  return {
    categoryOptions,
    category,
    isNewCategory,
    showSuggestions: !isNewCategory && category === suggestedCategory,
    suggestedCategory,
    suggestions,
    newCategoryName,
    name,
    duration,
    price,
    groups,
    isAdding: addMutation.isPending,
    isSaving: stepMutation.isPending || addMutation.isPending,
    exitBlocked: Boolean(formError) && hasPendingService,
    error:
      formError ??
      (apiError
        ? getApiErrorMessage(
            apiError,
            'Não foi possível salvar. Tente de novo.',
          )
        : null),
    setCategory,
    setNewCategoryName,
    setName,
    setDuration: (value: string) => setDuration(value.replace(/\D/g, '')),
    setPrice: (value: string) => setPrice(maskCurrency(value)),
    handleAdd: () => void addFromForm(),
    handleRemove: (serviceId: string) =>
      removeMutation.mutate(serviceId, {
        onSuccess: (next) =>
          analytics.track('onboarding_service_removed', {
            services_count: next.services.length,
          }),
      }),
    handleContinue,
    handleSaveAndExit,
  };
};
