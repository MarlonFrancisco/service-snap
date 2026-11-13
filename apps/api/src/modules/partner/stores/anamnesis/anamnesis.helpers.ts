import { BadRequestException } from '@nestjs/common';
import { signHmac } from '../../../../utils/helpers/crypto.helpers';
import type {
  TAnamnesisAnswers,
  TAnamnesisAnswerValue,
  TAnamnesisField,
} from './anamnesis.types';

/** Fica gravado com a resposta: é o texto que o cliente aceitou. */
export const buildAnamnesisConsentText = (storeName?: string | null) =>
  `Autorizo ${storeName?.trim() || 'a loja'} a guardar estas informações de saúde para o meu atendimento. Só a loja tem acesso, e posso pedir a exclusão a qualquer momento.`;

const MAX_TEXT = 2000;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Segredo dos links de anamnese, derivado da chave de dados com um rótulo
 * próprio: a mesma chave não assina e cifra com o mesmo valor.
 */
export const deriveAnamnesisLinkSecret = (key: Buffer) =>
  signHmac(key.toString('base64'), 'anamnesis-link-v1');

/** Pergunta vazia não conta: o painel pode mandar linhas em branco. */
export const normalizeFields = (fields: TAnamnesisField[]) => {
  const ids = new Set<string>();

  return fields.map((field) => {
    if (ids.has(field.id)) {
      throw new BadRequestException(`Duplicated field id ${field.id}`);
    }
    ids.add(field.id);

    const isChoice =
      field.type === 'single_choice' || field.type === 'multiple_choice';

    if (isChoice && !field.options?.filter(Boolean).length) {
      throw new BadRequestException(`Field ${field.id} needs options`);
    }

    return {
      id: field.id,
      label: field.label.trim(),
      type: field.type,
      required: Boolean(field.required),
      ...(isChoice && { options: field.options.filter(Boolean) }),
    };
  });
};

const isEmpty = (value: TAnamnesisAnswerValue | undefined) =>
  value == null || value === '' || (Array.isArray(value) && value.length === 0);

const assertAnswer = (
  field: TAnamnesisField,
  value: TAnamnesisAnswerValue,
): TAnamnesisAnswerValue => {
  const invalid = () =>
    new BadRequestException(`Invalid answer for "${field.label}"`);

  switch (field.type) {
    case 'boolean':
      if (typeof value !== 'boolean') throw invalid();
      return value;
    case 'date':
      if (typeof value !== 'string' || !DATE.test(value)) throw invalid();
      return value;
    case 'single_choice':
      if (typeof value !== 'string' || !field.options?.includes(value)) {
        throw invalid();
      }
      return value;
    case 'multiple_choice':
      if (
        !Array.isArray(value) ||
        value.some((option) => !field.options?.includes(option))
      ) {
        throw invalid();
      }
      return [...new Set(value)];
    default:
      if (typeof value !== 'string' || value.length > MAX_TEXT) throw invalid();
      return value.trim();
  }
};

/** Só as perguntas do formulário, no tipo certo; as obrigatórias precisam vir. */
export const validateAnswers = (
  fields: TAnamnesisField[],
  answers: Record<string, unknown>,
): TAnamnesisAnswers =>
  Object.fromEntries(
    fields.map((field) => {
      const value = answers?.[field.id] as TAnamnesisAnswerValue | undefined;

      if (isEmpty(value)) {
        if (field.required) {
          throw new BadRequestException(`"${field.label}" is required`);
        }
        return [field.id, null];
      }

      return [field.id, assertAnswer(field, value)];
    }),
  );

/** Formulário vale para o serviço quando não tem lista ou o serviço está nela. */
export const formAppliesTo = (
  form: { serviceIds: string[] },
  serviceIds: string[],
) =>
  !form.serviceIds.length ||
  serviceIds.some((serviceId) => form.serviceIds.includes(serviceId));
