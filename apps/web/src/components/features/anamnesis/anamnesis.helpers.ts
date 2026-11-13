import type {
  TAnamnesisAnswers,
  TAnamnesisAnswerValue,
  TAnamnesisField,
} from '@/types/api/anamnesis.types';
import { z } from 'zod';
import type {
  TAnamnesisAnswerInput,
  TAnamnesisFormValues,
} from './anamnesis.types';

/** Mesmos limites da API (`anamnesis.helpers.ts`). */
export const ANAMNESIS_MAX_TEXT = 2000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Valor dos rádios de "sim ou não". */
export const BOOLEAN_YES = 'sim';
export const BOOLEAN_NO = 'nao';

const SHORT_WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const LONG_WEEKDAYS = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
];

const parseDateKey = (dateKey: string) => {
  const [year = 0, month = 1, day = 1] = dateKey
    .slice(0, 10)
    .split('-')
    .map(Number);

  return { year, month, day };
};

/** Dia da semana em UTC: o fuso do navegador não muda o dia. */
const getWeekdayIndex = (dateKey: string) => {
  const { year, month, day } = parseDateKey(dateKey);

  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

const pad = (value: number) => String(value).padStart(2, '0');

/** "2026-11-18" → "18/11". */
export const formatDayMonth = (dateKey: string) => {
  const { month, day } = parseDateKey(dateKey);

  return `${pad(day)}/${pad(month)}`;
};

/** "2026-11-18" → "Qua, 18/11". */
export const formatShortDay = (dateKey: string) =>
  `${SHORT_WEEKDAYS[getWeekdayIndex(dateKey)] ?? ''}, ${formatDayMonth(dateKey)}`;

/** "2026-11-18" → "quarta". */
export const getLongWeekday = (dateKey: string) =>
  LONG_WEEKDAYS[getWeekdayIndex(dateKey)] ?? '';

/** Data e hora locais de um instante: "18/11 às 09:12". */
export const formatDateTime = (value: string | number | Date) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} às ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** Só a hora local de um instante: "09:40". */
export const formatTime = (value: string | number | Date) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ''
    : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const isChoice = (field: TAnamnesisField) =>
  field.type === 'single_choice' || field.type === 'multiple_choice';

/** Regra de cada pergunta, igual à que a API confere. */
const buildFieldSchema = (field: TAnamnesisField) => {
  if (field.type === 'multiple_choice') {
    const options = z.array(z.string());

    return field.required
      ? options.min(1, 'Escolha ao menos uma opção')
      : options;
  }

  const text = z
    .string()
    .max(ANAMNESIS_MAX_TEXT, `Use até ${ANAMNESIS_MAX_TEXT} caracteres`)
    .refine(
      (value) => field.type !== 'date' || !value || DATE_PATTERN.test(value),
      'Data inválida',
    );

  return field.required
    ? text.refine(
        (value) => value.trim().length > 0,
        isChoice(field) || field.type === 'boolean'
          ? 'Escolha uma opção'
          : 'Responda esta pergunta',
      )
    : text;
};

export const buildAnamnesisSchema = (fields: TAnamnesisField[]) =>
  z.object({
    answers: z.object(
      Object.fromEntries(
        fields.map((field) => [field.id, buildFieldSchema(field)]),
      ),
    ),
    consent: z
      .boolean()
      .refine(Boolean, 'Marque a autorização para enviar a ficha'),
  });

export const getEmptyAnswers = (
  fields: TAnamnesisField[],
): TAnamnesisFormValues => ({
  answers: Object.fromEntries(
    fields.map((field) => [
      field.id,
      field.type === 'multiple_choice' ? [] : '',
    ]),
  ),
  consent: false,
});

const toAnswerValue = (
  field: TAnamnesisField,
  value: TAnamnesisAnswerInput | undefined,
): TAnamnesisAnswerValue => {
  if (Array.isArray(value)) return value.length ? value : null;

  const text = (value ?? '').trim();

  if (!text) return null;
  if (field.type === 'boolean') return text === BOOLEAN_YES;

  return text;
};

/** O que vai para a API: cada pergunta no tipo certo, vazias como `null`. */
export const toAnamnesisAnswers = (
  fields: TAnamnesisField[],
  answers: TAnamnesisFormValues['answers'],
): TAnamnesisAnswers =>
  Object.fromEntries(
    fields.map((field) => [field.id, toAnswerValue(field, answers[field.id])]),
  );
