import type { TOnboardingState } from '@/types/api/onboarding.types';
import {
  ONBOARDING_COPY_BUTTON_CLASS,
  ONBOARDING_ERROR_CLASS,
  ONBOARDING_FIELD_LABEL_CLASS,
  ONBOARDING_ICON_BUTTON_CLASS,
  ONBOARDING_INPUT_CLASS,
  ONBOARDING_OUTLINE_BUTTON_CLASS,
} from '../../partner-onboarding.styles';
import { OnboardingStepLayout } from '../onboarding-step-layout';
import { useTeamStep } from './team-step.hook';

const ERROR_ID = 'onboarding-member-error';

type TTeamStepProps = {
  state: TOnboardingState;
  onBack: () => void;
  onExit: () => void;
  onSaved: () => void;
};

export const TeamStep = ({ state, onBack, onExit, onSaved }: TTeamStepProps) => {
  const {
    services,
    otherMembers,
    ownerEnabled,
    ownerServiceIds,
    email,
    emailError,
    showSignupLink,
    stepError,
    hasProfessional,
    usedSlots,
    planLimit,
    isAdding,
    isSaving,
    setOwnerEnabled,
    toggleOwnerService,
    setEmail,
    handleAddMember,
    handleRemoveMember,
    handleCopySignupLink,
    handleContinue,
    handleSaveAndExit,
  } = useTeamStep({ state, onSaved, onExit });

  return (
    <OnboardingStepLayout
      step={4}
      title="Quem atende os clientes?"
      lead="Os clientes agendam com um profissional. Sem pelo menos um, ninguém consegue agendar."
      error={stepError}
      isSaving={isSaving}
      onBack={onBack}
      onPrimary={handleContinue}
      onSaveAndExit={handleSaveAndExit}
    >
      <section className="rounded-[22px] border-2 border-[#0B0B0F] px-[19px] py-[17px]">
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3.5 text-base font-bold">
          Eu mesmo atendo
          <input
            type="checkbox"
            checked={ownerEnabled}
            onChange={(event) => setOwnerEnabled(event.target.checked)}
            className="size-6 flex-none accent-[#0B0B0F]"
          />
        </label>
        <p className="mt-0.5 mb-3 text-sm text-[#5F5C6E]">
          Você aparece na agenda e pode receber agendamentos.
        </p>
        {ownerEnabled && (
          <fieldset>
            <legend className="mb-2 text-[13px] font-bold">
              Serviços que você faz
            </legend>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#F4F3F7] px-3.5 text-[13px] font-semibold"
                >
                  <input
                    type="checkbox"
                    checked={ownerServiceIds.includes(service.id)}
                    onChange={() => toggleOwnerService(service.id)}
                    className="size-[18px] accent-[#0B0B0F]"
                  />
                  {service.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </section>

      <h2 className="mt-6 mb-[3px] text-lg font-extrabold tracking-[-0.02em]">
        Adicionar outro profissional
      </h2>
      <p className="mb-2.5 text-sm text-[#5F5C6E]">
        A pessoa precisa ter conta no ServiceSnap.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleAddMember();
        }}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <label className={`${ONBOARDING_FIELD_LABEL_CLASS} flex-1`}>
            E-mail do profissional
            <input
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? ERROR_ID : undefined}
              onChange={(event) => setEmail(event.target.value)}
              className={ONBOARDING_INPUT_CLASS}
            />
          </label>
          <button
            type="submit"
            disabled={isAdding}
            className={`${ONBOARDING_OUTLINE_BUTTON_CLASS} min-h-[50px]`}
          >
            {isAdding ? 'Adicionando…' : 'Adicionar'}
          </button>
        </div>

        {emailError && (
          <div
            id={ERROR_ID}
            role="alert"
            className={`mt-2 flex flex-wrap items-center justify-between gap-2 ${ONBOARDING_ERROR_CLASS}`}
          >
            <span>{emailError}</span>
            {showSignupLink && (
              <button
                type="button"
                onClick={handleCopySignupLink}
                className={ONBOARDING_COPY_BUTTON_CLASS}
              >
                Copiar link de cadastro
              </button>
            )}
          </div>
        )}
      </form>

      {otherMembers.length > 0 && (
        <ul
          aria-label="Profissionais adicionados"
          className="mt-3.5 list-none p-0"
        >
          {otherMembers.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-3.5 border-b border-[#EBE9F0] py-3 text-sm"
            >
              <div className="min-w-0">
                <b className="block truncate text-[15px]">
                  {member.name || member.email}
                </b>
                {member.name && (
                  <span className="block truncate text-[#5F5C6E]">
                    {member.email}
                  </span>
                )}
              </div>
              <button
                type="button"
                aria-label={`Remover ${member.name || member.email}`}
                onClick={() => handleRemoveMember(member.id)}
                className={ONBOARDING_ICON_BUTTON_CLASS}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-[18px] flex justify-between border-t border-[#EBE9F0] pt-3.5 text-[13px] text-[#5F5C6E]">
        <span>Profissionais no plano</span>
        <b>{planLimit ? `${usedSlots}/${planLimit}` : usedSlots}</b>
      </p>

      {!hasProfessional && (
        <p
          role="status"
          className="mt-3 rounded-[14px] bg-[#FFF1E0] px-4 py-[13px] text-sm leading-[1.45] text-[#8A4B00]"
        >
          Sem nenhum profissional, ninguém consegue agendar. Mantenha &quot;Eu
          mesmo atendo&quot; ou adicione alguém para continuar.
        </p>
      )}
    </OnboardingStepLayout>
  );
};
