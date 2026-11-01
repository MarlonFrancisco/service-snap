import type { TOnboardingState } from '@/types/api/onboarding.types';
import { NEW_CATEGORY_VALUE } from '../../partner-onboarding.constants';
import {
  formatCurrency,
  formatDuration,
} from '../../partner-onboarding.helpers';
import {
  ONBOARDING_CHIP_CLASS,
  ONBOARDING_FIELD_LABEL_CLASS,
  ONBOARDING_HINT_CLASS,
  ONBOARDING_ICON_BUTTON_CLASS,
  ONBOARDING_INPUT_CLASS,
  ONBOARDING_OUTLINE_BUTTON_CLASS,
} from '../../partner-onboarding.styles';
import { OnboardingStepLayout } from '../onboarding-step-layout';
import { useServicesStep } from './services-step.hook';

type TServicesStepProps = {
  state: TOnboardingState;
  businessType: string | null;
  onBack: () => void;
  onExit: () => void;
  onSaved: () => void;
};

export const ServicesStep = ({
  state,
  businessType,
  onBack,
  onExit,
  onSaved,
}: TServicesStepProps) => {
  const {
    categoryOptions,
    category,
    isNewCategory,
    showSuggestions,
    suggestedCategory,
    suggestions,
    newCategoryName,
    name,
    duration,
    price,
    groups,
    isAdding,
    isSaving,
    exitBlocked,
    error,
    setCategory,
    setNewCategoryName,
    setName,
    setDuration,
    setPrice,
    handleAdd,
    handleRemove,
    handleContinue,
    handleSaveAndExit,
  } = useServicesStep({ state, businessType, onSaved, onExit });

  return (
    <OnboardingStepLayout
      step={3}
      title="O que você oferece?"
      lead="Adicione pelo menos um serviço. Você completa o resto depois."
      error={error}
      isSaving={isSaving}
      showExitAnyway={exitBlocked}
      onBack={onBack}
      onPrimary={handleContinue}
      onSaveAndExit={handleSaveAndExit}
      onExitAnyway={onExit}
    >
      <form
        className="grid gap-3 rounded-[20px] bg-[#F7F6FA] p-4 md:rounded-[22px] md:p-[18px]"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <label className={ONBOARDING_FIELD_LABEL_CLASS}>
          Categoria
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={ONBOARDING_INPUT_CLASS}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value={NEW_CATEGORY_VALUE}>Criar nova categoria</option>
          </select>
          {showSuggestions && (
            <span className={ONBOARDING_HINT_CLASS}>
              Sugerida pelo seu tipo de negócio. Você pode criar outra.
            </span>
          )}
        </label>

        {isNewCategory && (
          <label className={ONBOARDING_FIELD_LABEL_CLASS}>
            Nome da nova categoria
            <input
              type="text"
              maxLength={60}
              placeholder="Ex: Cuidados com a barba"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              className={ONBOARDING_INPUT_CLASS}
            />
            <span className={ONBOARDING_HINT_CLASS}>
              Você pode editar os detalhes depois, em Serviços.
            </span>
          </label>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold">
              Sugestões para {suggestedCategory?.toLowerCase()}{' '}
              <span className="block text-[13px] font-medium text-[#5F5C6E] md:inline">
                <span className="hidden md:inline">· </span>você escolhe o preço
              </span>
            </p>
            <div className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  aria-pressed={name === suggestion}
                  onClick={() => setName(suggestion)}
                  className={ONBOARDING_CHIP_CLASS}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className={ONBOARDING_FIELD_LABEL_CLASS}>
          Nome do serviço
          <input
            type="text"
            maxLength={80}
            placeholder={isNewCategory ? 'Ex: Hidratação de barba' : undefined}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={ONBOARDING_INPUT_CLASS}
          />
        </label>

        <div className="grid grid-cols-2 gap-2.5 md:gap-3">
          <label className={ONBOARDING_FIELD_LABEL_CLASS}>
            Duração
            <span className="relative block">
              <input
                type="text"
                inputMode="numeric"
                placeholder="30"
                aria-label="Duração em minutos"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className={`${ONBOARDING_INPUT_CLASS} pr-12`}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[15px] font-medium text-[#6F6C7E]"
              >
                min
              </span>
            </span>
          </label>
          <label className={ONBOARDING_FIELD_LABEL_CLASS}>
            Preço
            <input
              type="text"
              inputMode="decimal"
              placeholder="R$ 0,00"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className={ONBOARDING_INPUT_CLASS}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isAdding}
          className={ONBOARDING_OUTLINE_BUTTON_CLASS}
        >
          {isAdding ? 'Adicionando…' : 'Adicionar serviço'}
        </button>
      </form>

      {groups.map(({ categoryName, services }) => (
        <div key={categoryName}>
          <p className="mt-[18px] text-[13px] font-bold tracking-[0.06em] text-[#5F5C6E] uppercase">
            {categoryName}
          </p>
          <ul
            aria-label={`Serviços adicionados em ${categoryName}`}
            className="mt-1 list-none p-0"
          >
            {services.map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between gap-3.5 border-b border-[#EBE9F0] py-3 text-sm"
              >
                <div className="min-w-0">
                  <b className="block text-[15px]">{service.name}</b>
                  <span className="text-[#5F5C6E]">
                    {formatDuration(service.duration)} ·{' '}
                    {formatCurrency(service.price)}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`Remover ${service.name}`}
                  onClick={() => handleRemove(service.id)}
                  className={ONBOARDING_ICON_BUTTON_CLASS}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </OnboardingStepLayout>
  );
};
