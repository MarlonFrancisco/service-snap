import { Controller } from 'react-hook-form';
import { BOOLEAN_NO, BOOLEAN_YES } from '../../anamnesis.helpers';
import {
  ANAMNESIS_CHECK_CLASS,
  ANAMNESIS_CHECK_INPUT_CLASS,
  ANAMNESIS_ERROR_CLASS,
  ANAMNESIS_HINT_CLASS,
  ANAMNESIS_INPUT_CLASS,
  ANAMNESIS_LABEL_CLASS,
  ANAMNESIS_TEXTAREA_CLASS,
} from '../../anamnesis.styles';
import type { TAnamnesisQuestionConfig } from './anamnesis-question.types';

const BOOLEAN_OPTIONS = [
  { value: BOOLEAN_YES, label: 'Sim' },
  { value: BOOLEAN_NO, label: 'Não' },
];

/** Uma pergunta da ficha, no controle certo para o tipo. */
export const AnamnesisQuestion = ({
  formId,
  field,
  control,
}: TAnamnesisQuestionConfig) => {
  const inputId = `${formId}-${field.id}`;
  const errorId = `${inputId}-error`;
  const hint = field.required ? (
    <span className={ANAMNESIS_HINT_CLASS}> Obrigatória</span>
  ) : null;

  return (
    <Controller
      control={control}
      name={`answers.${field.id}`}
      render={({ field: input, fieldState }) => {
        const error = fieldState.error?.message;
        const errorNode = error ? (
          <span id={errorId} role="alert" className={ANAMNESIS_ERROR_CLASS}>
            {error}
          </span>
        ) : null;
        const describedBy = error ? errorId : undefined;
        const textValue = typeof input.value === 'string' ? input.value : '';
        const listValue = Array.isArray(input.value) ? input.value : [];

        if (field.type === 'boolean' || field.type === 'single_choice') {
          const options =
            field.type === 'boolean'
              ? BOOLEAN_OPTIONS
              : (field.options ?? []).map((option) => ({
                  value: option,
                  label: option,
                }));

          return (
            <fieldset
              className="m-0 grid gap-1 border-0 p-0"
              aria-describedby={describedBy}
              aria-invalid={!!error || undefined}
            >
              <legend className={`${ANAMNESIS_LABEL_CLASS} mb-1.5`}>
                {field.label}
                {hint}
              </legend>
              {options.map((option) => (
                <label key={option.value} className={ANAMNESIS_CHECK_CLASS}>
                  <input
                    type="radio"
                    name={inputId}
                    value={option.value}
                    checked={textValue === option.value}
                    onChange={() => input.onChange(option.value)}
                    onBlur={input.onBlur}
                    className={ANAMNESIS_CHECK_INPUT_CLASS}
                  />
                  {option.label}
                </label>
              ))}
              {errorNode}
            </fieldset>
          );
        }

        if (field.type === 'multiple_choice') {
          return (
            <fieldset
              className="m-0 grid gap-1 border-0 p-0"
              aria-describedby={describedBy}
              aria-invalid={!!error || undefined}
            >
              <legend className={`${ANAMNESIS_LABEL_CLASS} mb-1.5`}>
                {field.label}
                {hint}
              </legend>
              {(field.options ?? []).map((option) => (
                <label key={option} className={ANAMNESIS_CHECK_CLASS}>
                  <input
                    type="checkbox"
                    value={option}
                    checked={listValue.includes(option)}
                    onChange={(event) =>
                      input.onChange(
                        event.target.checked
                          ? [...listValue, option]
                          : listValue.filter((item) => item !== option),
                      )
                    }
                    onBlur={input.onBlur}
                    className={ANAMNESIS_CHECK_INPUT_CLASS}
                  />
                  {option}
                </label>
              ))}
              {errorNode}
            </fieldset>
          );
        }

        return (
          <label className={ANAMNESIS_LABEL_CLASS} htmlFor={inputId}>
            <span>
              {field.label}
              {hint}
            </span>
            {field.type === 'textarea' ? (
              <textarea
                id={inputId}
                ref={input.ref}
                name={input.name}
                value={textValue}
                onChange={input.onChange}
                onBlur={input.onBlur}
                aria-invalid={!!error || undefined}
                aria-describedby={describedBy}
                className={ANAMNESIS_TEXTAREA_CLASS}
              />
            ) : (
              <input
                id={inputId}
                ref={input.ref}
                name={input.name}
                type={field.type === 'date' ? 'date' : 'text'}
                value={textValue}
                onChange={input.onChange}
                onBlur={input.onBlur}
                aria-invalid={!!error || undefined}
                aria-describedby={describedBy}
                className={ANAMNESIS_INPUT_CLASS}
              />
            )}
            {errorNode}
          </label>
        );
      }}
    />
  );
};
