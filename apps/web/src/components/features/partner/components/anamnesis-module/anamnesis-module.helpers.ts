import { formatDateTime } from '@/components/features/anamnesis/anamnesis.helpers';
import { isApiHttpError } from '@/service/api';
import type {
  IAnamnesisForm,
  TAnamnesisAnswerValue,
  TAnamnesisField,
  TAnamnesisFieldType,
} from '@/types/api/anamnesis.types';
import type { IProfessional } from '@/types/api/users.types';
import { formatDay } from '../customers-module/customers-module.helpers';

export const ANAMNESIS_MAX_FIELDS = 60;
export const ANAMNESIS_MAX_OPTIONS = 30;
export const ANAMNESIS_MAX_LABEL = 200;
export const ANAMNESIS_MAX_OPTION_LENGTH = 100;
export const ANAMNESIS_MAX_NAME = 100;
export const ANAMNESIS_MAX_DESCRIPTION = 500;
const FIELD_ID_LENGTH = 40;

export const ANAMNESIS_FIELD_TYPE_LABELS: Record<TAnamnesisFieldType, string> =
  {
    boolean: 'Sim ou não',
    text: 'Texto curto',
    textarea: 'Texto longo',
    single_choice: 'Uma escolha',
    multiple_choice: 'Várias escolhas',
    date: 'Data',
  };

export const isChoiceType = (type: TAnamnesisFieldType) =>
  type === 'single_choice' || type === 'multiple_choice';

/**
 * Id estável da pergunta a partir do texto ("Tem alguma alergia?" →
 * "tem_alguma_alergia"), sem repetir os que já existem.
 */
export const createFieldId = (label: string, existingIds: string[]) => {
  const base =
    label
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, FIELD_ID_LENGTH - 4) || 'pergunta';
  const taken = new Set(existingIds);

  if (!taken.has(base)) return base;

  const suffix = Array.from(
    { length: ANAMNESIS_MAX_FIELDS + 1 },
    (_, i) => i + 2,
  )
    .map((index) => `${base}_${index}`)
    .find((candidate) => !taken.has(candidate));

  return (
    suffix ?? `${base}_${Date.now().toString(36)}`.slice(0, FIELD_ID_LENGTH)
  );
};

/** "Anticoagulante, Outro" ou uma por linha → lista limpa e sem repetir. */
export const parseOptions = (text: string) => [
  ...new Set(
    text
      .split(/[\n,]/)
      .map((option) => option.trim())
      .filter(Boolean),
  ),
];

/** "Texto longo · obrigatória". */
export const describeField = (field: TAnamnesisField) =>
  [
    ANAMNESIS_FIELD_TYPE_LABELS[field.type],
    field.required ? 'obrigatória' : null,
  ]
    .filter(Boolean)
    .join(' · ');

/** Resposta como texto para a ficha do cliente. */
export const formatAnswer = (
  field: TAnamnesisField,
  value: TAnamnesisAnswerValue | undefined,
) => {
  if (value === null || value === undefined || value === '') {
    return 'Não respondida';
  }
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : 'Não respondida';
  }
  if (field.type === 'date') return formatDay(value) || value;

  return value;
};

export const formatConsent = (consentAt: string) =>
  `Consentimento em ${formatDateTime(consentAt)}`;

/** Ficha vale para o serviço quando está ativa e não tem lista ou ele está nela. */
export const getApplicableForms = (
  forms: IAnamnesisForm[],
  serviceId: string | undefined,
) =>
  forms.filter(
    (form) =>
      form.isActive &&
      (!form.serviceIds.length ||
        (!!serviceId && form.serviceIds.includes(serviceId))),
  );

export const getMemberName = (
  members: IProfessional[],
  memberId: string | null | undefined,
) => {
  const member = members.find(({ id }) => id === memberId);
  const name = [member?.user?.firstName, member?.user?.lastName]
    .filter(Boolean)
    .join(' ');

  return name || 'Profissional';
};

const FORM_ERROR_MESSAGES: Record<string, string> = {
  'Service not found in this store':
    'Um dos serviços não existe mais nesta loja. Recarregue a página.',
  'Form not found': 'Esta ficha não existe mais. Recarregue a página.',
};

/** Erro ao salvar a ficha em uma frase para a equipe. */
export const getSaveFormErrorMessage = (error: unknown) => {
  if (!isApiHttpError(error)) {
    return 'Não foi possível salvar a ficha. Verifique a conexão e tente de novo.';
  }
  if (error.status === 403) return 'Só dono e gerente editam as fichas.';
  if (error.message.startsWith('Duplicated field id')) {
    return 'Duas perguntas ficaram com o mesmo identificador. Mude o texto de uma delas.';
  }
  if (error.message.endsWith('needs options')) {
    return 'Toda pergunta de escolha precisa de opções.';
  }

  return (
    FORM_ERROR_MESSAGES[error.message] ??
    'Não foi possível salvar a ficha. Confira os campos e tente de novo.'
  );
};
