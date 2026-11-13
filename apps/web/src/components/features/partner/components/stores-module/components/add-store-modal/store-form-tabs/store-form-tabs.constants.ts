import type { TStoreFormTabDefinition } from './store-form-tabs.types';

/** Valores que a API grava numa loja nova (ver `store.entity.ts`). */
export const STORE_SCHEDULE_RULES_DEFAULTS = {
  slotIntervalMinutes: 30,
  bufferMinutes: 0,
  minAdvanceMinutes: 0,
  maxAdvanceDays: 0,
  cancellationNoticeHours: 0,
  rescheduleNoticeHours: 0,
} as const;

/** Campos que só existem em loja já criada: a criação não os envia. */
export const SAVED_STORE_ONLY_FIELDS = [
  'slug',
  ...Object.keys(STORE_SCHEDULE_RULES_DEFAULTS),
] as const;

export const STORE_FORM_TABS: readonly TStoreFormTabDefinition[] = [
  {
    value: 'basic',
    label: 'Informações',
    requiresSavedStore: false,
    fields: [
      'name',
      'description',
      'slug',
      'address',
      'city',
      'state',
      'zipCode',
      'amenities',
    ],
  },
  {
    value: 'region',
    label: 'Região e moeda',
    requiresSavedStore: false,
    fields: ['country', 'currency', 'timezone'],
  },
  {
    value: 'contact',
    label: 'Contato',
    requiresSavedStore: false,
    fields: ['telephone', 'email', 'website', 'instagram', 'facebook'],
  },
  {
    value: 'hours',
    label: 'Horários',
    requiresSavedStore: false,
    fields: [
      'openTime',
      'closeTime',
      'lunchStartTime',
      'lunchEndTime',
      'businessDays',
    ],
  },
  {
    value: 'schedule',
    label: 'Agenda',
    requiresSavedStore: true,
    fields: [
      'slotIntervalMinutes',
      'bufferMinutes',
      'minAdvanceMinutes',
      'maxAdvanceDays',
      'cancellationNoticeHours',
      'rescheduleNoticeHours',
    ],
  },
  {
    value: 'holidays',
    label: 'Feriados',
    requiresSavedStore: true,
    fields: [],
  },
  {
    value: 'gallery',
    label: 'Galeria',
    requiresSavedStore: true,
    fields: ['gallery'],
  },
  {
    value: 'staff',
    label: 'Equipe',
    requiresSavedStore: true,
    fields: ['storeMembers'],
  },
];
