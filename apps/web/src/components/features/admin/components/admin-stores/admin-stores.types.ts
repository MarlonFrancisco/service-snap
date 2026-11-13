import type { ReactNode } from 'react';
import type { TAdminStoreRow } from '../../admin.types';

export type TAdminStoresConfig = {
  /** `h1` na página de lojas; `h2` quando vem abaixo da visão geral. */
  headingLevel: 'h1' | 'h2';
  /** Conteúdo acima da lista, na mesma coluna (título e números da visão geral). */
  intro?: ReactNode;
};

export type TAdminStoresTableConfig = {
  rows: TAdminStoreRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isRefreshing: boolean;
};
