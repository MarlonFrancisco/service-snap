import { cn } from '@repo/ui';
import Link from 'next/link';
import {
  AUTH_FOCUS_RING_CLASS,
  AUTH_ICON_BUTTON_CLASS,
  AUTH_LEGAL_CLASS,
  AUTH_LINK_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
  AUTH_STEP_CLASS,
  AUTH_SUBTITLE_CLASS,
  AUTH_TITLE_CLASS,
} from '../../auth.styles';
import { StepIndicator } from '../step-indicator';
import { useVerificationStep } from './verification-step.hook';
import type { TVerificationStepConfig } from './verification-step.types';

export function VerificationStep({
  contact,
  onNext,
  onBack,
}: TVerificationStepConfig) {
  const {
    code,
    countdown,
    canResend,
    isLoading,
    isResending,
    maskedContact,
    isValidCode,
    setInputRef,
    handleVerify,
    handleResendCode,
    handleCodeChange,
    handleKeyDown,
    handlePaste,
  } = useVerificationStep({ contact, onNext });

  return (
    <section className={cn(AUTH_STEP_CLASS, 'gap-[18px]')}>
      <button
        type="button"
        aria-label="Voltar"
        onClick={onBack}
        className={cn(AUTH_ICON_BUTTON_CLASS, 'left-3 text-base')}
      >
        ←
      </button>

      <StepIndicator activeCount={1} />

      <div>
        <h2 className={AUTH_TITLE_CLASS}>Confirme sua identidade</h2>
        <p className={AUTH_SUBTITLE_CLASS}>
          Enviamos um código de 6 dígitos para{' '}
          <b className="break-all text-[#0B0B0F]">{maskedContact}</b>
        </p>
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-[7px] p-0 text-sm font-semibold">
          Código de verificação
        </legend>
        <div className="grid grid-cols-6 gap-2" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(element) => setInputRef(index, element)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              aria-label={`Dígito ${index + 1}`}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={cn(
                'h-14 w-full min-w-0 rounded-[14px] border border-[#E3E1EA] bg-white p-0 text-center text-xl font-bold text-[#0B0B0F]',
                AUTH_FOCUS_RING_CLASS,
              )}
            />
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={handleVerify}
        disabled={!isValidCode || isLoading}
        className={AUTH_PRIMARY_BUTTON_CLASS}
      >
        {isLoading ? 'Verificando...' : 'Confirmar código'}
      </button>

      <p className={cn(AUTH_LEGAL_CLASS, 'text-center')}>
        Não recebeu o código?{' '}
        {canResend ? (
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending}
            className={AUTH_LINK_CLASS}
          >
            {isResending ? 'Reenviando...' : 'Reenviar código'}
          </button>
        ) : (
          `Reenviar em ${countdown}s`
        )}
      </p>

      <p className={cn(AUTH_LEGAL_CLASS, 'mt-auto text-center')}>
        Está com problemas? Verifique sua caixa de spam ou{' '}
        <Link
          href="/contact"
          target="_blank"
          rel="noopener noreferrer"
          className={AUTH_LINK_CLASS}
        >
          entre em contato conosco
        </Link>
        .
      </p>
    </section>
  );
}
