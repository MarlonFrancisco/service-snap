import type { ReactNode } from 'react';

export type TPartnerConfig = {
  children: ReactNode;
};

export type TStore = {
  id: string;
  name: string;
  address: string;
};

export type TModuleConfig = {
  title: string;
  description: string;
  showStoreSelector?: boolean;
};
