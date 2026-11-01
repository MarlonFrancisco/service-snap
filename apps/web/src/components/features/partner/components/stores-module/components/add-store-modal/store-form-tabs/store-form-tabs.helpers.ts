import { INITIAL_STORE } from '@/store/admin/stores/stores.constants';
import type { IStore } from '@/types/api/stores.types';
import type { FieldErrors } from 'react-hook-form';
import { STORE_FORM_TABS } from './store-form-tabs.constants';
import type { TStoreFormTabDefinition } from './store-form-tabs.types';
import type { TStoreFormSchema } from './store-form.schema';

export const getTabsWithErrors = (
  errors: FieldErrors<TStoreFormSchema>,
): TStoreFormTabDefinition[] =>
  STORE_FORM_TABS.filter((tab) => tab.fields.some((field) => errors[field]));

/**
 * A listagem traz colunas null e não traz `storeMembers`, e o schema recusa os
 * dois casos: sem isto, editar uma loja da lista nunca passa na validação. A
 * equipe vem de `useStoreMembersQuery` e não entra no payload, então fica vazia.
 */
export const toStoreFormValues = (store: IStore): TStoreFormSchema => {
  const filledValues = Object.fromEntries(
    Object.entries(store).filter(([, value]) => value !== null),
  );

  return {
    ...INITIAL_STORE,
    ...filledValues,
    // Almoço é opcional: o padrão de loja nova não pode preencher loja existente.
    lunchStartTime: store.lunchStartTime ?? '',
    lunchEndTime: store.lunchEndTime ?? '',
    storeMembers: [],
  } as TStoreFormSchema;
};
