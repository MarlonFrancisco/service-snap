import type { TOnboardingStore } from '@/types/api/onboarding.types';
import {
  ONBOARDING_ERROR_CLASS,
  ONBOARDING_FIELD_LABEL_CLASS,
  ONBOARDING_HINT_CLASS,
  ONBOARDING_INPUT_CLASS,
} from '../../partner-onboarding.styles';
import { OnboardingStepLayout } from '../onboarding-step-layout';
import { useSpaceStep } from './space-step.hook';

type TSpaceStepProps = {
  store: TOnboardingStore | null;
  businessType: string | null;
  onBack: () => void;
  onExit: () => void;
  onSaved: () => void;
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <span className={ONBOARDING_ERROR_CLASS}>{message}</span> : null;

export const SpaceStep = ({
  store,
  businessType,
  onBack,
  onExit,
  onSaved,
}: TSpaceStepProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
    descriptionLength,
    isSaving,
    exitBlocked,
    error,
    registerMasked,
    handleContinue,
    handleSaveAndExit,
  } = useSpaceStep({ store, businessType, onSaved, onExit });

  return (
    <OnboardingStepLayout
      step={1}
      title="Conte sobre o seu espaço"
      lead="É assim que os clientes vão encontrar você. Dá para mudar depois."
      error={error}
      isSaving={isSaving}
      showExitAnyway={exitBlocked}
      onBack={onBack}
      onPrimary={handleContinue}
      onSaveAndExit={handleSaveAndExit}
      onExitAnyway={onExit}
    >
      <form
        className="grid gap-3.5"
        onSubmit={(event) => {
          event.preventDefault();
          handleContinue();
        }}
      >
        <label className={ONBOARDING_FIELD_LABEL_CLASS}>
          Nome do espaço
          <input
            type="text"
            maxLength={100}
            aria-invalid={Boolean(errors.name)}
            className={ONBOARDING_INPUT_CLASS}
            {...register('name')}
          />
          <FieldError message={errors.name?.message} />
        </label>

        <label className={ONBOARDING_FIELD_LABEL_CLASS}>
          Descrição
          <textarea
            maxLength={500}
            placeholder="O que torna seu espaço especial"
            aria-invalid={Boolean(errors.description)}
            className={`${ONBOARDING_INPUT_CLASS} h-auto min-h-[86px] resize-y pt-3`}
            {...register('description')}
          />
          <small className={ONBOARDING_HINT_CLASS}>
            {descriptionLength}/500 caracteres, mínimo de 10
          </small>
          <FieldError message={errors.description?.message} />
        </label>

        <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
          <label className={ONBOARDING_FIELD_LABEL_CLASS}>
            CEP
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              aria-invalid={Boolean(errors.zipCode)}
              className={ONBOARDING_INPUT_CLASS}
              {...registerMasked('zipCode')}
            />
            <FieldError message={errors.zipCode?.message} />
          </label>
          <label className={ONBOARDING_FIELD_LABEL_CLASS}>
            Endereço
            <input
              type="text"
              autoComplete="street-address"
              placeholder="Rua e número"
              aria-invalid={Boolean(errors.address)}
              className={ONBOARDING_INPUT_CLASS}
              {...register('address')}
            />
            <FieldError message={errors.address?.message} />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <label className={ONBOARDING_FIELD_LABEL_CLASS}>
            Cidade
            <input
              type="text"
              autoComplete="address-level2"
              aria-invalid={Boolean(errors.city)}
              className={ONBOARDING_INPUT_CLASS}
              {...register('city')}
            />
            <FieldError message={errors.city?.message} />
          </label>
          <label className={ONBOARDING_FIELD_LABEL_CLASS}>
            Estado
            <input
              type="text"
              maxLength={2}
              autoComplete="address-level1"
              placeholder="UF"
              aria-invalid={Boolean(errors.state)}
              className={`${ONBOARDING_INPUT_CLASS} uppercase placeholder:normal-case`}
              {...register('state')}
            />
            <FieldError message={errors.state?.message} />
          </label>
        </div>

        <label className={ONBOARDING_FIELD_LABEL_CLASS}>
          Telefone
          <input
            type="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            aria-invalid={Boolean(errors.telephone)}
            className={ONBOARDING_INPUT_CLASS}
            {...registerMasked('telephone')}
          />
          <FieldError message={errors.telephone?.message} />
        </label>
      </form>
    </OnboardingStepLayout>
  );
};
