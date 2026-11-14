import type { TApiKeyRow } from '../../integrations-module.types';

export type TApiKeysCardConfig = {
  storeId: string;
};

export type TApiKeysTableConfig = {
  rows: TApiKeyRow[];
  onRevoke: (row: TApiKeyRow) => void;
};
