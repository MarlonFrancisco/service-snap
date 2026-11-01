import type { ReactNode } from 'react';

export type TLegalTab = 'terms' | 'privacy';

export type TLegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export type TLegalTocItem = Pick<TLegalSection, 'id' | 'title'>;

export type TLegalDocumentConfig = {
  activeTab: TLegalTab;
  title: string;
  updatedAt: string;
  sections: TLegalSection[];
};

export type TLegalTocConfig = {
  items: TLegalTocItem[];
};
