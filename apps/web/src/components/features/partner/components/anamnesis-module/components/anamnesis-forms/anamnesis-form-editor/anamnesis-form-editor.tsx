'use client';

import {
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Spinner,
  Switch,
  Textarea,
} from '@repo/ui';
import { Info } from 'lucide-react';
import { FormProvider } from 'react-hook-form';
import {
  CUSTOMERS_BUTTON_CLASS,
  CUSTOMERS_PRIMARY_BUTTON_CLASS,
  CUSTOMERS_SMALL_BUTTON_CLASS,
} from '../../../../customers-module/customers-module.styles';
import {
  ANAMNESIS_MAX_DESCRIPTION,
  ANAMNESIS_MAX_NAME,
} from '../../../anamnesis-module.helpers';
import {
  ANAMNESIS_CARD_CLASS,
  ANAMNESIS_CARD_TITLE_CLASS,
  ANAMNESIS_CHIP_CLASS,
  ANAMNESIS_CHIP_TONE,
  ANAMNESIS_ERROR_CLASS,
  ANAMNESIS_FIELD_CLASS,
  ANAMNESIS_HINT_CLASS,
  ANAMNESIS_ITEM_CLASS,
  ANAMNESIS_NOTE_CLASS,
  ANAMNESIS_NOTE_ICON_CLASS,
  ANAMNESIS_TEXT_CLASS,
  ANAMNESIS_TEXTAREA_CLASS,
  ANAMNESIS_TOGGLE_ACTIVE_CLASS,
  ANAMNESIS_TOGGLE_CLASS,
} from '../../../anamnesis-module.styles';
import { AnamnesisQuestionDraft } from '../../anamnesis-question-draft';
import { useAnamnesisFormEditor } from './anamnesis-form-editor.hook';
import type { TAnamnesisFormEditorConfig } from './anamnesis-form-editor.types';

const LABEL_CLASS = 'text-sm font-semibold';

export const AnamnesisFormEditor = (config: TAnamnesisFormEditorConfig) => {
  const {
    form,
    title,
    version,
    isActive,
    onActiveChange,
    services,
    onServiceToggle,
    questions,
    questionsError,
    onEditQuestion,
    onRemoveQuestion,
    draft,
    versionNote,
    isSaving,
    handleSave,
  } = useAnamnesisFormEditor(config);

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={handleSave}
        aria-labelledby="anamnesis-editor-title"
        className={ANAMNESIS_CARD_CLASS}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="anamnesis-editor-title"
            className={cn(ANAMNESIS_CARD_TITLE_CLASS, 'min-w-0 break-words')}
          >
            {title}
          </h2>
          {version !== null ? (
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  ANAMNESIS_CHIP_CLASS,
                  ANAMNESIS_CHIP_TONE.neutral,
                )}
              >
                Versão {version}
              </span>
              <Switch
                checked={isActive}
                onCheckedChange={onActiveChange}
                aria-label="Ficha ativa"
              />
            </div>
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>Nome</FormLabel>
              <FormControl>
                <Input
                  maxLength={ANAMNESIS_MAX_NAME}
                  placeholder="Ex.: Ficha de saúde"
                  className={ANAMNESIS_FIELD_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-2">
          <span id="anamnesis-services-label" className={LABEL_CLASS}>
            Pedida nos serviços{' '}
            <span className={ANAMNESIS_HINT_CLASS}>
              Sem nenhum marcado, vale para todos
            </span>
          </span>
          {services.length > 0 ? (
            <div
              role="group"
              aria-labelledby="anamnesis-services-label"
              className="flex flex-wrap gap-2"
            >
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={service.isSelected}
                  onClick={() => onServiceToggle(service.id)}
                  className={cn(
                    ANAMNESIS_TOGGLE_CLASS,
                    service.isSelected && ANAMNESIS_TOGGLE_ACTIVE_CLASS,
                  )}
                >
                  {service.name}
                </button>
              ))}
            </div>
          ) : (
            <p className={ANAMNESIS_TEXT_CLASS}>
              A loja ainda não tem serviços: a ficha vale para todos.
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>
                Texto de abertura{' '}
                <span className={ANAMNESIS_HINT_CLASS}>
                  Opcional, aparece antes das perguntas
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  maxLength={ANAMNESIS_MAX_DESCRIPTION}
                  className={ANAMNESIS_TEXTAREA_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h3 className="text-base font-extrabold">Perguntas</h3>

        {questions.length > 0 ? (
          <ul aria-label="Perguntas da ficha" className="grid gap-2">
            {questions.map((question, index) => (
              <li
                key={question.key}
                className={cn(
                  ANAMNESIS_ITEM_CLASS,
                  'flex-wrap items-start',
                  question.isEditing && 'border-[#0B0B0F]',
                )}
              >
                <div className="grid min-w-0 flex-1 gap-1">
                  <b className="text-sm break-words">{question.label}</b>
                  <span className="text-[13px] text-[#5F5C6E]">
                    {question.meta}
                  </span>
                  {question.optionsLabel ? (
                    <span className="text-[13px] break-words text-[#5F5C6E]">
                      {question.optionsLabel}
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditQuestion(index)}
                    aria-label={`Editar a pergunta ${question.label}`}
                    className={cn(
                      CUSTOMERS_BUTTON_CLASS,
                      CUSTOMERS_SMALL_BUTTON_CLASS,
                    )}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveQuestion(index)}
                    aria-label={`Remover a pergunta ${question.label}`}
                    className={cn(
                      CUSTOMERS_BUTTON_CLASS,
                      CUSTOMERS_SMALL_BUTTON_CLASS,
                    )}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={ANAMNESIS_TEXT_CLASS}>
            Nenhuma pergunta ainda. Escreva a primeira abaixo.
          </p>
        )}
        {questionsError ? (
          <p role="alert" className={ANAMNESIS_ERROR_CLASS}>
            {questionsError}
          </p>
        ) : null}

        <AnamnesisQuestionDraft {...draft} />

        <div className={ANAMNESIS_NOTE_CLASS}>
          <Info aria-hidden="true" className={ANAMNESIS_NOTE_ICON_CLASS} />
          <p>{versionNote}</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={CUSTOMERS_PRIMARY_BUTTON_CLASS}
          >
            {isSaving ? (
              <>
                <Spinner />
                Salvando...
              </>
            ) : (
              'Salvar ficha'
            )}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};
