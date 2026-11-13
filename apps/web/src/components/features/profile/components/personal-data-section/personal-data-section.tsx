'use client';

import { Input } from '@repo/ui';
import { Loader2 } from 'lucide-react';
import {
  PROFILE_BUTTON_PRIMARY_CLASS,
  PROFILE_CARD_CLASS,
  PROFILE_CARD_TITLE_CLASS,
  PROFILE_FIELD_CLASS,
  PROFILE_FIELD_ERROR_CLASS,
  PROFILE_HINT_CLASS,
  PROFILE_INPUT_CLASS,
  PROFILE_SECTION_LEAD_CLASS,
  PROFILE_SECTION_TITLE_CLASS,
} from '../../profile.styles';
import { EmailChangeCard } from './email-change-card';
import { usePersonalDataSection } from './personal-data-section.hook';

export const PersonalDataSection = () => {
  const {
    register,
    errors,
    isNameDirty,
    isUpdatingProfile,
    handleSaveName,
    telephone,
  } = usePersonalDataSection();

  return (
    <section className="max-w-[760px]">
      <h2 className={PROFILE_SECTION_TITLE_CLASS}>Dados pessoais</h2>
      <p className={PROFILE_SECTION_LEAD_CLASS}>
        É assim que as lojas veem você quando agenda.
      </p>

      <div className="grid gap-5">
        <form
          className={PROFILE_CARD_CLASS}
          aria-labelledby="profile-name-title"
          onSubmit={handleSaveName}
          noValidate
        >
          <h3 id="profile-name-title" className={PROFILE_CARD_TITLE_CLASS}>
            Nome
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3">
            <label className={PROFILE_FIELD_CLASS}>
              Nome
              <Input
                type="text"
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
                aria-describedby={
                  errors.firstName ? 'profile-first-name-error' : undefined
                }
                className={PROFILE_INPUT_CLASS}
                {...register('firstName')}
              />
              {errors.firstName && (
                <span
                  id="profile-first-name-error"
                  role="alert"
                  className={PROFILE_FIELD_ERROR_CLASS}
                >
                  {errors.firstName.message}
                </span>
              )}
            </label>
            <label className={PROFILE_FIELD_CLASS}>
              Sobrenome
              <Input
                type="text"
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
                aria-describedby={
                  errors.lastName ? 'profile-last-name-error' : undefined
                }
                className={PROFILE_INPUT_CLASS}
                {...register('lastName')}
              />
              {errors.lastName && (
                <span
                  id="profile-last-name-error"
                  role="alert"
                  className={PROFILE_FIELD_ERROR_CLASS}
                >
                  {errors.lastName.message}
                </span>
              )}
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!isNameDirty || isUpdatingProfile}
              className={PROFILE_BUTTON_PRIMARY_CLASS}
            >
              {isUpdatingProfile && (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              )}
              Salvar
            </button>
          </div>
        </form>

        <EmailChangeCard />

        <section
          className={PROFILE_CARD_CLASS}
          aria-labelledby="profile-phone-title"
        >
          <h3 id="profile-phone-title" className={PROFILE_CARD_TITLE_CLASS}>
            Telefone
          </h3>
          <label className={PROFILE_FIELD_CLASS}>
            Telefone
            <Input
              type="tel"
              value={telephone}
              readOnly
              aria-describedby="profile-phone-note"
              className={PROFILE_INPUT_CLASS}
            />
          </label>
          <p id="profile-phone-note" className={`${PROFILE_HINT_CLASS} mt-2`}>
            Para trocar o telefone, fale com o suporte.
          </p>
        </section>
      </div>
    </section>
  );
};
