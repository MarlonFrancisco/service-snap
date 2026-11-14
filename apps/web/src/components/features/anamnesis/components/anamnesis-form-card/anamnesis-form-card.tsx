'use client';

import { Spinner } from '@repo/ui';
import { Check } from 'lucide-react';
import { Controller } from 'react-hook-form';
import {
  ANAMNESIS_CARD_CLASS,
  ANAMNESIS_CHECK_CLASS,
  ANAMNESIS_CHECK_INPUT_CLASS,
  ANAMNESIS_ERROR_CLASS,
  ANAMNESIS_PRIMARY_BUTTON_CLASS,
  ANAMNESIS_TEXT_CLASS,
} from '../../anamnesis.styles';
import { AnamnesisQuestion } from '../anamnesis-question';
import { useAnamnesisFormCard } from './anamnesis-form-card.hook';
import type { TAnamnesisFormCardConfig } from './anamnesis-form-card.types';

/** Uma ficha do link: as perguntas, o consentimento e o envio. */
export const AnamnesisFormCard = ({
  token,
  form: inviteForm,
  consentText,
  storeName,
  weekday,
  showTitle,
}: TAnamnesisFormCardConfig) => {
  const {
    form,
    handleSubmit,
    isSubmitting,
    submitError,
    isSent,
    previousSubmissionLabel,
    consentError,
  } = useAnamnesisFormCard({ token, form: inviteForm });
  const consentId = `${inviteForm.id}-consent`;

  if (isSent) {
    return (
      <div
        role="status"
        className={`${ANAMNESIS_CARD_CLASS} items-center text-center`}
      >
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-[#DFF2E7] text-[#0A5536]"
        >
          <Check className="size-6 stroke-2" />
        </span>
        <h2 className="text-xl font-extrabold tracking-[-0.02em]">
          {showTitle ? `${inviteForm.name} enviada` : 'Ficha enviada'}
        </h2>
        <p className={ANAMNESIS_TEXT_CLASS}>
          {storeName} já recebeu.{weekday ? ` Até ${weekday}!` : ''}
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label={inviteForm.name}
      className={ANAMNESIS_CARD_CLASS}
    >
      {showTitle ? (
        <h2 className="text-lg font-extrabold tracking-[-0.02em]">
          {inviteForm.name}
        </h2>
      ) : null}
      {inviteForm.description ? (
        <p className={`${ANAMNESIS_TEXT_CLASS} whitespace-pre-line`}>
          {inviteForm.description}
        </p>
      ) : null}
      {previousSubmissionLabel ? (
        <p className="rounded-[14px] bg-[#F7F6FA] px-3.5 py-3 text-[13px] leading-normal text-[#3D3A4A]">
          Você já enviou esta ficha em {previousSubmissionLabel}. Enviar de novo
          substitui as respostas anteriores.
        </p>
      ) : null}

      {inviteForm.fields.map((field) => (
        <AnamnesisQuestion
          key={field.id}
          formId={inviteForm.id}
          field={field}
          control={form.control}
        />
      ))}

      <Controller
        control={form.control}
        name="consent"
        render={({ field }) => (
          <div className="grid gap-1.5">
            <label
              htmlFor={consentId}
              className={`${ANAMNESIS_CHECK_CLASS} rounded-[14px] bg-[#F7F6FA] p-3.5`}
            >
              <input
                id={consentId}
                ref={field.ref}
                type="checkbox"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                aria-invalid={!!consentError || undefined}
                aria-describedby={
                  consentError ? `${consentId}-error` : undefined
                }
                className={ANAMNESIS_CHECK_INPUT_CLASS}
              />
              {consentText}
            </label>
            {consentError ? (
              <span
                id={`${consentId}-error`}
                role="alert"
                className={ANAMNESIS_ERROR_CLASS}
              >
                {consentError}
              </span>
            ) : null}
          </div>
        )}
      />

      {submitError ? (
        <p
          role="alert"
          className="rounded-[14px] bg-[#FBE8E6] px-3.5 py-3 text-[13px] font-semibold text-[#A4231A]"
        >
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={ANAMNESIS_PRIMARY_BUTTON_CLASS}
      >
        {isSubmitting ? (
          <>
            <Spinner />
            Enviando...
          </>
        ) : (
          'Enviar ficha'
        )}
      </button>
      <p className={`${ANAMNESIS_TEXT_CLASS} text-[13px]`}>
        Errou alguma coisa? Abra este link de novo e envie outra vez até o dia
        do atendimento.
      </p>
    </form>
  );
};
