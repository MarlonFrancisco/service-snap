import type { TStoreFormTabDefinition } from './store-form-tabs.types';

export const STORE_FORM_TABS: readonly TStoreFormTabDefinition[] = [
  {
    value: 'basic',
    label: 'Informações',
    requiresSavedStore: false,
    fields: [
      'name',
      'description',
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
