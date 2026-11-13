'use client';

import { cn, Input } from '@repo/ui';
import { Loader2 } from 'lucide-react';
import {
  PROFILE_BUTTON_CLASS,
  PROFILE_BUTTON_PRIMARY_CLASS,
  PROFILE_CARD_CLASS,
  PROFILE_CARD_TITLE_CLASS,
  PROFILE_FIELD_CLASS,
  PROFILE_FIELD_ERROR_CLASS,
  PROFILE_HINT_CLASS,
  PROFILE_INPUT_CLASS,
  PROFILE_TEXT_BUTTON_CLASS,
} from '../../../profile.styles';
import { useEmailChangeCard } from './email-change-card.hook';

const ROW_CLASS = 'flex flex-col gap-2.5 sm:flex-row sm:items-end';

export const EmailChangeCard = () => {
  const {
    currentEmail,
    isOpen,
    isCodeStep,
    newEmail,
    code,
    emailError,
    codeError,
    notice,
    codeLength,
    isRequestingEmailChange,
    isConfirmingEmailChange,
    handleOpen,
    handleClose,
    handleEmailChange,
    handleSendCode,
    handleResendCode,
    handleCodeChange,
    handleConfirmCode,
  } = useEmailChangeCard();

  return (
    <section
      className={PROFILE_CARD_CLASS}
      aria-labelledby="profile-email-title"
    >
      <h3 id="profile-email-title" className={PROFILE_CARD_TITLE_CLASS}>
        E-mail
      </h3>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <small className="block text-xs font-semibold text-[#5F5C6E]">
            E-mail atual
          </small>
          <b className="mt-0.5 block text-[15px] [overflow-wrap:anywhere]">
            {currentEmail}
          </b>
        </div>
        {isOpen ? (
          <button
            type="button"
            onClick={handleClose}
            className={PROFILE_TEXT_BUTTON_CLASS}
          >
            Cancelar alteração
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpen}
            className={PROFILE_BUTTON_CLASS}
          >
            Alterar e-mail
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-[18px] grid gap-4 border-t border-[#F0EEF4] pt-[18px]">
          <form className="grid gap-1.5" onSubmit={handleSendCode} noValidate>
            <div className={ROW_CLASS}>
              <label className={cn(PROFILE_FIELD_CLASS, 'min-w-0 flex-1')}>
                Novo e-mail
                <Input
                  type="email"
                  value={newEmail}
                  onChange={handleEmailChange}
                  autoComplete="email"
                  autoFocus
                  aria-invalid={!!emailError}
                  aria-describedby={
                    emailError ? 'profile-email-error' : undefined
                  }
                  className={PROFILE_INPUT_CLASS}
                />
              </label>
              <button
                type="submit"
                disabled={isRequestingEmailChange}
                className={
                  isCodeStep
                    ? PROFILE_BUTTON_CLASS
                    : PROFILE_BUTTON_PRIMARY_CLASS
                }
              >
                {isRequestingEmailChange && !isCodeStep && (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                )}
                Enviar código
              </button>
            </div>
            {emailError && (
              <p
                id="profile-email-error"
                role="alert"
                className={PROFILE_FIELD_ERROR_CLASS}
              >
                {emailError}
              </p>
            )}
          </form>

          {isCodeStep && (
            <form
              className="grid gap-4"
              onSubmit={handleConfirmCode}
              noValidate
            >
              {notice && (
                <p
                  role="status"
                  className={cn(
                    'rounded-[14px] px-4 py-3.5 text-sm leading-[1.5]',
                    notice.tone === 'warning'
                      ? 'bg-[#FFF1E0] text-[#6E3B00]'
                      : 'bg-[#F7F6FA] text-[#0B0B0F]',
                  )}
                >
                  {notice.message}
                </p>
              )}

              <div className="grid gap-1.5">
                <div className={ROW_CLASS}>
                  <label
                    className={cn(PROFILE_FIELD_CLASS, 'min-w-0 sm:flex-none')}
                  >
                    Código de {codeLength} dígitos
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={codeLength}
                      autoComplete="one-time-code"
                      placeholder="000000"
                      value={code}
                      onChange={handleCodeChange}
                      aria-invalid={!!codeError}
                      aria-describedby={
                        codeError ? 'profile-code-error' : 'profile-code-hint'
                      }
                      className={cn(
                        PROFILE_INPUT_CLASS,
                        'text-center text-xl font-bold tracking-[0.35em] sm:w-[220px] md:text-xl',
                      )}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isConfirmingEmailChange}
                    className={PROFILE_BUTTON_PRIMARY_CLASS}
                  >
                    {isConfirmingEmailChange && (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    )}
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isRequestingEmailChange}
                    className={cn(
                      PROFILE_TEXT_BUTTON_CLASS,
                      'self-center sm:self-auto',
                    )}
                  >
                    Reenviar código
                  </button>
                </div>
                {codeError && (
                  <p
                    id="profile-code-error"
                    role="alert"
                    className={PROFILE_FIELD_ERROR_CLASS}
                  >
                    {codeError}
                  </p>
                )}
              </div>

              <p id="profile-code-hint" className={PROFILE_HINT_CLASS}>
                Seu e-mail só muda depois que você confirmar o código.
              </p>
            </form>
          )}
        </div>
      )}
    </section>
  );
};
