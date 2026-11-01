import { Checkbox, cn, Input, PhoneInput } from '@repo/ui';
import Link from 'next/link';
import {
  AUTH_ICON_BUTTON_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_LEGAL_CLASS,
  AUTH_LINK_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
  AUTH_STEP_CLASS,
  AUTH_SUBTITLE_CLASS,
  AUTH_TITLE_CLASS,
} from '../../auth.styles';
import { StepIndicator } from '../step-indicator';
import { useSignupStep } from './signup-step.hook';
import type { TSignupStepConfig } from './signup-step.types';

const PHONE_INPUT_ID = 'auth-signup-phone';

export function SignupStep({ userData, onNext, onBack }: TSignupStepConfig) {
  const {
    contact,
    isEmail,
    formData,
    isLoading,
    isFormValid,
    phoneCountry,
    phoneCodeOptions,
    phoneMask,
    phonePlaceholder,
    handleInputChange,
    handleCountryChange,
    handleContinue,
  } = useSignupStep({ userData, onNext });

  return (
    <section className={cn(AUTH_STEP_CLASS, 'gap-3.5')}>
      <button
        type="button"
        aria-label="Voltar"
        onClick={onBack}
        className={cn(AUTH_ICON_BUTTON_CLASS, 'left-3 text-base')}
      >
        ←
      </button>

      <StepIndicator activeCount={2} />

      <div>
        <h2 className={AUTH_TITLE_CLASS}>Complete seu perfil</h2>
        <p className={AUTH_SUBTITLE_CLASS}>
          Só mais alguns dados para criar sua conta.
        </p>
      </div>

      <div className="flex justify-between gap-3 rounded-[14px] bg-[#F7F6FA] px-4 py-3.5 text-sm">
        <span className="min-w-0 truncate">{contact}</span>
        <span className="text-[13px] font-bold whitespace-nowrap text-[#0A7D4F]">
          Verificado
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <label className={AUTH_LABEL_CLASS}>
          Nome
          <Input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={AUTH_INPUT_CLASS}
          />
        </label>
        <label className={AUTH_LABEL_CLASS}>
          Sobrenome
          <Input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={AUTH_INPUT_CLASS}
          />
        </label>
      </div>

      {isEmail ? (
        <div className={AUTH_LABEL_CLASS}>
          <label htmlFor={PHONE_INPUT_ID}>Telefone</label>
          <PhoneInput
            id={PHONE_INPUT_ID}
            value={formData.telephone}
            onChange={(value) => handleInputChange('telephone', value)}
            countryCode={phoneCountry}
            onCountryChange={handleCountryChange}
            phoneCodeOptions={phoneCodeOptions}
            mask={phoneMask}
            phonePlaceholder={phonePlaceholder}
            triggerClassName="h-[52px]! w-[7.75rem] rounded-[14px] border-[#E3E1EA] bg-white px-3 text-sm shadow-none focus-visible:border-[#0B0B0F] focus-visible:ring-[#0B0B0F]/15"
            inputClassName={AUTH_INPUT_CLASS}
          />
        </div>
      ) : (
        <label className={AUTH_LABEL_CLASS}>
          E-mail
          <Input
            type="email"
            placeholder="seuemail@exemplo.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={AUTH_INPUT_CLASS}
          />
        </label>
      )}

      <label
        className={cn(
          AUTH_LEGAL_CLASS,
          'flex min-h-11 cursor-pointer items-start gap-2.5 font-medium',
        )}
      >
        <Checkbox
          checked={formData.acceptedTerms}
          onCheckedChange={(checked) =>
            handleInputChange('acceptedTerms', checked === true)
          }
          className="size-[22px] rounded-md border-[#E3E1EA] bg-white data-[state=checked]:border-[#0B0B0F] data-[state=checked]:bg-[#0B0B0F] data-[state=checked]:text-white"
        />
        <span>
          Li e concordo com os{' '}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className={AUTH_LINK_CLASS}
          >
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={AUTH_LINK_CLASS}
          >
            Política de Privacidade
          </Link>{' '}
          do ServiceSnap.
        </span>
      </label>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!isFormValid || isLoading}
        className={cn(AUTH_PRIMARY_BUTTON_CLASS, 'mt-auto shrink-0')}
      >
        {isLoading ? 'Criando conta...' : 'Criar conta'}
      </button>
    </section>
  );
}
